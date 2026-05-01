import type { SupabaseClient } from "@supabase/supabase-js";
import {
  APPLICATION_STATUS_ORDER,
  DEFAULT_APPLICATION_INPUT,
  applicationInputToDb,
  dbApplicationToApplication,
  dbGmailSyncCandidateToCandidate,
  gmailSyncCandidateToApplicationInput,
  type Application,
  type ApplicationInput,
  type ApplicationStatus,
  type DbApplication,
  type DbGmailSyncCandidate,
  type DbGoogleWorkspaceIntegration,
  type GmailSyncCandidate,
  type GoogleWorkspaceIntegrationSummary,
  GOOGLE_WORKSPACE_SCOPES,
  dbGoogleWorkspaceIntegrationToSummary,
} from "@cygnet/shared";
import {
  GOOGLE_WORKSPACE_DEFAULT_LABEL,
  decryptGoogleRefreshToken,
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

const GMAIL_JOB_SEARCH_QUERY =
  "newer_than:60d {面接 面談 日程 選考 説明会 内定 採用 インターン interview application schedule recruiting internship offer}";
const GMAIL_SEARCH_LIMIT = 30;
const GMAIL_DETECTION_MIN_CONFIDENCE = 45;

const INTERVIEW_KEYWORDS = ["interview", "面接", "面談", "interview invitation", "面接日程"];
const SCHEDULE_KEYWORDS = ["schedule", "日程", "日時", "説明会", "meeting", "面接", "面談"];
const OFFER_KEYWORDS = ["offer", "内定", "採用決定"];
const REJECTED_KEYWORDS = ["rejected", "見送り", "不採用", "選考結果", "regret"];
const SCREENING_KEYWORDS = ["screening", "書類選考", "selection", "review"];
const APPLIED_KEYWORDS = ["application received", "応募受付", "thanks for applying", "ご応募"];
const RECRUITING_SENDER_KEYWORDS = [
  "recruit",
  "career",
  "hr",
  "talent",
  "saiyo",
  "jinji",
  "採用",
  "人事",
];
const NOISY_KEYWORDS = ["unsubscribe", "newsletter", "セール", "キャンペーン", "広告"];

export interface GmailSyncResult {
  applications: Application[];
  candidates: GmailSyncCandidate[];
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

interface CandidateScore {
  confidence: number;
  reasons: string[];
}

function textIncludesAny(text: string, keywords: string[]): boolean {
  const normalized = text.toLowerCase();
  return keywords.some((keyword) => normalized.includes(keyword.toLowerCase()));
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
    notes: detail.snippet.trim(),
    captureSource: "gmail_sync",
    gmailThreadId: detail.threadId,
    gmailMessageId: detail.id,
    calendarProvider: "",
    calendarEventId: "",
    calendarEventUrl: "",
  };
}

function scoreGmailCandidate(detail: {
  subject: string;
  from: string;
  snippet: string;
  bodyText: string;
}, draft: ApplicationInput): CandidateScore {
  const combined = [detail.subject, detail.snippet, detail.bodyText].filter(Boolean).join("\n");
  const senderText = detail.from.toLowerCase();
  const reasons: string[] = [];
  let confidence = 0;

  if (textIncludesAny(combined, SCHEDULE_KEYWORDS)) {
    confidence += 30;
    reasons.push("schedule keyword");
  }
  if (textIncludesAny(combined, [...INTERVIEW_KEYWORDS, ...OFFER_KEYWORDS, ...SCREENING_KEYWORDS])) {
    confidence += 20;
    reasons.push("recruiting status keyword");
  }
  if (textIncludesAny(combined, APPLIED_KEYWORDS)) {
    confidence += 10;
    reasons.push("application keyword");
  }
  if (draft.nextStepAt) {
    confidence += 25;
    reasons.push("date found");
  }
  if (draft.nextStepStartTime) {
    confidence += 10;
    reasons.push("time found");
  }
  if (draft.companyName) {
    confidence += 8;
    reasons.push("company inferred");
  }
  if (textIncludesAny(senderText, RECRUITING_SENDER_KEYWORDS)) {
    confidence += 10;
    reasons.push("recruiting sender");
  }
  if (textIncludesAny(combined, NOISY_KEYWORDS)) {
    confidence -= 25;
    reasons.push("possible promotional email");
  }

  return {
    confidence: Math.max(0, Math.min(100, confidence)),
    reasons,
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

export async function loadPendingGmailCandidates(
  supabase: SupabaseClient,
  userId: string,
): Promise<GmailSyncCandidate[]> {
  const { data, error } = await supabase
    .from("gmail_sync_candidates")
    .select("*")
    .eq("user_id", userId)
    .eq("review_status", "pending")
    .order("detected_at", { ascending: false })
    .returns<DbGmailSyncCandidate[]>();

  if (error) throw error;
  return (data ?? []).map(dbGmailSyncCandidateToCandidate);
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

async function upsertPendingCandidate(
  supabase: SupabaseClient,
  userId: string,
  detail: {
    id: string;
    threadId: string;
    subject: string;
    from: string;
    snippet: string;
  },
  draft: ApplicationInput,
  score: CandidateScore,
): Promise<"created" | "updated" | "skipped"> {
  const { data: existing, error: existingError } = await supabase
    .from("gmail_sync_candidates")
    .select("*")
    .eq("user_id", userId)
    .eq("gmail_thread_id", detail.threadId)
    .maybeSingle<DbGmailSyncCandidate>();

  if (existingError) throw existingError;
  if (existing && existing.review_status !== "pending") return "skipped";

  const contact = parseContact(detail.from);
  const payload = {
    user_id: userId,
    gmail_thread_id: detail.threadId,
    gmail_message_id: detail.id,
    subject: detail.subject.trim(),
    from_email: contact.email,
    from_name: contact.name,
    snippet: detail.snippet.trim(),
    company_name: draft.companyName,
    role_title: draft.roleTitle,
    source_site: draft.sourceSite,
    status: draft.status,
    next_step_label: draft.nextStepLabel,
    next_step_at: draft.nextStepAt || null,
    next_step_start_time: draft.nextStepStartTime || null,
    next_step_end_time: draft.nextStepEndTime || null,
    contact_name: draft.contactName,
    contact_email: draft.contactEmail,
    notes: draft.notes,
    confidence: score.confidence,
    confidence_reasons: score.reasons,
    detected_at: new Date().toISOString(),
  };

  if (existing) {
    const { error } = await supabase
      .from("gmail_sync_candidates")
      .update(payload)
      .eq("id", existing.id)
      .eq("user_id", userId);
    if (error) throw error;
    return "updated";
  }

  const { error } = await supabase.from("gmail_sync_candidates").insert([payload]);
  if (error) throw error;
  return "created";
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

    const googleEmail = integration.google_email || (await getGoogleWorkspaceEmail(accessToken));
    const refs = await listGmailMessages(accessToken, {
      query: GMAIL_JOB_SEARCH_QUERY,
      maxResults: GMAIL_SEARCH_LIMIT,
    });
    const currentApps = await loadApplications(supabase, userId);
    const byThreadId = new Map(
      currentApps.filter((item) => item.gmailThreadId).map((item) => [item.gmailThreadId, item]),
    );

    let importedCount = 0;
    let updatedCount = 0;

    for (const ref of refs) {
      if (byThreadId.has(ref.threadId)) continue;

      const detail = await getGmailMessageDetail(accessToken, ref.id);
      const incomingDraft = parseMessageToDraft(detail);
      const score = scoreGmailCandidate(detail, incomingDraft);

      if (score.confidence < GMAIL_DETECTION_MIN_CONFIDENCE) continue;

      const result = await upsertPendingCandidate(supabase, userId, detail, incomingDraft, score);
      if (result === "created") importedCount += 1;
      if (result === "updated") updatedCount += 1;
    }

    const syncedAt = new Date().toISOString();
    const safeSummary = dbGoogleWorkspaceIntegrationToSummary({
      ...integration,
      google_email: googleEmail,
      scopes,
      label_name: "Recent job emails",
      refresh_token_encrypted: integration.refresh_token_encrypted,
      last_synced_at: syncedAt,
      last_sync_error: "",
    });

    await updateIntegrationStatus(supabase, userId, {
      google_email: googleEmail,
      scopes,
      label_name: "Recent job emails",
      last_synced_at: syncedAt,
      last_sync_error: "",
    });

    const [applications, candidates] = await Promise.all([
      loadApplications(supabase, userId),
      loadPendingGmailCandidates(supabase, userId),
    ]);

    return {
      applications,
      candidates,
      integration: safeSummary,
      importedCount,
      updatedCount,
      calendarSyncedCount: 0,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await updateIntegrationStatus(supabase, userId, {
      last_sync_error: message,
    });
    throw error;
  }
}

export async function approveGmailSyncCandidate(
  supabase: SupabaseClient,
  userId: string,
  candidateId: string,
  integration: DbGoogleWorkspaceIntegration | null,
): Promise<{
  application: Application;
  candidates: GmailSyncCandidate[];
  calendarSynced: boolean;
  calendarSyncError?: string;
}> {
  const { data: candidateRow, error: candidateError } = await supabase
    .from("gmail_sync_candidates")
    .select("*")
    .eq("id", candidateId)
    .eq("user_id", userId)
    .eq("review_status", "pending")
    .maybeSingle<DbGmailSyncCandidate>();

  if (candidateError) throw candidateError;
  if (!candidateRow) throw new Error("candidate_not_found");

  const candidate = dbGmailSyncCandidateToCandidate(candidateRow);
  const { data: existingApplication } = await supabase
    .from("applications")
    .select("*")
    .eq("user_id", userId)
    .eq("gmail_thread_id", candidate.gmailThreadId)
    .maybeSingle<DbApplication>();

  let application = existingApplication
    ? dbApplicationToApplication(existingApplication)
    : null;

  if (!application) {
    const input = gmailSyncCandidateToApplicationInput(candidate);
    const { data, error } = await supabase
      .from("applications")
      .insert([{ user_id: userId, ...applicationInputToDb(input) }])
      .select("*")
      .single<DbApplication>();

    if (error || !data) throw error ?? new Error("application_create_failed");
    application = dbApplicationToApplication(data);
  } else {
    const merged = mergeDraft(application, gmailSyncCandidateToApplicationInput(candidate));
    const { data, error } = await supabase
      .from("applications")
      .update(applicationInputToDb(merged))
      .eq("id", application.id)
      .eq("user_id", userId)
      .select("*")
      .single<DbApplication>();

    if (error || !data) throw error ?? new Error("application_update_failed");
    application = dbApplicationToApplication(data);
  }

  let calendarSynced = false;
  let calendarSyncError = "";

  if (
    integration &&
    integration.auto_calendar_sync_enabled !== false &&
    integration.scopes.includes(GOOGLE_WORKSPACE_SCOPES.calendarEvents) &&
    application.nextStepAt
  ) {
    try {
      const refreshToken = decryptGoogleRefreshToken(integration.refresh_token_encrypted);
      const refreshed = await refreshGoogleWorkspaceAccessToken(refreshToken);
      application = await syncApplicationToGoogleCalendar(
        supabase,
        userId,
        application,
        refreshed.access_token,
      );
      calendarSynced = true;
    } catch (error) {
      calendarSyncError = error instanceof Error ? error.message : String(error);
      console.error("Approved Gmail candidate Calendar sync failed", error);
    }
  }

  const { error: updateError } = await supabase
    .from("gmail_sync_candidates")
    .update({
      review_status: "approved",
      approved_application_id: application.id,
    })
    .eq("id", candidate.id)
    .eq("user_id", userId);

  if (updateError) throw updateError;

  return {
    application,
    candidates: await loadPendingGmailCandidates(supabase, userId),
    calendarSynced,
    calendarSyncError: calendarSyncError || undefined,
  };
}

export async function dismissGmailSyncCandidate(
  supabase: SupabaseClient,
  userId: string,
  candidateId: string,
): Promise<{ candidates: GmailSyncCandidate[] }> {
  const { error } = await supabase
    .from("gmail_sync_candidates")
    .update({ review_status: "dismissed" })
    .eq("id", candidateId)
    .eq("user_id", userId)
    .eq("review_status", "pending");

  if (error) throw error;

  return {
    candidates: await loadPendingGmailCandidates(supabase, userId),
  };
}
