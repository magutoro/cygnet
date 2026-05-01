import type { DbApplication } from "./database.js";

export const APPLICATION_STATUS_ORDER = [
  "saved",
  "applied",
  "screening",
  "interview",
  "offer",
  "rejected",
  "withdrawn",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUS_ORDER)[number];
export type ApplicationCaptureSource = "manual" | "quick_add" | "gmail_sync";
export type ApplicationCalendarProvider = "google";

export interface ApplicationInput {
  companyName: string;
  roleTitle: string;
  sourceSite: string;
  applicationUrl: string;
  status: ApplicationStatus;
  appliedAt: string;
  nextStepLabel: string;
  nextStepAt: string;
  nextStepStartTime: string;
  nextStepEndTime: string;
  contactName: string;
  contactEmail: string;
  notes: string;
  captureSource: ApplicationCaptureSource;
  gmailThreadId: string;
  gmailMessageId: string;
  calendarProvider: ApplicationCalendarProvider | "";
  calendarEventId: string;
  calendarEventUrl: string;
}

export interface Application extends ApplicationInput {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export type GmailSyncCandidateReviewStatus = "pending" | "approved" | "dismissed";

export interface GmailSyncCandidate extends ApplicationInput {
  id: string;
  userId: string;
  subject: string;
  fromEmail: string;
  fromName: string;
  snippet: string;
  confidence: number;
  confidenceReasons: string[];
  reviewStatus: GmailSyncCandidateReviewStatus;
  approvedApplicationId: string;
  detectedAt: string;
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_APPLICATION_INPUT: ApplicationInput = {
  companyName: "",
  roleTitle: "",
  sourceSite: "",
  applicationUrl: "",
  status: "saved",
  appliedAt: "",
  nextStepLabel: "",
  nextStepAt: "",
  nextStepStartTime: "",
  nextStepEndTime: "",
  contactName: "",
  contactEmail: "",
  notes: "",
  captureSource: "manual",
  gmailThreadId: "",
  gmailMessageId: "",
  calendarProvider: "",
  calendarEventId: "",
  calendarEventUrl: "",
};

export function dbApplicationToApplication(row: DbApplication): Application {
  return {
    id: row.id,
    userId: row.user_id,
    companyName: row.company_name,
    roleTitle: row.role_title,
    sourceSite: row.source_site,
    applicationUrl: row.application_url,
    status: row.status,
    appliedAt: row.applied_at ?? "",
    nextStepLabel: row.next_step_label,
    nextStepAt: row.next_step_at ?? "",
    nextStepStartTime: row.next_step_start_time ?? "",
    nextStepEndTime: row.next_step_end_time ?? "",
    contactName: row.contact_name,
    contactEmail: row.contact_email,
    notes: row.notes,
    captureSource: row.capture_source,
    gmailThreadId: row.gmail_thread_id ?? "",
    gmailMessageId: row.gmail_message_id ?? "",
    calendarProvider: row.calendar_provider ?? "",
    calendarEventId: row.calendar_event_id ?? "",
    calendarEventUrl: row.calendar_event_url ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function applicationInputToDb(input: ApplicationInput) {
  return {
    company_name: input.companyName.trim(),
    role_title: input.roleTitle.trim(),
    source_site: input.sourceSite.trim(),
    application_url: input.applicationUrl.trim(),
    status: input.status,
    applied_at: input.appliedAt || null,
    next_step_label: input.nextStepLabel.trim(),
    next_step_at: input.nextStepAt || null,
    next_step_start_time: input.nextStepStartTime || null,
    next_step_end_time: input.nextStepEndTime || null,
    contact_name: input.contactName.trim(),
    contact_email: input.contactEmail.trim(),
    notes: input.notes.trim(),
    capture_source: input.captureSource,
    gmail_thread_id: input.gmailThreadId.trim() || null,
    gmail_message_id: input.gmailMessageId.trim() || null,
    calendar_provider: input.calendarProvider || null,
    calendar_event_id: input.calendarEventId.trim() || null,
    calendar_event_url: input.calendarEventUrl.trim() || null,
  };
}

export function dbGmailSyncCandidateToCandidate(
  row: import("./database.js").DbGmailSyncCandidate,
): GmailSyncCandidate {
  return {
    id: row.id,
    userId: row.user_id,
    subject: row.subject,
    fromEmail: row.from_email,
    fromName: row.from_name,
    snippet: row.snippet,
    companyName: row.company_name,
    roleTitle: row.role_title,
    sourceSite: row.source_site,
    applicationUrl: "",
    status: row.status,
    appliedAt: "",
    nextStepLabel: row.next_step_label,
    nextStepAt: row.next_step_at ?? "",
    nextStepStartTime: row.next_step_start_time ?? "",
    nextStepEndTime: row.next_step_end_time ?? "",
    contactName: row.contact_name,
    contactEmail: row.contact_email,
    notes: row.notes,
    captureSource: "gmail_sync",
    gmailThreadId: row.gmail_thread_id,
    gmailMessageId: row.gmail_message_id,
    calendarProvider: "",
    calendarEventId: "",
    calendarEventUrl: "",
    confidence: row.confidence,
    confidenceReasons: row.confidence_reasons,
    reviewStatus: row.review_status,
    approvedApplicationId: row.approved_application_id ?? "",
    detectedAt: row.detected_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function gmailSyncCandidateToApplicationInput(
  candidate: GmailSyncCandidate,
): ApplicationInput {
  return {
    companyName: candidate.companyName,
    roleTitle: candidate.roleTitle,
    sourceSite: candidate.sourceSite,
    applicationUrl: "",
    status: candidate.status,
    appliedAt: "",
    nextStepLabel: candidate.nextStepLabel,
    nextStepAt: candidate.nextStepAt,
    nextStepStartTime: candidate.nextStepStartTime,
    nextStepEndTime: candidate.nextStepEndTime,
    contactName: candidate.contactName,
    contactEmail: candidate.contactEmail,
    notes: candidate.notes,
    captureSource: "gmail_sync",
    gmailThreadId: candidate.gmailThreadId,
    gmailMessageId: candidate.gmailMessageId,
    calendarProvider: "",
    calendarEventId: "",
    calendarEventUrl: "",
  };
}
