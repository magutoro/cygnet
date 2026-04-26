import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import type { Application } from "@cygnet/shared";
import { GOOGLE_WORKSPACE_SCOPES } from "@cygnet/shared";

const GOOGLE_AUTH_BASE_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_CALENDAR_EVENTS_URL =
  "https://www.googleapis.com/calendar/v3/calendars/primary/events";
const GMAIL_LABELS_URL = "https://gmail.googleapis.com/gmail/v1/users/me/labels";
const GMAIL_PROFILE_URL = "https://gmail.googleapis.com/gmail/v1/users/me/profile";
const GMAIL_MESSAGES_URL = "https://gmail.googleapis.com/gmail/v1/users/me/messages";

export const GOOGLE_WORKSPACE_STATE_COOKIE = "cygnet_google_workspace_state";
export const GOOGLE_WORKSPACE_DEFAULT_LABEL = "Cygnet";
export const GOOGLE_WORKSPACE_ALL_SCOPES = [
  GOOGLE_WORKSPACE_SCOPES.calendarEvents,
  GOOGLE_WORKSPACE_SCOPES.gmailReadonly,
  GOOGLE_WORKSPACE_SCOPES.gmailLabels,
];

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
}

interface GmailLabel {
  id: string;
  name: string;
}

interface GmailPayloadPart {
  mimeType?: string;
  body?: { data?: string };
  parts?: GmailPayloadPart[];
}

export interface GmailMessageRef {
  id: string;
  threadId: string;
}

export interface GmailMessageDetail {
  id: string;
  threadId: string;
  snippet: string;
  subject: string;
  from: string;
  date: string;
  bodyText: string;
}

function requireEnv(name: string): string {
  const value = String(process.env[name] || "").trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getGoogleWorkspaceClientId(): string {
  return requireEnv("GOOGLE_WORKSPACE_CLIENT_ID");
}

function getGoogleWorkspaceClientSecret(): string {
  return requireEnv("GOOGLE_WORKSPACE_CLIENT_SECRET");
}

function getEncryptionKey(): Buffer {
  const secret = requireEnv("GOOGLE_WORKSPACE_TOKEN_ENCRYPTION_KEY");
  return createHash("sha256").update(secret).digest();
}

export function getGoogleWorkspaceRedirectUri(origin: string): string {
  return `${origin}/api/integrations/google/callback`;
}

export function buildGoogleWorkspaceAuthorizeUrl(origin: string, state: string): string {
  const params = new URLSearchParams({
    client_id: getGoogleWorkspaceClientId(),
    redirect_uri: getGoogleWorkspaceRedirectUri(origin),
    response_type: "code",
    access_type: "offline",
    include_granted_scopes: "true",
    prompt: "consent",
    scope: GOOGLE_WORKSPACE_ALL_SCOPES.join(" "),
    state,
  });
  return `${GOOGLE_AUTH_BASE_URL}?${params.toString()}`;
}

export function encryptGoogleRefreshToken(refreshToken: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(refreshToken, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv, tag, encrypted].map((value) => value.toString("base64url")).join(".");
}

export function decryptGoogleRefreshToken(payload: string): string {
  const [ivEncoded, tagEncoded, encryptedEncoded] = String(payload || "").split(".");
  if (!ivEncoded || !tagEncoded || !encryptedEncoded) {
    throw new Error("Invalid encrypted refresh token");
  }
  const decipher = createDecipheriv(
    "aes-256-gcm",
    getEncryptionKey(),
    Buffer.from(ivEncoded, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(tagEncoded, "base64url"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedEncoded, "base64url")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}

async function parseGoogleError(response: Response): Promise<string> {
  const text = await response.text();
  try {
    const parsed = JSON.parse(text) as { error?: string; error_description?: string };
    return parsed.error_description || parsed.error || response.statusText;
  } catch {
    return text || response.statusText;
  }
}

async function googleJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  if (!response.ok) {
    throw new Error(await parseGoogleError(response));
  }
  return (await response.json()) as T;
}

export async function exchangeGoogleWorkspaceCode(code: string, origin: string) {
  const body = new URLSearchParams({
    code,
    client_id: getGoogleWorkspaceClientId(),
    client_secret: getGoogleWorkspaceClientSecret(),
    redirect_uri: getGoogleWorkspaceRedirectUri(origin),
    grant_type: "authorization_code",
  });

  return googleJson<GoogleTokenResponse>(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
}

export async function refreshGoogleWorkspaceAccessToken(refreshToken: string) {
  const body = new URLSearchParams({
    refresh_token: refreshToken,
    client_id: getGoogleWorkspaceClientId(),
    client_secret: getGoogleWorkspaceClientSecret(),
    grant_type: "refresh_token",
  });

  return googleJson<GoogleTokenResponse>(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
}

export function splitGrantedScopes(scopeValue: string): string[] {
  return String(scopeValue || "")
    .split(/\s+/)
    .map((scope) => scope.trim())
    .filter(Boolean);
}

export function hasGoogleScope(scopes: string[] | undefined, expected: string): boolean {
  return Array.isArray(scopes) && scopes.includes(expected);
}

export async function getGoogleWorkspaceEmail(accessToken: string): Promise<string> {
  const profile = await googleJson<{ emailAddress?: string }>(GMAIL_PROFILE_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return String(profile.emailAddress || "").trim();
}

export async function listGmailLabels(accessToken: string): Promise<GmailLabel[]> {
  const data = await googleJson<{ labels?: GmailLabel[] }>(GMAIL_LABELS_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return data.labels ?? [];
}

export async function ensureGmailLabel(
  accessToken: string,
  labelName = GOOGLE_WORKSPACE_DEFAULT_LABEL,
): Promise<GmailLabel> {
  const labels = await listGmailLabels(accessToken);
  const existing = labels.find(
    (label) => label.name.toLowerCase() === labelName.toLowerCase(),
  );
  if (existing) return existing;

  return googleJson<GmailLabel>(GMAIL_LABELS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: labelName,
      labelListVisibility: "labelShow",
      messageListVisibility: "show",
    }),
  });
}

export async function listGmailMessages(
  accessToken: string,
  labelId: string,
  maxResults = 20,
): Promise<GmailMessageRef[]> {
  const params = new URLSearchParams({
    labelIds: labelId,
    maxResults: String(maxResults),
  });
  const data = await googleJson<{ messages?: GmailMessageRef[] }>(
    `${GMAIL_MESSAGES_URL}?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  return data.messages ?? [];
}

function decodeBase64Url(value: string): string {
  if (!value) return "";
  return Buffer.from(value, "base64url").toString("utf8");
}

function getGmailHeader(
  headers: Array<{ name: string; value: string }> | undefined,
  headerName: string,
): string {
  return (
    headers?.find((header) => header.name.toLowerCase() === headerName.toLowerCase())?.value ?? ""
  ).trim();
}

function extractBodyTextFromPayload(
  payload: GmailPayloadPart | undefined,
): string {
  if (!payload) return "";
  if (payload.body?.data && payload.mimeType?.includes("text/plain")) {
    return decodeBase64Url(payload.body.data);
  }

  if (payload.parts?.length) {
    for (const part of payload.parts) {
      const partBody = extractBodyTextFromPayload(part);
      if (partBody) return partBody;
    }
  }

  if (payload.body?.data) {
    return decodeBase64Url(payload.body.data);
  }

  return "";
}

export async function getGmailMessageDetail(
  accessToken: string,
  messageId: string,
): Promise<GmailMessageDetail> {
  const params = new URLSearchParams({ format: "full" });
  const data = await googleJson<{
    id: string;
    threadId: string;
    snippet?: string;
    payload?: {
      headers?: Array<{ name: string; value: string }>;
      mimeType?: string;
      body?: { data?: string };
      parts?: GmailPayloadPart[];
    };
  }>(`${GMAIL_MESSAGES_URL}/${messageId}?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return {
    id: data.id,
    threadId: data.threadId,
    snippet: String(data.snippet || "").trim(),
    subject: getGmailHeader(data.payload?.headers, "Subject"),
    from: getGmailHeader(data.payload?.headers, "From"),
    date: getGmailHeader(data.payload?.headers, "Date"),
    bodyText: extractBodyTextFromPayload(data.payload),
  };
}

function addOneDay(dateString: string): string {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + 1);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(
    date.getUTCDate(),
  ).padStart(2, "0")}`;
}

function combineLocalDateTime(dateString: string, timeString: string): string {
  return `${dateString}T${timeString}:00`;
}

function buildGoogleCalendarEvent(application: Application) {
  const titleBits = [
    application.companyName,
    application.nextStepLabel || application.roleTitle || "Application follow-up",
  ].filter(Boolean);

  const description = [
    application.roleTitle ? `Role: ${application.roleTitle}` : "",
    application.sourceSite ? `Source: ${application.sourceSite}` : "",
    application.applicationUrl ? `URL: ${application.applicationUrl}` : "",
    application.contactName ? `Contact: ${application.contactName}` : "",
    application.contactEmail ? `Contact email: ${application.contactEmail}` : "",
    application.notes ? `Notes: ${application.notes}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  if (application.nextStepAt && application.nextStepStartTime) {
    const endTime =
      application.nextStepEndTime ||
      `${String((Number(application.nextStepStartTime.slice(0, 2)) + 1) % 24).padStart(2, "0")}:${application.nextStepStartTime.slice(3, 5)}`;

    return {
      summary: titleBits.join(" – "),
      description,
      start: {
        dateTime: combineLocalDateTime(application.nextStepAt, application.nextStepStartTime),
        timeZone: "Asia/Tokyo",
      },
      end: {
        dateTime: combineLocalDateTime(application.nextStepAt, endTime),
        timeZone: "Asia/Tokyo",
      },
    };
  }

  return {
    summary: titleBits.join(" – "),
    description,
    start: {
      date: application.nextStepAt,
    },
    end: {
      date: addOneDay(application.nextStepAt),
    },
  };
}

export async function upsertGoogleCalendarEvent(
  accessToken: string,
  application: Application,
): Promise<{ id: string; htmlLink: string }> {
  if (!application.nextStepAt) {
    throw new Error("Add a next step date before sending to Google Calendar");
  }

  const eventPayload = buildGoogleCalendarEvent(application);
  const targetUrl = application.calendarEventId
    ? `${GOOGLE_CALENDAR_EVENTS_URL}/${application.calendarEventId}`
    : GOOGLE_CALENDAR_EVENTS_URL;

  return googleJson<{ id: string; htmlLink: string }>(targetUrl, {
    method: application.calendarEventId ? "PATCH" : "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(eventPayload),
  });
}

function formatIcsTimestamp(dateString: string, timeString: string): string {
  const iso = new Date(`${dateString}T${timeString}:00+09:00`).toISOString();
  return iso.replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function escapeIcsText(value: string): string {
  return String(value || "")
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

export function buildApplicationIcs(application: Application): string {
  if (!application.nextStepAt) {
    throw new Error("Add a next step date before exporting ICS");
  }

  const uid = `${application.id}@cygnet-two.vercel.app`;
  const summary = escapeIcsText(
    [application.companyName, application.nextStepLabel || application.roleTitle || "Follow-up"]
      .filter(Boolean)
      .join(" – "),
  );
  const description = escapeIcsText(
    [
      application.roleTitle ? `Role: ${application.roleTitle}` : "",
      application.sourceSite ? `Source: ${application.sourceSite}` : "",
      application.applicationUrl ? `URL: ${application.applicationUrl}` : "",
      application.notes ? `Notes: ${application.notes}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
  );

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Cygnet//Applications//EN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z")}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
  ];

  if (application.nextStepStartTime) {
    const endTime =
      application.nextStepEndTime ||
      `${String((Number(application.nextStepStartTime.slice(0, 2)) + 1) % 24).padStart(2, "0")}:${application.nextStepStartTime.slice(3, 5)}`;
    lines.push(
      `DTSTART:${formatIcsTimestamp(application.nextStepAt, application.nextStepStartTime)}`,
      `DTEND:${formatIcsTimestamp(application.nextStepAt, endTime)}`,
    );
  } else {
    lines.push(
      `DTSTART;VALUE=DATE:${application.nextStepAt.replace(/-/g, "")}`,
      `DTEND;VALUE=DATE:${addOneDay(application.nextStepAt).replace(/-/g, "")}`,
    );
  }

  lines.push("END:VEVENT", "END:VCALENDAR");
  return lines.join("\r\n");
}
