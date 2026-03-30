"use client";

import { useState, useCallback, useImperativeHandle, forwardRef, useMemo, useEffect, useRef, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/components/LanguageProvider";
import { refreshExtensionProfileFromWeb } from "@/lib/extension-bridge";
import {
  type Profile,
  type ProfileKey,
  profileToDb,
  GENDER_OPTIONS,
  EDUCATION_TYPE_OPTIONS,
  HUMANITIES_SCIENCE_OPTIONS,
  normalizeProfileUrl,
} from "@cygnet/shared";

interface Props {
  initialProfile: Profile;
  userId: string;
}

export interface ProfileEditorHandle {
  applyPartial: (partial: Partial<Profile>) => void;
}

type SaveStatus = "idle" | "saving" | "saved" | "error";
type TabKey = "main" | "additional";

type ChoiceOption = {
  value: string;
  label: string;
};

type LocalizedText = {
  en: string;
  ja: string;
};

type FieldDef = {
  key: ProfileKey;
  label: string | LocalizedText;
  type?: "text" | "email" | "date" | "month" | "textarea";
  placeholder?: string | LocalizedText;
  options?: readonly ChoiceOption[];
  multiOptions?: readonly ChoiceOption[];
  full?: boolean;
  rows?: number;
};

type SectionDef = {
  title: string | LocalizedText;
  fields: FieldDef[];
};

const YES_NO_OPTIONS: ChoiceOption[] = [
  { value: "", label: "未設定" },
  { value: "yes", label: "はい / Yes" },
  { value: "no", label: "いいえ / No" },
];

const ENGLISH_ABILITY_OPTIONS: ChoiceOption[] = [
  { value: "", label: "未設定" },
  { value: "none", label: "未経験" },
  { value: "basic", label: "基礎" },
  { value: "daily", label: "日常会話" },
  { value: "business", label: "ビジネス" },
  { value: "native", label: "ネイティブ" },
];

const WORK_EMPLOYMENT_OPTIONS: ChoiceOption[] = [
  { value: "", label: "未設定" },
  { value: "full_time", label: "正社員" },
  { value: "contract", label: "契約社員" },
  { value: "dispatch", label: "派遣社員" },
  { value: "part_time", label: "アルバイト" },
  { value: "other", label: "その他" },
];

const WORK_STATUS_OPTIONS: ChoiceOption[] = [
  { value: "", label: "未設定" },
  { value: "currently_employed", label: "在職中 / Currently employed" },
  { value: "planning_to_resign", label: "退職予定 / Planning to resign" },
  { value: "resigned", label: "退職済み / Resigned" },
];

const OVERSEAS_REASON_OPTIONS: ChoiceOption[] = [
  { value: "", label: "未設定" },
  { value: "study_abroad", label: "留学" },
  { value: "work", label: "就業" },
  { value: "internship", label: "インターン" },
  { value: "volunteer", label: "ボランティア" },
  { value: "family", label: "家族都合" },
  { value: "other", label: "その他" },
];

const REASON_FOR_ENTRY_OPTIONS: ChoiceOption[] = [
  { value: "", label: "未設定" },
  { value: "mynavi", label: "マイナビ / Mynavi" },
  { value: "rikunavi", label: "リクナビ / Rikunavi" },
  { value: "career_forum_net", label: "Career Forum Net" },
  { value: "one_career", label: "ONE CAREER" },
  { value: "career_tasu_shukatsu", label: "キャリタス就活 / Career-tasu Shukatsu" },
  { value: "career_tasu_uc", label: "キャリタスUC / Career-tasu UC" },
  { value: "type_shukatsu", label: "Type就活 / Type Shukatsu" },
  { value: "redesigner", label: "ReDesigner" },
  { value: "leading_mark", label: "リーディングマーク / Leading Mark" },
  { value: "gaishi_shukatsu", label: "外資就活 / Gaishi Shukatsu" },
  { value: "open_work", label: "Open Work" },
  { value: "offer_box", label: "Offer Box" },
  { value: "bizreach", label: "BizReach" },
  { value: "shirucafe", label: "知るカフェ / Meetup" },
  { value: "career_office", label: "大学の求人票 / Job Posting on College Career Office Website" },
  { value: "joint_job_fair", label: "イベント（合同説明会） / Event (Joint job fairs)" },
  { value: "boston_career_forum", label: "Boston Career Forum" },
  { value: "on_campus_event", label: "学内説明会 / On-Campus Event" },
  { value: "interview_staff", label: "採用担当との面談 / Interview with Recruitment staff" },
  { value: "obog_visit", label: "OBOG訪問 / Alumni's visit" },
  { value: "instagram", label: "Instagram" },
  { value: "x", label: "X (旧Twitter)" },
  { value: "youtube", label: "YouTube" },
  { value: "company_video", label: "会社説明動画 / Company Video" },
  { value: "referral", label: "紹介 / Referral" },
  { value: "other", label: "その他 / Others" },
];

const SCHOOL_ATTENDANCE_REASON_OPTIONS: ChoiceOption[] = [
  { value: "study_abroad", label: "留学のため / To study abroad" },
  { value: "job_search", label: "就職浪人のため / To search for jobs" },
  { value: "repeat_year", label: "学業による留年のため / To repeat a year" },
  { value: "grad_exam", label: "大学院受験のため（浪人） / Graduate school entrance exam" },
  { value: "other", label: "その他 / Other" },
];

const HIGH_SCHOOL_GAP_REASON_OPTIONS: ChoiceOption[] = [
  { value: "prep_university_exam", label: "大学受験のため（浪人）" },
  { value: "study_abroad_after_grad", label: "卒業後の留学のため" },
  { value: "overseas_university", label: "高校と異なる国の大学に入学したため" },
  { value: "other", label: "その他" },
];

const LICENSE_CERTIFICATION_OPTIONS: ChoiceOption[] = [
  { value: "boki_1", label: "日商簿記1級" },
  { value: "boki_2", label: "日商簿記2級" },
  { value: "boki_3", label: "日商簿記3級" },
  { value: "fp_1", label: "FP技能検定1級" },
  { value: "fp_2", label: "FP技能検定2級" },
  { value: "fp_3", label: "FP技能検定3級" },
  { value: "it_passport", label: "ITパスポート" },
  { value: "actuary_associate", label: "アクチュアリー準会員" },
  { value: "actuary_fellow", label: "アクチュアリー正会員" },
  { value: "labor_social_security", label: "社会保険労務士" },
  { value: "fundamental_it", label: "基本情報技術者試験" },
  { value: "statistics_grade1", label: "統計検定1級" },
  { value: "statistics_pre1", label: "統計検定準1級" },
  { value: "statistics_grade2", label: "統計検定2級" },
  { value: "real_estate_notary", label: "宅地建物取引士" },
  { value: "lawyer", label: "弁護士資格" },
  { value: "cpa", label: "公認会計士" },
];

const MAIN_SECTIONS: SectionDef[] = [
  {
    title: { en: "Basic info", ja: "基本情報" },
    fields: [
      { key: "lastNameKanji", label: { en: "Last name (Kanji)", ja: "姓（漢字）" }, placeholder: "山田" },
      { key: "firstNameKanji", label: { en: "First name (Kanji)", ja: "名（漢字）" }, placeholder: "太郎" },
      { key: "lastNameKana", label: { en: "Last name (Kana)", ja: "姓（かな）" }, placeholder: "やまだ" },
      { key: "firstNameKana", label: { en: "First name (Kana)", ja: "名（かな）" }, placeholder: "たろう" },
      { key: "lastNameEnglish", label: { en: "Last name (English)", ja: "姓（英字）" }, placeholder: "Yamada" },
      { key: "firstNameEnglish", label: { en: "First name (English)", ja: "名（英字）" }, placeholder: "Taro" },
      { key: "preferredName", label: { en: "Preferred name", ja: "希望名" } },
      { key: "gender", label: { en: "Gender", ja: "性別" }, options: GENDER_OPTIONS },
      { key: "birthDate", label: { en: "Birth date", ja: "生年月日" }, type: "date" },
    ],
  },
  {
    title: { en: "Contact & address", ja: "連絡先・住所" },
    fields: [
      { key: "email", label: { en: "Email", ja: "メールアドレス" }, type: "email" },
      { key: "mobileEmail", label: { en: "Mobile email", ja: "携帯メール" }, type: "email" },
      { key: "phone", label: { en: "Phone", ja: "電話番号" }, placeholder: "090-1234-5678" },
      { key: "mobilePhone", label: { en: "Mobile phone", ja: "携帯電話番号" }, placeholder: "090-1234-5678" },
      { key: "postalCode", label: { en: "Postal code", ja: "郵便番号" }, placeholder: "100-0001" },
      { key: "prefecture", label: { en: "Prefecture", ja: "都道府県" }, placeholder: "東京都" },
      { key: "city", label: { en: "City", ja: "市区町村" }, placeholder: "千代田区" },
      { key: "addressLine1", label: { en: "Address line 1", ja: "住所1" } },
      { key: "addressLine2", label: { en: "Address line 2", ja: "住所2" } },
    ],
  },
  {
    title: { en: "Education", ja: "学歴" },
    fields: [
      { key: "educationType", label: { en: "School type", ja: "学校種別" }, options: EDUCATION_TYPE_OPTIONS },
      { key: "universityKanaInitial", label: { en: "University kana initial", ja: "大学かな頭文字" } },
      { key: "university", label: { en: "University", ja: "大学名" }, placeholder: "東京大学" },
      { key: "universityPrefecture", label: { en: "University prefecture", ja: "大学所在地（都道府県）" } },
      { key: "faculty", label: { en: "Faculty", ja: "学部" } },
      { key: "department", label: { en: "Department", ja: "学科" } },
      { key: "humanitiesScienceType", label: { en: "Arts/Science", ja: "文理区分" }, options: HUMANITIES_SCIENCE_OPTIONS },
      {
        key: "latestAcademicAdmissionDate",
        label: { en: "Admission year/month", ja: "入学年月" },
        type: "month",
      },
      {
        key: "graduationYear",
        label: { en: "Expected graduation year/month", ja: "卒業予定年月" },
        type: "month",
      },
    ],
  },
  {
    title: { en: "Career & links", ja: "職歴・リンク" },
    fields: [
      { key: "company", label: { en: "Company", ja: "会社名" } },
      { key: "linkedIn", label: { en: "LinkedIn URL", ja: "LinkedIn URL" } },
      { key: "github", label: { en: "GitHub URL", ja: "GitHub URL" } },
      { key: "portfolio", label: { en: "Portfolio URL", ja: "ポートフォリオ URL" } },
    ],
  },
];

const ADDITIONAL_SECTIONS: SectionDef[] = [
  {
    title: "最終学歴情報 / Latest academic information",
    fields: [
      {
        key: "schoolAttendanceReasons",
        label: "在学期間が予定より長くなった理由 / If you stayed in university longer than planned",
        multiOptions: SCHOOL_ATTENDANCE_REASON_OPTIONS,
        full: true,
      },
      { key: "seminarLaboratory", label: "所属ゼミ・研究室名", full: true },
      { key: "researchTheme", label: "専攻テーマ・研究テーマ(題名)", full: true },
      { key: "schoolClubActivity", label: "所属クラブ・サークル名", full: true },
    ],
  },
  {
    title: "高校情報 / High school",
    fields: [
      { key: "highSchool", label: "高校 / High school", full: true },
      { key: "highSchoolAdmissionDate", label: "高校入学年月", type: "month" },
      { key: "highSchoolGraduationDate", label: "高校卒業年月", type: "month" },
      {
        key: "highSchoolGapReasons",
        label: "高校卒業後の理由",
        multiOptions: HIGH_SCHOOL_GAP_REASON_OPTIONS,
        full: true,
      },
      { key: "highSchoolGapOther", label: "高校卒業後の理由（その他）", full: true },
    ],
  },
  {
    title: "経験と志望 / Experiences and reasons",
    fields: [
      { key: "reasonForEntry", label: "エントリーのきっかけ", options: REASON_FOR_ENTRY_OPTIONS, full: true },
      { key: "schoolLifeExperience1", label: "学生時代の経験 1", type: "textarea", rows: 4, full: true },
      { key: "schoolLifeExperience2", label: "学生時代の経験 2", type: "textarea", rows: 4, full: true },
    ],
  },
  {
    title: "資格・語学 / Licenses and language",
    fields: [
      { key: "englishAbility", label: "英語レベル", options: ENGLISH_ABILITY_OPTIONS },
      { key: "toeicScore", label: "TOEICスコア" },
      { key: "toeicScoreCertificate", label: "TOEICスコアシート" },
      { key: "toeflIbtScore", label: "TOEFL iBTスコア" },
      { key: "toeflCbtScore", label: "TOEFL CBTスコア" },
      { key: "toeflItpScore", label: "TOEFL iTPスコア" },
      { key: "ieltsScore", label: "IELTSスコア" },
      { key: "languageOtherScores", label: "その他語学スコア・資格", type: "textarea", rows: 3, full: true },
    ],
  },
  {
    title: "資格・賞罰 / License and recognition",
    fields: [
      {
        key: "licensesCertifications",
        label: "免許・資格",
        multiOptions: LICENSE_CERTIFICATION_OPTIONS,
        full: true,
      },
      { key: "driverLicense", label: "自動車免許", options: YES_NO_OPTIONS },
      { key: "otherLicensesCertifications", label: "その他免許・資格", full: true },
      { key: "awardsRecognition", label: "賞有無", options: YES_NO_OPTIONS },
      { key: "awardsRecognitionDetails", label: "賞の詳細", full: true },
    ],
  },
  {
    title: "職務経歴 / Work history",
    fields: [
      { key: "workHistoryCompany1", label: "勤務先名（1社目）", full: true },
      { key: "workHistoryPeriod1Start", label: "勤務期間1 開始", type: "month" },
      { key: "workHistoryPeriod1End", label: "勤務期間1 終了", type: "month" },
      { key: "workHistoryEmploymentStatus1", label: "雇用形態（1社目）", options: WORK_EMPLOYMENT_OPTIONS },
      { key: "workHistoryResponsibilities1", label: "業務内容（1社目）", full: true },
      { key: "workHistoryJobStatus1", label: "在職状況（1社目）", options: WORK_STATUS_OPTIONS },
      { key: "workHistoryCompany2", label: "勤務先名（2社目）", full: true },
      { key: "workHistoryPeriod2Start", label: "勤務期間2 開始", type: "month" },
      { key: "workHistoryPeriod2End", label: "勤務期間2 終了", type: "month" },
      { key: "workHistoryEmploymentStatus2", label: "雇用形態（2社目）", options: WORK_EMPLOYMENT_OPTIONS },
      { key: "workHistoryResponsibilities2", label: "業務内容（2社目）", full: true },
      { key: "workHistoryJobStatus2", label: "在職状況（2社目）", options: WORK_STATUS_OPTIONS },
      { key: "workHistoryOther", label: "その他職務経歴", type: "textarea", rows: 4, full: true },
    ],
  },
  {
    title: "その他学歴・海外経験 / Other education and overseas",
    fields: [
      { key: "otherEducationSchool1", label: "大学1 / School1", full: true },
      { key: "otherEducationDepartment1", label: "学部学科1 / Department and major1", full: true },
      { key: "otherEducationAdmission1", label: "入学・留学開始年月1", type: "month" },
      { key: "otherEducationGraduation1", label: "卒業・留学修了年月1", type: "month" },
      { key: "otherEducationSchool2", label: "大学2 / School2", full: true },
      { key: "otherEducationDepartment2", label: "学部学科2 / Department and major2", full: true },
      { key: "otherEducationAdmission2", label: "入学・留学開始年月2", type: "month" },
      { key: "otherEducationGraduation2", label: "卒業・留学修了年月2", type: "month" },
      { key: "overseasExperience", label: "海外経験の有無", options: YES_NO_OPTIONS },
      { key: "overseasCountry1", label: "国名1 / Country1" },
      { key: "overseasReason1", label: "滞在理由1", options: OVERSEAS_REASON_OPTIONS },
      { key: "overseasPeriod1Start", label: "滞在期間1 開始", type: "month" },
      { key: "overseasPeriod1End", label: "滞在期間1 終了", type: "month" },
      { key: "overseasCountry2", label: "国名2 / Country2" },
      { key: "overseasReason2", label: "滞在理由2", options: OVERSEAS_REASON_OPTIONS },
      { key: "overseasPeriod2Start", label: "滞在期間2 開始", type: "month" },
      { key: "overseasPeriod2End", label: "滞在期間2 終了", type: "month" },
      { key: "overseasCountry3", label: "国名3 / Country3" },
      { key: "overseasReason3", label: "滞在理由3", options: OVERSEAS_REASON_OPTIONS },
      { key: "overseasPeriod3Start", label: "滞在期間3 開始", type: "month" },
      { key: "overseasPeriod3End", label: "滞在期間3 終了", type: "month" },
      { key: "overseasOtherExperience", label: "その他海外経験", type: "textarea", rows: 4, full: true },
    ],
  },
  {
    title: "国籍 / Nationality",
    fields: [
      { key: "nationalityPrimary", label: "第1国籍" },
      { key: "nationalitySecondary", label: "第2国籍" },
    ],
  },
  {
    title: "その他情報 / Other information",
    fields: [
      { key: "workConsiderations", label: "勤務上配慮事項", type: "textarea", rows: 3, full: true },
      { key: "hospitalizedTwoWeeks", label: "2週間以上の入院歴", options: YES_NO_OPTIONS },
      { key: "criminalRecord", label: "罰有無", options: YES_NO_OPTIONS },
    ],
  },
  {
    title: "休暇中の連絡先 / Vacation contact",
    fields: [
      { key: "vacationAddressSameAsCurrent", label: "休暇中住所が現住所と同じ", options: YES_NO_OPTIONS },
      { key: "vacationPostalCode", label: "休暇中 郵便番号" },
      { key: "vacationPrefecture", label: "休暇中 都道府県" },
      { key: "vacationAddressLine1", label: "休暇中 市区郡・地名・番地", full: true },
      { key: "vacationAddressLine2", label: "休暇中 アパート・マンション名・番号", full: true },
      { key: "vacationPhone", label: "休暇中 電話番号" },
    ],
  },
];

const URL_PROFILE_KEYS: ProfileKey[] = ["linkedIn", "github", "portfolio"];
const MONTH_PROFILE_KEYS: ProfileKey[] = [
  "latestAcademicAdmissionDate",
  "graduationYear",
  "highSchoolAdmissionDate",
  "highSchoolGraduationDate",
  "workHistoryPeriod1Start",
  "workHistoryPeriod1End",
  "workHistoryPeriod2Start",
  "workHistoryPeriod2End",
  "otherEducationAdmission1",
  "otherEducationGraduation1",
  "otherEducationAdmission2",
  "otherEducationGraduation2",
  "overseasPeriod1Start",
  "overseasPeriod1End",
  "overseasPeriod2Start",
  "overseasPeriod2End",
  "overseasPeriod3Start",
  "overseasPeriod3End",
];
const FULL_DATE_PROFILE_KEYS: ProfileKey[] = ["birthDate"];
const MIN_PICKER_YEAR = 1950;
const MAX_PICKER_YEAR_OFFSET = 20;

const EDITOR_COPY = {
  en: {
    title: "Profile",
    save: "Save",
    saving: "Saving…",
    mainTab: "Main",
    additionalTab: "Additional",
    saved: "Profile saved successfully.",
    error: "Failed to save. Please try again.",
    syncUnavailable: "Profile saved. Connect the extension to keep it synced automatically.",
    syncRetry: "Profile saved. Extension auto-sync failed. Try reconnecting the extension.",
    year: "Year",
    month: "Month",
    unset: "Unset",
    day: "Day",
  },
  ja: {
    title: "プロフィール",
    save: "保存",
    saving: "保存中…",
    mainTab: "メイン",
    additionalTab: "追加情報",
    saved: "プロフィールを保存しました。",
    error: "保存に失敗しました。もう一度お試しください。",
    syncUnavailable: "プロフィールは保存されました。拡張機能を接続すると自動同期されます。",
    syncRetry: "プロフィールは保存されましたが、拡張機能の自動同期に失敗しました。拡張機能を再接続してください。",
    year: "年",
    month: "月",
    unset: "未設定",
    day: "日",
  },
} as const;

const WEEKDAY_COPY = {
  en: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
  ja: ["日", "月", "火", "水", "木", "金", "土"],
} as const;

function normalizeProfileLinks(profile: Profile): Profile {
  const next: Profile = { ...profile };
  for (const key of URL_PROFILE_KEYS) {
    next[key] = normalizeProfileUrl(next[key]);
  }
  return next;
}

function parseNormalizedMonth(value: string): { year: number; month: number } | null {
  const normalized = normalizeMonthValue(value);
  const match = normalized.match(/^(\d{4})-(\d{2})$/);
  if (!match) return null;
  return {
    year: Number(match[1]),
    month: Number(match[2]),
  };
}

function parseNormalizedDate(value: string): { year: number; month: number; day: number } | null {
  const normalized = normalizeDateValue(value);
  const match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
}

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function getPickerYears(): number[] {
  const currentYear = new Date().getFullYear();
  const maxYear = currentYear + MAX_PICKER_YEAR_OFFSET;
  const years: number[] = [];
  for (let year = maxYear; year >= MIN_PICKER_YEAR; year -= 1) {
    years.push(year);
  }
  return years;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function formatMonthLabel(lang: "en" | "ja", month: number): string {
  const numeric = pad2(month);
  return lang === "ja" ? `${numeric}月` : numeric;
}

function formatMonthInputValue(value: string): string {
  const parsed = parseNormalizedMonth(value);
  if (!parsed) return value;
  return `${pad2(parsed.month)}/${parsed.year}`;
}

function formatDateInputValue(value: string): string {
  const parsed = parseNormalizedDate(value);
  if (!parsed) return value;
  return `${pad2(parsed.month)}/${pad2(parsed.day)}/${parsed.year}`;
}

function parseMonthInputValue(value: string): string {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";

  const compact = trimmed
    .replace(/[.\-]/g, "/")
    .replace(/年/g, "/")
    .replace(/月/g, "")
    .replace(/\s+/g, "")
    .replace(/\/+/g, "/")
    .replace(/^\/|\/$/g, "");

  const monthFirst = compact.match(/^(\d{1,2})\/(\d{4})$/);
  if (monthFirst) {
    const month = Number(monthFirst[1]);
    const year = Number(monthFirst[2]);
    if (month >= 1 && month <= 12) {
      return `${year}-${pad2(month)}`;
    }
  }

  return normalizeMonthValue(trimmed);
}

function parseDateInputValue(value: string): string {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";

  const compact = trimmed
    .replace(/[.\-]/g, "/")
    .replace(/年/g, "/")
    .replace(/月/g, "/")
    .replace(/日/g, "")
    .replace(/\s+/g, "")
    .replace(/\/+/g, "/")
    .replace(/^\/|\/$/g, "");

  const monthFirst = compact.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (monthFirst) {
    const month = Number(monthFirst[1]);
    const day = Number(monthFirst[2]);
    const year = Number(monthFirst[3]);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return `${year}-${pad2(month)}-${pad2(day)}`;
    }
  }

  return normalizeDateValue(trimmed);
}

function useDismissiblePopover(
  open: boolean,
  rootRef: { current: HTMLElement | null },
  onClose: () => void,
) {
  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current) return;
      if (rootRef.current.contains(event.target as Node)) return;
      onClose();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose, rootRef]);
}

function normalizeMonthValue(value: string): string {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";

  const normalized = trimmed
    .replace(/[/.]/g, "-")
    .replace(/年/g, "-")
    .replace(/月/g, "")
    .replace(/\s+/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  const parts =
    normalized.match(/^(\d{4})-(\d{1,2})$/) ||
    normalized.match(/^(\d{4})(\d{2})$/);

  if (!parts) return trimmed;

  const year = parts[1];
  const month = Number(parts[2]);
  if (month < 1 || month > 12) return trimmed;

  return `${year}-${String(month).padStart(2, "0")}`;
}

function normalizeDateValue(value: string): string {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";

  const normalized = trimmed
    .replace(/[/.]/g, "-")
    .replace(/年/g, "-")
    .replace(/月/g, "-")
    .replace(/日/g, "")
    .replace(/\s+/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  const parts =
    normalized.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/) ||
    normalized.match(/^(\d{4})(\d{2})(\d{2})$/);

  if (!parts) return trimmed;

  const year = Number(parts[1]);
  const month = Number(parts[2]);
  const day = Number(parts[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return trimmed;

  return `${String(year)}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function normalizeProfileDates(profile: Profile): Profile {
  const next: Profile = { ...profile };

  for (const key of MONTH_PROFILE_KEYS) {
    next[key] = normalizeMonthValue(next[key]);
  }

  for (const key of FULL_DATE_PROFILE_KEYS) {
    next[key] = normalizeDateValue(next[key]);
  }

  return next;
}

const ProfileEditor = forwardRef<ProfileEditorHandle, Props>(
  function ProfileEditor({ initialProfile, userId }, ref) {
    const { lang } = useLanguage();
    const t = EDITOR_COPY[lang];
    const [profile, setProfile] = useState<Profile>(() => normalizeProfileDates(initialProfile));
    const [status, setStatus] = useState<SaveStatus>("idle");
    const [syncNotice, setSyncNotice] = useState("");
    const [activeTab, setActiveTab] = useState<TabKey>("main");

    const update = useCallback((key: ProfileKey, value: string) => {
      setProfile((prev) => ({ ...prev, [key]: value }));
      setStatus("idle");
      setSyncNotice("");
    }, []);

    const applyPartial = useCallback((partial: Partial<Profile>) => {
      const safePatch: Record<string, string> = {};
      for (const [key, value] of Object.entries(partial)) {
        if (typeof value === "string") safePatch[key] = value;
      }
      setProfile((prev) => normalizeProfileDates({ ...prev, ...safePatch }));
      setStatus("idle");
      setSyncNotice("");
    }, []);

    useImperativeHandle(ref, () => ({ applyPartial }), [applyPartial]);

    const save = async () => {
      setStatus("saving");
      setSyncNotice("");
      try {
        const supabase = createClient();
        const normalizedProfile = normalizeProfileLinks(normalizeProfileDates(profile));
        const dbData = profileToDb(normalizedProfile);
        const { error } = await supabase
          .from("profiles")
          .upsert({ id: userId, ...dbData, updated_at: new Date().toISOString() }, { onConflict: "id" });
        setProfile(normalizedProfile);
        if (error) {
          setStatus("error");
          return;
        }
        setStatus("saved");

        const syncResult = await refreshExtensionProfileFromWeb();
        if (!syncResult.ok) {
          const isUnavailable =
            syncResult.error.includes("Extension ID is missing") ||
            syncResult.error.includes("chrome.runtime is unavailable");
          setSyncNotice(isUnavailable ? t.syncUnavailable : t.syncRetry);
        }
      } catch {
        setStatus("error");
      }
    };

    const sections = (activeTab === "main" ? MAIN_SECTIONS : ADDITIONAL_SECTIONS)
      .map((section) => ({
        ...section,
        fields:
          activeTab === "additional"
            ? section.fields.filter((field) => shouldRenderAdditionalField(field.key, profile))
            : section.fields,
      }))
      .filter((section) => section.fields.length > 0);

    return (
      <div className="rounded-2xl border border-brand-line bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-brand-ink">{t.title}</h2>
          <button
            type="button"
            onClick={save}
            disabled={status === "saving"}
            className="rounded-lg bg-brand-strong px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-ink disabled:opacity-50"
          >
            {status === "saving" ? t.saving : t.save}
          </button>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("main")}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === "main"
                ? "border-brand bg-brand text-white"
                : "border-brand-line bg-brand-bg/40 text-brand-ink hover:bg-brand-bg"
            }`}
          >
            {t.mainTab}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("additional")}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === "additional"
                ? "border-brand bg-brand text-white"
                : "border-brand-line bg-brand-bg/40 text-brand-ink hover:bg-brand-bg"
            }`}
          >
            {t.additionalTab}
          </button>
        </div>

        {status === "saved" && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">
            {t.saved}
          </div>
        )}
        {status === "error" && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {t.error}
          </div>
        )}
        {syncNotice && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700">
            {syncNotice}
          </div>
        )}

        <div className="space-y-8">
          {sections.map((section, index) => (
            <fieldset key={`${activeTab}-${index}`}>
              <legend className="mb-3 text-sm font-semibold uppercase tracking-wider text-brand">
                {resolveLocalizedText(section.title, lang)}
              </legend>
              <div className="grid gap-4 sm:grid-cols-2">
                {section.fields.map((field) => (
                  <FieldRenderer
                    key={field.key}
                    field={field}
                    lang={lang}
                    value={profile[field.key] ?? ""}
                    onChange={(v) => update(field.key, v)}
                  />
                ))}
              </div>
            </fieldset>
          ))}
        </div>
      </div>
    );
  },
);

export default ProfileEditor;

function FieldRenderer({
  field,
  lang,
  value,
  onChange,
}: {
  field: FieldDef;
  lang: "en" | "ja";
  value: string;
  onChange: (value: string) => void;
}) {
  const label = resolveLocalizedText(field.label, lang) ?? "";
  const placeholder = resolveLocalizedText(field.placeholder, lang);

  if (field.options) {
    return (
      <SelectField
        label={label}
        value={value}
        options={field.options}
        onChange={onChange}
        full={field.full}
      />
    );
  }

  if (field.multiOptions) {
    return (
      <MultiSelectField
        label={label}
        value={value}
        options={field.multiOptions}
        onChange={onChange}
        full={field.full}
      />
    );
  }

  if (field.type === "textarea") {
    return (
      <TextareaField
        label={label}
        value={value}
        rows={field.rows}
        placeholder={placeholder}
        onChange={onChange}
        full={field.full}
      />
    );
  }

  if (field.type === "month") {
    return (
      <MonthPickerField
        label={label}
        placeholder={placeholder}
        value={value}
        lang={lang}
        onChange={onChange}
        full={field.full}
      />
    );
  }

  if (field.type === "date") {
    return (
      <DatePickerField
        label={label}
        placeholder={placeholder}
        value={value}
        lang={lang}
        onChange={onChange}
        full={field.full}
      />
    );
  }

  return (
    <InputField
      label={label}
      type={field.type ?? "text"}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      full={field.full}
    />
  );
}

function resolveLocalizedText(value: string | LocalizedText | undefined, lang: "en" | "ja"): string | undefined {
  if (!value) return undefined;
  if (typeof value === "string") return value;
  return value[lang];
}

function hasMultiOptionValue(value: string, target: string): boolean {
  return String(value || "")
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean)
    .includes(target);
}

function shouldRenderAdditionalField(fieldKey: ProfileKey, profile: Profile): boolean {
  if (fieldKey === "highSchoolGapOther") {
    return hasMultiOptionValue(profile.highSchoolGapReasons, "other");
  }

  if (fieldKey === "awardsRecognitionDetails") {
    return profile.awardsRecognition === "yes";
  }

  if (
    [
      "overseasCountry1",
      "overseasReason1",
      "overseasPeriod1Start",
      "overseasPeriod1End",
      "overseasCountry2",
      "overseasReason2",
      "overseasPeriod2Start",
      "overseasPeriod2End",
      "overseasCountry3",
      "overseasReason3",
      "overseasPeriod3Start",
      "overseasPeriod3End",
      "overseasOtherExperience",
    ].includes(fieldKey)
  ) {
    return profile.overseasExperience === "yes";
  }

  if (
    [
      "vacationPostalCode",
      "vacationPrefecture",
      "vacationAddressLine1",
      "vacationAddressLine2",
      "vacationPhone",
    ].includes(fieldKey)
  ) {
    return profile.vacationAddressSameAsCurrent !== "yes";
  }

  return true;
}

const TEXT_INPUT_CLASSES =
  "w-full rounded-lg border border-brand-line bg-brand-bg/40 px-3 py-2 text-sm text-brand-ink placeholder:text-brand-muted/50 transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";

function InputField({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  full,
}: {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  full?: boolean;
}) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="mb-1 block text-xs font-medium text-brand-muted">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={TEXT_INPUT_CLASSES}
      />
    </label>
  );
}

function FieldShell({
  label,
  full,
  children,
}: {
  label: string;
  full?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="mb-1 block text-xs font-medium text-brand-muted">{label}</span>
      {children}
    </div>
  );
}

function CalendarButton({
  onClick,
  active,
}: {
  onClick: () => void;
  active: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open date picker"
      className={`absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md transition-colors ${
        active ? "bg-brand-bg text-brand-ink" : "text-brand-muted/70 hover:bg-brand-bg hover:text-brand-ink"
      }`}
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 2.25v3m7.5-3v3M3.75 8.25h16.5M6 21h12a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 18 4.5H6A2.25 2.25 0 0 0 3.75 6.75v12A2.25 2.25 0 0 0 6 21Z" />
      </svg>
    </button>
  );
}

function MonthPickerField({
  label,
  placeholder,
  value,
  lang,
  onChange,
  full,
}: {
  label: string;
  placeholder?: string;
  value: string;
  lang: "en" | "ja";
  onChange: (v: string) => void;
  full?: boolean;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const selected = parseNormalizedMonth(value);
  const years = useMemo(() => getPickerYears(), []);
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState<number>(selected?.year ?? new Date().getFullYear());
  const [draft, setDraft] = useState(() => formatMonthInputValue(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!open && selected?.year) {
      setViewYear(selected.year);
    }
  }, [open, selected?.year]);

  useEffect(() => {
    if (!focused) {
      setDraft(formatMonthInputValue(value));
    }
  }, [focused, value]);

  useDismissiblePopover(open, rootRef, () => setOpen(false));

  const commitDraft = useCallback(
    (raw: string) => {
      const nextValue = parseMonthInputValue(raw);
      onChange(nextValue);
      setDraft(nextValue ? formatMonthInputValue(nextValue) : raw.trim());
    },
    [onChange],
  );

  return (
    <FieldShell label={label} full={full}>
      <div ref={rootRef} className="relative">
        <input
          type="text"
          inputMode="numeric"
          placeholder={placeholder ?? "MM/YYYY"}
          value={draft}
          onFocus={() => setFocused(true)}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={(e) => {
            setFocused(false);
            commitDraft(e.target.value);
          }}
          className={`${TEXT_INPUT_CLASSES} pr-10`}
        />
        <CalendarButton onClick={() => setOpen((prev) => !prev)} active={open} />

        {open && (
          <div className="absolute left-0 z-20 mt-2 w-full max-w-[32rem] overflow-hidden rounded-[1.5rem] border border-brand-line bg-white shadow-[0_18px_48px_rgba(20,35,60,0.16)]">
            <div className="flex items-center gap-3 bg-[#eef2f7] px-4 py-4">
              <button
                type="button"
                onClick={() => setViewYear((prev) => prev - 1)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-2xl text-brand-muted transition-colors hover:bg-white hover:text-brand-ink"
                aria-label="Previous year"
              >
                ‹
              </button>
              <select
                value={viewYear}
                onChange={(e) => setViewYear(Number(e.target.value))}
                className="min-w-0 flex-1 appearance-none bg-transparent text-center text-2xl font-semibold text-brand-ink focus:outline-none"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setViewYear((prev) => prev + 1)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-2xl text-brand-muted transition-colors hover:bg-white hover:text-brand-ink"
                aria-label="Next year"
              >
                ›
              </button>
            </div>
            <div className="grid grid-cols-4 gap-x-3 gap-y-4 px-5 py-5">
              {Array.from({ length: 12 }, (_, index) => {
                const month = index + 1;
                const active = selected?.year === viewYear && selected.month === month;
                return (
                  <button
                    key={month}
                    type="button"
                    onClick={() => {
                      const nextValue = `${viewYear}-${pad2(month)}`;
                      onChange(nextValue);
                      setDraft(formatMonthInputValue(nextValue));
                      setFocused(false);
                      setOpen(false);
                    }}
                    className={`rounded-xl border px-3 py-3 text-lg font-medium transition-colors ${
                      active
                        ? "border-[#d9dde5] bg-[#eef0f4] text-brand-ink shadow-[inset_0_0_0_2px_rgba(255,255,255,0.85)]"
                        : "border-transparent bg-white text-brand-ink hover:bg-brand-bg"
                    }`}
                  >
                    {formatMonthLabel(lang, month)}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </FieldShell>
  );
}

function DatePickerField({
  label,
  placeholder,
  value,
  lang,
  onChange,
  full,
}: {
  label: string;
  placeholder?: string;
  value: string;
  lang: "en" | "ja";
  onChange: (v: string) => void;
  full?: boolean;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const years = useMemo(() => getPickerYears(), []);
  const selected = parseNormalizedDate(value);
  const today = new Date();
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState<number>(selected?.year ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(selected?.month ?? today.getMonth() + 1);
  const [draft, setDraft] = useState(() => formatDateInputValue(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!open && selected) {
      setViewYear(selected.year);
      setViewMonth(selected.month);
    }
  }, [open, selected]);

  useEffect(() => {
    if (!focused) {
      setDraft(formatDateInputValue(value));
    }
  }, [focused, value]);

  useDismissiblePopover(open, rootRef, () => setOpen(false));

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const startWeekday = new Date(viewYear, viewMonth - 1, 1).getDay();
  const weekdayLabels = WEEKDAY_COPY[lang];
  const commitDraft = useCallback(
    (raw: string) => {
      const nextValue = parseDateInputValue(raw);
      onChange(nextValue);
      setDraft(nextValue ? formatDateInputValue(nextValue) : raw.trim());
    },
    [onChange],
  );

  return (
    <FieldShell label={label} full={full}>
      <div ref={rootRef} className="relative">
        <input
          type="text"
          inputMode="numeric"
          placeholder={placeholder ?? "MM/DD/YYYY"}
          value={draft}
          onFocus={() => setFocused(true)}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={(e) => {
            setFocused(false);
            commitDraft(e.target.value);
          }}
          className={`${TEXT_INPUT_CLASSES} pr-10`}
        />
        <CalendarButton onClick={() => setOpen((prev) => !prev)} active={open} />

        {open && (
          <div className="absolute left-0 z-20 mt-2 w-full max-w-[32rem] overflow-hidden rounded-[1.5rem] border border-brand-line bg-white shadow-[0_18px_48px_rgba(20,35,60,0.16)]">
            <div className="flex items-center gap-2 bg-[#eef2f7] px-4 py-4">
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(Number(e.target.value))}
                className="min-w-0 flex-1 appearance-none rounded-xl border border-transparent bg-white/70 px-3 py-2 text-base font-semibold text-brand-ink focus:border-brand-line focus:outline-none"
              >
                {Array.from({ length: 12 }, (_, index) => {
                  const month = index + 1;
                  return (
                    <option key={month} value={month}>
                      {formatMonthLabel(lang, month)}
                    </option>
                  );
                })}
              </select>
              <select
                value={viewYear}
                onChange={(e) => setViewYear(Number(e.target.value))}
                className="min-w-0 flex-1 appearance-none rounded-xl border border-transparent bg-white/70 px-3 py-2 text-base font-semibold text-brand-ink focus:border-brand-line focus:outline-none"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-7 gap-1 px-4 pt-4 text-center text-[11px] font-semibold uppercase tracking-wide text-brand-muted">
              {weekdayLabels.map((weekday) => (
                <div key={weekday} className="py-1">
                  {weekday}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 px-4 pb-4 pt-1">
              {Array.from({ length: startWeekday }).map((_, index) => (
                <div key={`blank-${index}`} className="h-9" />
              ))}
              {Array.from({ length: daysInMonth }, (_, index) => {
                const day = index + 1;
                const active =
                  selected?.year === viewYear &&
                  selected.month === viewMonth &&
                  selected.day === day;

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => {
                      const nextValue = `${viewYear}-${pad2(viewMonth)}-${pad2(day)}`;
                      onChange(nextValue);
                      setDraft(formatDateInputValue(nextValue));
                      setFocused(false);
                      setOpen(false);
                    }}
                    className={`h-10 rounded-xl text-sm font-medium transition-colors ${
                      active
                        ? "border border-[#d9dde5] bg-[#eef0f4] text-brand-ink shadow-[inset_0_0_0_2px_rgba(255,255,255,0.85)]"
                        : "border border-transparent text-brand-ink hover:bg-brand-bg"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </FieldShell>
  );
}

function TextareaField({
  label,
  rows,
  placeholder,
  value,
  onChange,
  full,
}: {
  label: string;
  rows?: number;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  full?: boolean;
}) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="mb-1 block text-xs font-medium text-brand-muted">{label}</span>
      <textarea
        rows={rows ?? 4}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-brand-line bg-brand-bg/40 px-3 py-2 text-sm text-brand-ink placeholder:text-brand-muted/50 transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
  full,
}: {
  label: string;
  value: string;
  options: readonly ChoiceOption[];
  onChange: (v: string) => void;
  full?: boolean;
}) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="mb-1 block text-xs font-medium text-brand-muted">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-brand-line bg-brand-bg/40 px-3 py-2 text-sm text-brand-ink transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function MultiSelectField({
  label,
  value,
  options,
  onChange,
  full,
}: {
  label: string;
  value: string;
  options: readonly ChoiceOption[];
  onChange: (v: string) => void;
  full?: boolean;
}) {
  const selected = new Set(
    String(value || "")
      .split("|")
      .map((x) => x.trim())
      .filter(Boolean),
  );

  return (
    <div className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="mb-1 block text-xs font-medium text-brand-muted">{label}</span>
      <div className="max-h-56 space-y-2 overflow-auto rounded-lg border border-brand-line bg-brand-bg/40 p-3">
        {options.map((opt) => {
          const checked = selected.has(opt.value);
          return (
            <label key={opt.value} className="flex cursor-pointer items-center gap-2 text-sm text-brand-ink">
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => {
                  const next = new Set(selected);
                  if (e.target.checked) {
                    next.add(opt.value);
                  } else {
                    next.delete(opt.value);
                  }
                  onChange(Array.from(next).join("|"));
                }}
                className="h-4 w-4 rounded border-brand-line text-brand focus:ring-brand"
              />
              <span>{opt.label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
