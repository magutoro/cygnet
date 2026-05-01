export interface DbProfile {
  id: string;
  last_name_kanji: string;
  first_name_kanji: string;
  last_name_kana: string;
  first_name_kana: string;
  last_name_english: string;
  first_name_english: string;
  preferred_name: string;
  email: string;
  mobile_email: string;
  phone: string;
  gender: string;
  password: string;
  postal_code: string;
  prefecture: string;
  city: string;
  address_line1: string;
  address_line2: string;
  birth_date: string;
  university: string;
  education_type: string;
  university_kana_initial: string;
  university_prefecture: string;
  faculty: string;
  department: string;
  humanities_science_type: string;
  graduation_year: string;
  company: string;
  linked_in: string;
  github: string;
  portfolio: string;
  note: string;
  additional_profile: Record<string, string> | null;
  created_at: string;
  updated_at: string;
}

export interface DbResume {
  id: string;
  user_id: string;
  file_name: string;
  storage_path: string;
  file_size: number;
  content_type: string;
  label: string;
  parsed_text: string | null;
  parsed_at: string | null;
  created_at: string;
}

export interface DbApplication {
  id: string;
  user_id: string;
  company_name: string;
  role_title: string;
  source_site: string;
  application_url: string;
  status: "saved" | "applied" | "screening" | "interview" | "offer" | "rejected" | "withdrawn";
  applied_at: string | null;
  next_step_label: string;
  next_step_at: string | null;
  next_step_start_time: string | null;
  next_step_end_time: string | null;
  contact_name: string;
  contact_email: string;
  notes: string;
  capture_source: "manual" | "quick_add" | "gmail_sync";
  gmail_thread_id: string | null;
  gmail_message_id: string | null;
  calendar_provider: "google" | null;
  calendar_event_id: string | null;
  calendar_event_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbGmailSyncCandidate {
  id: string;
  user_id: string;
  gmail_thread_id: string;
  gmail_message_id: string;
  subject: string;
  from_email: string;
  from_name: string;
  snippet: string;
  company_name: string;
  role_title: string;
  source_site: string;
  status: "saved" | "applied" | "screening" | "interview" | "offer" | "rejected" | "withdrawn";
  next_step_label: string;
  next_step_at: string | null;
  next_step_start_time: string | null;
  next_step_end_time: string | null;
  contact_name: string;
  contact_email: string;
  notes: string;
  confidence: number;
  confidence_reasons: string[];
  review_status: "pending" | "approved" | "dismissed";
  approved_application_id: string | null;
  detected_at: string;
  created_at: string;
  updated_at: string;
}

export interface DbGoogleWorkspaceIntegration {
  id: string;
  user_id: string;
  google_email: string;
  scopes: string[];
  label_name: string;
  refresh_token_encrypted: string;
  auto_calendar_sync_enabled: boolean;
  last_synced_at: string | null;
  last_sync_error: string;
  created_at: string;
  updated_at: string;
}
