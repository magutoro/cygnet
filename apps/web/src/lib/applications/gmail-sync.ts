import type { SupabaseClient } from "@supabase/supabase-js";
import {
  APPLICATION_STATUS_ORDER,
  DEFAULT_APPLICATION_INPUT,
  applicationInputToDb,
  dbApplicationToApplication,
  type Application,
  type ApplicationInput,
  type ApplicationStatus,
  type DbApplication,
  type DbGoogleWorkspaceIntegration,
  type GoogleWorkspaceIntegrationSummary,
  GOOGLE_WORKSPACE_SCOPES,
  dbGoogleWorkspaceIntegrationToSummary,
} from "@cygnet/shared";
import {
  GOOGLE_WORKSPACE_DEFAULT_LABEL,
  decryptGoogleRefreshToken,
  ensureGmailLabel,
  getGmailMessageDetail,
  getGoogleWorkspaceEmail,
  hasGoogleScope,
  listGmailMessages,
  refreshGoogleWorkspaceAccessToken,
  splitGrantedScopes,
  encryptGoogleRefreshToken,
} from "@/lib/google-workspace";

const STATUS_PRIORITY: Record<ApplicationStatus, number> = APPLICATION_STATUS_ORDER.reduce(
  (acc, status, index) => {
    acc[status] = index;
    return acc;
  },
  {} as Record<ApplicationStatus, number>,
);

const INTERVIEW_KEYWORDS = ["interview", "面接", "面談", "interview invitation", "面接日程"];
const OFFER_KEYWORDS = ["offer", "内定", "採用決定"];
const REJECTED_KEYWORDS = ["rejected", "見送り", "不採用", "選考結果", "regret"];
const SCREENING_KEYWORDS = ["screening", "書類選考", "selection", "review"];
const APPLIED_KEYWORDS = ["application received", "応募受付", "thanks for applying", "ご応募"];

export interface GmailSyncResult {
  applications: Application[];
  integration: GoogleWorkspaceIntegrationSummary;
  importedCount: number;
  updatedCount: number;
}

interface ParsedContact {
  name: string;
  email: string;
}

function inferStatus(text: string): ApplicationStatus {
  const normalized = text.toLowerCase();
  if (OFFER_KEYWORDS.some((keyword) => normalized.includes(keyword))) return "offer";
  if (REJECTED_KEYWORDS.some((keyword) => normalized.includes(keyword))) return "rejected";
  if (INTERVIEW_KEYWORDS.some((keyword) => normalized.includes(keyword))) return "interview";
  if (SCREENING_KEYWORDS.some((keyword) => normalized.includes(keyword))) return "screening";
  if (APPLIED_KEYWORDS.some((keyword) => normalized.includes(keyword))) return "applied";
  return "saved";
}

function parseContact(fromValue: string): ParsedContact {
  const match = fromValue.match(/^(.*?)(?:<([^>]+)>)?$/);
  const rawName = String(match?.[1] || "").replace(/["<>]/g, "").trim();
  const email = String(match?.[2] || (rawName.includes("@") ? rawName : "")).trim();
  return {
    name: email === rawName ? "" : rawName,
    email,
  };
}

function titleCaseHost(host: string): string {
  return host
    .split(".")
    .filter((part) => part && part !== "www" && part !== "com" && part !== "co" && part !== "jp")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function inferCompanyName(subject: string, fromValue: string, bodyText: string): string {
  const subjectBracket =
    subject.match(/【([^】]+)】/)?.[1] ||
    subject.match(/\[([^\]]+)\]/)?.[1] ||
    "";
  if (subjectBracket) return subjectBracket.trim();

  const contact = parseContact(fromValue);
  if (contact.name && !/no-?reply|noreply|notification|採用担当|recruit/i.test(contact.name)) {
    return contact.name.trim();
  }

  const bodyMatch = bodyText.match(/(?:株式会社|有限会社|合同会社)?[A-Z][A-Za-z0-9&.\-\s]{2,40}/);
  if (bodyMatch) return bodyMatch[0].trim();

  const emailHost = contact.email.split("@")[1] || "";
  return titleCaseHost(emailHost);
}

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function toDateString(year: number, month: number, day: number): string {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

function inferDateFromMonthDay(month: number, day: number): string {
  const now = new Date();
  let year = now.getFullYear();
  const candidate = new Date(`${toDateString(year, month, day)}T00:00:00`);
  if (candidate.getTime() < now.getTime() - 1000 * 60 * 60 * 24 * 30) {
    year += 1;
  }
  return toDateString(year, month, day);
}

function extractDate(text: string): string {
  const isoMatch = text.match(/(20\d{2})[\/\-.](\d{1,2})[\/\-.](\d{1,2})/);
  if (isoMatch) {
    return toDateString(Number(isoMatch[1]), Number(isoMatch[2]), Number(isoMatch[3]));
  }

  const jaMatch = text.match(/(\d{1,2})月(\d{1,2})日/);
  if (jaMatch) {
    return inferDateFromMonthDay(Number(jaMatch[1]), Number(jaMatch[2]));
  }

  const slashMatch = text.match(/(\d{1,2})\/(\d{1,2})/);
  if (slashMatch) {
    return inferDateFromMonthDay(Number(slashMatch[1]), Number(slashMatch[2]));
  }

  return "";
}

function normalizeTime(hour: string, minute: string): string {
  return `${pad2(Number(hour))}:${pad2(Number(minute))}`;
}

function extractTimes(text: string): { start: string; end: string } {
  const rangeMatch = text.match(/(\d{1,2}):(\d{2})\s*(?:-|〜|~|to)\s*(\d{1,2}):(\d{2})/i);
  if (rangeMatch) {
    return {
      start: normalizeTime(rangeMatch[1], rangeMatch[2]),
      end: normalizeTime(rangeMatch[3], rangeMatch[4]),
    };
  }

  const singleMatch = text.match(/(\d{1,2}):(\d{2})/);
  if (singleMatch) {
    return {
      start: normalizeTime(singleMatch[1], singleMatch[2]),
      end: "",
    };
  }

  return { start: "", end: "" };
}

function parseMessageToDraft(detail: {
  subject: string;
  from: string;
  snippet: string;
  bodyText: string;
  threadId: string;
  id: string;
}): ApplicationInput {
  const combined = [detail.subject, detail.snippet, detail.bodyText].filter(Boolean).join("\n");
  const { start, end } = extractTimes(combined);
  const contact = parseContact(detail.from);

  return {
    ...DEFAULT_APPLICATION_INPUT,
    companyName: inferCompanyName(detail.subject, detail.from, detail.bodyText),
    roleTitle: "",
    sourceSite: "Gmail / Cygnet",
    applicationUrl: "",
    status: inferStatus(combined),
    appliedAt: "",
    nextStepLabel: detail.subject.trim().slice(0, 120),
    nextStepAt: extractDate(combined),
    nextStepStartTime: start,
    nextStepEndTime: end,
    contactName: contact.name,
    contactEmail: contact.email,
    notes: "",
    captureSource: "gmail_sync",
    gmailThreadId: detail.threadId,
    gmailMessageId: detail.id,
    calendarProvider: "",
    calendarEventId: "",
    calendarEventUrl: "",
  };
}

function shouldUpgradeStatus(current: ApplicationStatus, incoming: ApplicationStatus): boolean {
  return STATUS_PRIORITY[incoming] >= STATUS_PRIORITY[current];
}

function mergeDraft(existing: Application, incoming: ApplicationInput): ApplicationInput {
  const mergedStatus =
    incoming.status !== "saved" && shouldUpgradeStatus(existing.status, incoming.status)
      ? incoming.status
      : existing.status;

  return {
    companyName: existing.companyName || incoming.companyName,
    roleTitle: existing.roleTitle || incoming.roleTitle,
    sourceSite: existing.sourceSite || incoming.sourceSite,
    applicationUrl: existing.applicationUrl || incoming.applicationUrl,
    status: mergedStatus,
    appliedAt: existing.appliedAt || incoming.appliedAt,
    nextStepLabel: incoming.nextStepLabel || existing.nextStepLabel,
    nextStepAt: incoming.nextStepAt || existing.nextStepAt,
    nextStepStartTime: incoming.nextStepStartTime || existing.nextStepStartTime,
    nextStepEndTime: incoming.nextStepEndTime || existing.nextStepEndTime,
    contactName: existing.contactName || incoming.contactName,
    contactEmail: existing.contactEmail || incoming.contactEmail,
    notes: existing.notes || incoming.notes,
    captureSource: existing.captureSource,
    gmailThreadId: incoming.gmailThreadId || existing.gmailThreadId,
    gmailMessageId: incoming.gmailMessageId || existing.gmailMessageId,
    calendarProvider: existing.calendarProvider,
    calendarEventId: existing.calendarEventId,
    calendarEventUrl: existing.calendarEventUrl,
  };
}

async function loadApplications(
  supabase: SupabaseClient,
  userId: string,
): Promise<Application[]> {
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .returns<DbApplication[]>();

  if (error) throw error;
  return (data ?? []).map(dbApplicationToApplication);
}

async function updateIntegrationStatus(
  supabase: SupabaseClient,
  userId: string,
  values: Partial<DbGoogleWorkspaceIntegration>,
) {
  const { error } = await supabase
    .from("google_workspace_integrations")
    .update(values)
    .eq("user_id", userId);

  if (error) throw error;
}

export async function upsertGoogleWorkspaceIntegration(
  supabase: SupabaseClient,
  userId: string,
  values: {
    googleEmail: string;
    scopes: string[];
    labelName?: string;
    refreshToken: string;
  },
): Promise<GoogleWorkspaceIntegrationSummary> {
  const payload = {
    user_id: userId,
    google_email: values.googleEmail,
    scopes: values.scopes,
    label_name: values.labelName || GOOGLE_WORKSPACE_DEFAULT_LABEL,
    refresh_token_encrypted: encryptGoogleRefreshToken(values.refreshToken),
    last_sync_error: "",
  };

  const { data, error } = await supabase
    .from("google_workspace_integrations")
    .upsert(payload, { onConflict: "user_id" })
    .select("*")
    .single<DbGoogleWorkspaceIntegration>();

  if (error) throw error;
  return dbGoogleWorkspaceIntegrationToSummary(data);
}

export async function getGoogleWorkspaceIntegrationSummary(
  supabase: SupabaseClient,
  userId: string,
): Promise<GoogleWorkspaceIntegrationSummary> {
  const { data, error } = await supabase
    .from("google_workspace_integrations")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle<DbGoogleWorkspaceIntegration>();

  if (error) throw error;
  return dbGoogleWorkspaceIntegrationToSummary(data);
}

export async function getGoogleWorkspaceIntegrationRow(
  supabase: SupabaseClient,
  userId: string,
): Promise<DbGoogleWorkspaceIntegration | null> {
  const { data, error } = await supabase
    .from("google_workspace_integrations")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle<DbGoogleWorkspaceIntegration>();

  if (error) throw error;
  return data ?? null;
}

export async function syncGmailForUser(
  supabase: SupabaseClient,
  userId: string,
  integration: DbGoogleWorkspaceIntegration,
): Promise<GmailSyncResult> {
  const refreshToken = decryptGoogleRefreshToken(integration.refresh_token_encrypted);
  try {
    const refreshed = await refreshGoogleWorkspaceAccessToken(refreshToken);
    const accessToken = refreshed.access_token;
    const scopes = splitGrantedScopes(refreshed.scope || integration.scopes.join(" "));

    if (!hasGoogleScope(scopes, GOOGLE_WORKSPACE_SCOPES.gmailReadonly)) {
      throw new Error("Gmail read scope is missing");
    }

    const googleEmail =
      integration.google_email || (await getGoogleWorkspaceEmail(accessToken));
    const label = await ensureGmailLabel(accessToken, integration.label_name || GOOGLE_WORKSPACE_DEFAULT_LABEL);
    const refs = await listGmailMessages(accessToken, label.id, 20);
    const currentApps = await loadApplications(supabase, userId);
    const byThreadId = new Map(
      currentApps.filter((item) => item.gmailThreadId).map((item) => [item.gmailThreadId, item]),
    );

    let importedCount = 0;
    let updatedCount = 0;

    for (const ref of refs) {
      const detail = await getGmailMessageDetail(accessToken, ref.id);
      const incomingDraft = parseMessageToDraft(detail);
      const existing = byThreadId.get(detail.threadId);

      if (existing) {
        const merged = mergeDraft(existing, incomingDraft);
        const { data, error } = await supabase
          .from("applications")
          .update(applicationInputToDb(merged))
          .eq("id", existing.id)
          .eq("user_id", userId)
          .select("*")
          .single<DbApplication>();

        if (error) throw error;
        byThreadId.set(detail.threadId, dbApplicationToApplication(data));
        updatedCount += 1;
        continue;
      }

      const { data, error } = await supabase
        .from("applications")
        .insert([{ user_id: userId, ...applicationInputToDb(incomingDraft) }])
        .select("*")
        .single<DbApplication>();

      if (error) throw error;
      const created = dbApplicationToApplication(data);
      byThreadId.set(detail.threadId, created);
      importedCount += 1;
    }

    const safeSummary = dbGoogleWorkspaceIntegrationToSummary({
      ...integration,
      google_email: googleEmail,
      scopes,
      label_name: label.name,
      refresh_token_encrypted: integration.refresh_token_encrypted,
      last_synced_at: new Date().toISOString(),
      last_sync_error: "",
    });

    await updateIntegrationStatus(supabase, userId, {
      google_email: googleEmail,
      scopes,
      label_name: label.name,
      last_synced_at: new Date().toISOString(),
      last_sync_error: "",
    });

    const applications = await loadApplications(supabase, userId);
    return {
      applications,
      integration: safeSummary,
      importedCount,
      updatedCount,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await updateIntegrationStatus(supabase, userId, {
      last_sync_error: message,
    });
    throw error;
  }
}
