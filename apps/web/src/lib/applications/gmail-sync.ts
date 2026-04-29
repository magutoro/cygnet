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
  upsertGoogleCalendarEvent,
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
  calendarSyncedCount: number;
  calendarSyncError?: string;
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

const ENGLISH_MONTHS: Record<string, number> = {
  jan: 1,
  january: 1,
  feb: 2,
  february: 2,
  mar: 3,
  march: 3,
  apr: 4,
  april: 4,
  may: 5,
  jun: 6,
  june: 6,
  jul: 7,
  july: 7,
  aug: 8,
  august: 8,
  sep: 9,
  sept: 9,
  september: 9,
  oct: 10,
  october: 10,
  nov: 11,
  november: 11,
  dec: 12,
  december: 12,
};

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

  const monthNameMatch = text.match(
    /\b(?:mon(?:day)?|tue(?:sday)?|wed(?:nesday)?|thu(?:rsday)?|fri(?:day)?|sat(?:urday)?|sun(?:day)?)?,?\s*(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t|tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\.?\s+(\d{1,2})(?:st|nd|rd|th)?(?:,\s*(20\d{2}))?\b/i,
  );
  if (monthNameMatch) {
    const month = ENGLISH_MONTHS[monthNameMatch[1].toLowerCase()];
    const day = Number(monthNameMatch[2]);
    const year = monthNameMatch[3] ? Number(monthNameMatch[3]) : null;
    return year ? toDateString(year, month, day) : inferDateFromMonthDay(month, day);
  }

  const dayMonthNameMatch = text.match(
    /\b(\d{1,2})(?:st|nd|rd|th)?\s+(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t|tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)(?:\.|,)?(?:\s+(20\d{2}))?\b/i,
  );
  if (dayMonthNameMatch) {
    const day = Number(dayMonthNameMatch[1]);
    const month = ENGLISH_MONTHS[dayMonthNameMatch[2].toLowerCase()];
    const year = dayMonthNameMatch[3] ? Number(dayMonthNameMatch[3]) : null;
    return year ? toDateString(year, month, day) : inferDateFromMonthDay(month, day);
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

async function syncApplicationToGoogleCalendar(
  supabase: SupabaseClient,
  userId: string,
  application: Application,
  accessToken: string,
): Promise<Application> {
  const event = await upsertGoogleCalendarEvent(accessToken, application);
  const { data, error } = await supabase
    .from("applications")
    .update({
      calendar_provider: "google",
      calendar_event_id: event.id,
      calendar_event_url: event.htmlLink,
    })
    .eq("id", application.id)
    .eq("user_id", userId)
    .select("*")
    .single<DbApplication>();

  if (error || !data) {
    throw error ?? new Error("calendar_update_failed");
  }

  return dbApplicationToApplication(data);
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
  options: {
    accessToken?: string;
    grantedScopes?: string[];
  } = {},
): Promise<GmailSyncResult> {
  try {
    let accessToken = String(options.accessToken || "").trim();
    let scopes = options.grantedScopes?.length ? options.grantedScopes : integration.scopes;

    if (!accessToken) {
      const refreshToken = decryptGoogleRefreshToken(integration.refresh_token_encrypted);
      const refreshed = await refreshGoogleWorkspaceAccessToken(refreshToken);
      accessToken = refreshed.access_token;
      scopes = splitGrantedScopes(refreshed.scope || integration.scopes.join(" "));
    }

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
    let calendarSyncedCount = 0;
    let calendarSyncError = "";
    const shouldAutoSyncCalendar =
      integration.auto_calendar_sync_enabled !== false &&
      hasGoogleScope(scopes, GOOGLE_WORKSPACE_SCOPES.calendarEvents);

    const maybeAutoSyncCalendar = async (application: Application): Promise<Application> => {
      if (
        !shouldAutoSyncCalendar ||
        application.captureSource !== "gmail_sync" ||
        !application.nextStepAt
      ) {
        return application;
      }

      try {
        const synced = await syncApplicationToGoogleCalendar(
          supabase,
          userId,
          application,
          accessToken,
        );
        calendarSyncedCount += 1;
        return synced;
      } catch (error) {
        calendarSyncError = error instanceof Error ? error.message : String(error);
        console.error("Auto Google Calendar sync failed", error);
        return application;
      }
    };

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
        const synced = await maybeAutoSyncCalendar(dbApplicationToApplication(data));
        byThreadId.set(detail.threadId, synced);
        updatedCount += 1;
        continue;
      }

      const { data, error } = await supabase
        .from("applications")
        .insert([{ user_id: userId, ...applicationInputToDb(incomingDraft) }])
        .select("*")
        .single<DbApplication>();

      if (error) throw error;
      const created = await maybeAutoSyncCalendar(dbApplicationToApplication(data));
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
      last_sync_error: calendarSyncError,
    });

    await updateIntegrationStatus(supabase, userId, {
      google_email: googleEmail,
      scopes,
      label_name: label.name,
      last_synced_at: new Date().toISOString(),
      last_sync_error: calendarSyncError,
    });

    const applications = await loadApplications(supabase, userId);
    return {
      applications,
      integration: safeSummary,
      importedCount,
      updatedCount,
      calendarSyncedCount,
      calendarSyncError: calendarSyncError || undefined,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await updateIntegrationStatus(supabase, userId, {
      last_sync_error: message,
    });
    throw error;
  }
}
