import type { DbGoogleWorkspaceIntegration } from "./database.js";

export const GOOGLE_WORKSPACE_SCOPES = {
  calendarEvents: "https://www.googleapis.com/auth/calendar.events",
  gmailReadonly: "https://www.googleapis.com/auth/gmail.readonly",
  gmailLabels: "https://www.googleapis.com/auth/gmail.labels",
} as const;

export interface GoogleWorkspaceIntegrationSummary {
  connected: boolean;
  googleEmail: string;
  scopes: string[];
  labelName: string;
  autoCalendarSyncEnabled: boolean;
  lastSyncedAt: string;
  lastSyncError: string;
}

export function dbGoogleWorkspaceIntegrationToSummary(
  row: DbGoogleWorkspaceIntegration | null | undefined,
): GoogleWorkspaceIntegrationSummary {
  return {
    connected: Boolean(row),
    googleEmail: row?.google_email ?? "",
    scopes: row?.scopes ?? [],
    labelName: row?.label_name ?? "Cygnet",
    autoCalendarSyncEnabled: row?.auto_calendar_sync_enabled ?? true,
    lastSyncedAt: row?.last_synced_at ?? "",
    lastSyncError: row?.last_sync_error ?? "",
  };
}
