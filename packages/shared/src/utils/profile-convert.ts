import type { Profile } from "../types/profile.js";
import type { DbProfile } from "../types/database.js";

const CORE_PROFILE_KEYS = new Set([
  "lastNameKanji",
  "firstNameKanji",
  "lastNameKana",
  "firstNameKana",
  "lastNameEnglish",
  "firstNameEnglish",
  "preferredName",
  "email",
  "mobileEmail",
  "phone",
  "gender",
  "password",
  "postalCode",
  "prefecture",
  "city",
  "addressLine1",
  "addressLine2",
  "birthDate",
  "university",
  "educationType",
  "universityKanaInitial",
  "universityPrefecture",
  "faculty",
  "department",
  "humanitiesScienceType",
  "graduationYear",
  "company",
  "linkedIn",
  "github",
  "portfolio",
  "note"
]);

function buildAdditionalProfile(profile: Profile): Record<string, string> {
  const additional: Record<string, string> = {};
  for (const [key, value] of Object.entries(profile)) {
    if (CORE_PROFILE_KEYS.has(key)) continue;
    if (typeof value !== "string") continue;
    additional[key] = value;
  }
  return additional;
}

export function profileToDb(profile: Profile): Omit<DbProfile, "id" | "created_at" | "updated_at"> {
  return {
    last_name_kanji: profile.lastNameKanji,
    first_name_kanji: profile.firstNameKanji,
    last_name_kana: profile.lastNameKana,
    first_name_kana: profile.firstNameKana,
    last_name_english: profile.lastNameEnglish,
    first_name_english: profile.firstNameEnglish,
    preferred_name: profile.preferredName,
    email: profile.email,
    mobile_email: profile.mobileEmail,
    phone: profile.phone,
    gender: profile.gender,
    // Keep job-site passwords local only in extension storage.
    password: "",
    postal_code: profile.postalCode,
    prefecture: profile.prefecture,
    city: profile.city,
    address_line1: profile.addressLine1,
    address_line2: profile.addressLine2,
    birth_date: profile.birthDate,
    university: profile.university,
    education_type: profile.educationType,
    university_kana_initial: profile.universityKanaInitial,
    university_prefecture: profile.universityPrefecture,
    faculty: profile.faculty,
    department: profile.department,
    humanities_science_type: profile.humanitiesScienceType,
    graduation_year: profile.graduationYear,
    company: profile.company,
    linked_in: profile.linkedIn,
    github: profile.github,
    portfolio: profile.portfolio,
    note: profile.note,
    additional_profile: buildAdditionalProfile(profile),
  };
}

export function dbToProfile(row: DbProfile): Profile {
  const additional =
    row.additional_profile && typeof row.additional_profile === "object" ? row.additional_profile : {};
  return {
    lastNameKanji: row.last_name_kanji,
    firstNameKanji: row.first_name_kanji,
    lastNameKana: row.last_name_kana,
    firstNameKana: row.first_name_kana,
    lastNameEnglish: row.last_name_english,
    firstNameEnglish: row.first_name_english,
    preferredName: row.preferred_name,
    email: row.email,
    mobileEmail: row.mobile_email,
    phone: row.phone,
    gender: row.gender,
    // Never hydrate password from cloud.
    password: "",
    postalCode: row.postal_code,
    prefecture: row.prefecture,
    city: row.city,
    addressLine1: row.address_line1,
    addressLine2: row.address_line2,
    birthDate: row.birth_date,
    university: row.university,
    educationType: row.education_type,
    universityKanaInitial: row.university_kana_initial,
    universityPrefecture: row.university_prefecture,
    faculty: row.faculty,
    department: row.department || "",
    humanitiesScienceType: row.humanities_science_type || "",
    graduationYear: row.graduation_year,
    company: row.company,
    linkedIn: row.linked_in,
    github: row.github,
    portfolio: row.portfolio,
    note: row.note,
    ...additional,
  };
}
