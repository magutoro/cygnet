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
