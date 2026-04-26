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

export interface ApplicationInput {
  companyName: string;
  roleTitle: string;
  sourceSite: string;
  applicationUrl: string;
  status: ApplicationStatus;
  appliedAt: string;
  nextStepLabel: string;
  nextStepAt: string;
  contactName: string;
  contactEmail: string;
  notes: string;
}

export interface Application extends ApplicationInput {
  id: string;
  userId: string;
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
  contactName: "",
  contactEmail: "",
  notes: "",
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
    contactName: row.contact_name,
    contactEmail: row.contact_email,
    notes: row.notes,
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
    contact_name: input.contactName.trim(),
    contact_email: input.contactEmail.trim(),
    notes: input.notes.trim(),
  };
}
