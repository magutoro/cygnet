"use client";

import { useState, useCallback, useImperativeHandle, forwardRef } from "react";
import { createClient } from "@/lib/supabase/client";
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

type FieldDef = {
  key: ProfileKey;
  label: string;
  type?: "text" | "email" | "date" | "textarea";
  placeholder?: string;
  options?: readonly ChoiceOption[];
  multiOptions?: readonly ChoiceOption[];
  full?: boolean;
  rows?: number;
};

type SectionDef = {
  title: string;
  fields: FieldDef[];
};

const YES_NO_OPTIONS: ChoiceOption[] = [
  { value: "", label: "未設定" },
  { value: "yes", label: "はい / Yes" },
  { value: "no", label: "いいえ / No" },
];

const DEGREE_OPTIONS: ChoiceOption[] = [
  { value: "", label: "未設定" },
  { value: "bachelor", label: "学士 / Bachelor" },
  { value: "master", label: "修士 / Master" },
  { value: "doctor", label: "博士 / Doctor" },
  { value: "other", label: "その他 / Other" },
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
    title: "Basic info",
    fields: [
      { key: "lastNameKanji", label: "Last name (漢字)", placeholder: "山田" },
      { key: "firstNameKanji", label: "First name (漢字)", placeholder: "太郎" },
      { key: "lastNameKana", label: "Last name (カナ)", placeholder: "やまだ" },
      { key: "firstNameKana", label: "First name (カナ)", placeholder: "たろう" },
      { key: "lastNameEnglish", label: "Last name (English)", placeholder: "Yamada" },
      { key: "firstNameEnglish", label: "First name (English)", placeholder: "Taro" },
      { key: "preferredName", label: "Preferred name" },
      { key: "gender", label: "Gender", options: GENDER_OPTIONS },
      { key: "birthDate", label: "Birth date", type: "date" },
    ],
  },
  {
    title: "Contact & address",
    fields: [
      { key: "email", label: "Email", type: "email" },
      { key: "mobileEmail", label: "Mobile email", type: "email" },
      { key: "phone", label: "Phone", placeholder: "090-1234-5678" },
      { key: "postalCode", label: "Postal code", placeholder: "100-0001" },
      { key: "prefecture", label: "Prefecture", placeholder: "東京都" },
      { key: "city", label: "City", placeholder: "千代田区" },
      { key: "addressLine1", label: "Address line 1" },
      { key: "addressLine2", label: "Address line 2" },
    ],
  },
  {
    title: "Education",
    fields: [
      { key: "educationType", label: "School type", options: EDUCATION_TYPE_OPTIONS },
      { key: "universityKanaInitial", label: "University kana initial" },
      { key: "university", label: "University", placeholder: "東京大学" },
      { key: "universityPrefecture", label: "University prefecture" },
      { key: "faculty", label: "Faculty" },
      { key: "department", label: "Department" },
      { key: "humanitiesScienceType", label: "Arts/Science", options: HUMANITIES_SCIENCE_OPTIONS },
      { key: "graduationYear", label: "Graduation year/month", placeholder: "2026-03" },
    ],
  },
  {
    title: "Career & links",
    fields: [
      { key: "company", label: "Company" },
      { key: "linkedIn", label: "LinkedIn URL" },
      { key: "github", label: "GitHub URL" },
      { key: "portfolio", label: "Portfolio URL" },
    ],
  },
];

const ADDITIONAL_SECTIONS: SectionDef[] = [
  {
    title: "最終学歴情報 / Latest academic information",
    fields: [
      { key: "degree", label: "学位 / Degree", options: DEGREE_OPTIONS },
      {
        key: "schoolAttendanceReasons",
        label: "在学期間の理由 / Period of School Attendance",
        multiOptions: SCHOOL_ATTENDANCE_REASON_OPTIONS,
        full: true,
      },
      { key: "schoolAttendanceOtherReason", label: "在学期間(その他)", full: true },
      { key: "seminarLaboratory", label: "所属ゼミ・研究室名", full: true },
      { key: "researchTheme", label: "専攻テーマ・研究テーマ(題名)", full: true },
      { key: "schoolClubActivity", label: "所属クラブ・サークル名", full: true },
    ],
  },
  {
    title: "経験と志望 / Experiences and reasons",
    fields: [
      { key: "schoolLifeExperience1", label: "学生時代の経験 1", type: "textarea", rows: 4, full: true },
      { key: "schoolLifeExperience2", label: "学生時代の経験 2", type: "textarea", rows: 4, full: true },
    ],
  },
  {
    title: "その他学歴 / Other education",
    fields: [
      { key: "otherEducationSchool1", label: "大学1 / School1", full: true },
      { key: "otherEducationDepartment1", label: "学部学科1 / Department and major1", full: true },
      { key: "otherEducationAdmission1", label: "入学・留学開始年月1", placeholder: "YYYY-MM" },
      { key: "otherEducationGraduation1", label: "卒業・留学修了年月1", placeholder: "YYYY-MM" },
      { key: "otherEducationSchool2", label: "大学2 / School2", full: true },
      { key: "otherEducationDepartment2", label: "学部学科2 / Department and major2", full: true },
      { key: "otherEducationAdmission2", label: "入学・留学開始年月2", placeholder: "YYYY-MM" },
      { key: "otherEducationGraduation2", label: "卒業・留学修了年月2", placeholder: "YYYY-MM" },
    ],
  },
  {
    title: "海外経験 / Overseas experience",
    fields: [
      { key: "overseasExperience", label: "海外経験の有無", options: YES_NO_OPTIONS },
      { key: "overseasCountry1", label: "国名1 / Country1" },
      { key: "overseasReason1", label: "滞在理由1", options: OVERSEAS_REASON_OPTIONS },
      { key: "overseasPeriod1Start", label: "滞在期間1 開始", placeholder: "YYYY-MM" },
      { key: "overseasPeriod1End", label: "滞在期間1 終了", placeholder: "YYYY-MM" },
      { key: "overseasCountry2", label: "国名2 / Country2" },
      { key: "overseasReason2", label: "滞在理由2", options: OVERSEAS_REASON_OPTIONS },
      { key: "overseasPeriod2Start", label: "滞在期間2 開始", placeholder: "YYYY-MM" },
      { key: "overseasPeriod2End", label: "滞在期間2 終了", placeholder: "YYYY-MM" },
      { key: "overseasCountry3", label: "国名3 / Country3" },
      { key: "overseasReason3", label: "滞在理由3", options: OVERSEAS_REASON_OPTIONS },
      { key: "overseasPeriod3Start", label: "滞在期間3 開始", placeholder: "YYYY-MM" },
      { key: "overseasPeriod3End", label: "滞在期間3 終了", placeholder: "YYYY-MM" },
      { key: "overseasOtherExperience", label: "その他海外経験", type: "textarea", rows: 4, full: true },
    ],
  },
  {
    title: "語学能力・その他 / Language and others",
    fields: [
      { key: "hospitalizedTwoWeeks", label: "2週間以上の入院歴", options: YES_NO_OPTIONS },
      { key: "workConsiderations", label: "勤務上配慮事項", type: "textarea", rows: 3, full: true },
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
      { key: "criminalRecord", label: "罰有無", options: YES_NO_OPTIONS },
    ],
  },
  {
    title: "職務経歴 / Work history",
    fields: [
      { key: "workHistoryCompany1", label: "勤務先名（1社目）", full: true },
      { key: "workHistoryPeriod1Start", label: "勤務期間1 開始", placeholder: "YYYY-MM" },
      { key: "workHistoryPeriod1End", label: "勤務期間1 終了", placeholder: "YYYY-MM" },
      { key: "workHistoryEmploymentStatus1", label: "雇用形態（1社目）", options: WORK_EMPLOYMENT_OPTIONS },
      { key: "workHistoryResponsibilities1", label: "業務内容（1社目）", full: true },
      { key: "workHistoryJobStatus1", label: "在職状況（1社目）", options: WORK_STATUS_OPTIONS },
      { key: "workHistoryCompany2", label: "勤務先名（2社目）", full: true },
      { key: "workHistoryPeriod2Start", label: "勤務期間2 開始", placeholder: "YYYY-MM" },
      { key: "workHistoryPeriod2End", label: "勤務期間2 終了", placeholder: "YYYY-MM" },
      { key: "workHistoryEmploymentStatus2", label: "雇用形態（2社目）", options: WORK_EMPLOYMENT_OPTIONS },
      { key: "workHistoryResponsibilities2", label: "業務内容（2社目）", full: true },
      { key: "workHistoryJobStatus2", label: "在職状況（2社目）", options: WORK_STATUS_OPTIONS },
      { key: "workHistoryOther", label: "その他職務経歴", type: "textarea", rows: 4, full: true },
    ],
  },
  {
    title: "高校情報 / High school",
    fields: [
      { key: "highSchool", label: "高校 / High school", full: true },
      { key: "highSchoolGraduationDate", label: "高校卒業年月", placeholder: "YYYY-MM" },
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
    title: "最終学歴について / About latest academic background",
    fields: [
      { key: "latestAcademicAdmissionDate", label: "入学年月 / Admission date", placeholder: "YYYY-MM" },
      { key: "latestAcademicOverseasSchool", label: "最終学歴は海外学校か", options: YES_NO_OPTIONS },
      { key: "latestAcademicUniversityLocation", label: "所在国 / University location" },
      { key: "latestAcademicUniversityLocationOther", label: "所在国（その他）", full: true },
      { key: "latestAcademicUniversityName", label: "大学 / University" },
      { key: "latestAcademicUniversityNameOther", label: "大学（その他）", full: true },
      { key: "latestAcademicDepartmentName", label: "学部 / Department" },
      { key: "latestAcademicDepartmentNameOther", label: "学部（その他）", full: true },
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
    title: "エントリー情報 / Entry",
    fields: [
      { key: "reasonForEntry", label: "エントリーのきっかけ", options: REASON_FOR_ENTRY_OPTIONS, full: true },
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

function normalizeProfileLinks(profile: Profile): Profile {
  const next: Profile = { ...profile };
  for (const key of URL_PROFILE_KEYS) {
    next[key] = normalizeProfileUrl(next[key]);
  }
  return next;
}

const ProfileEditor = forwardRef<ProfileEditorHandle, Props>(
  function ProfileEditor({ initialProfile, userId }, ref) {
    const [profile, setProfile] = useState<Profile>(initialProfile);
    const [status, setStatus] = useState<SaveStatus>("idle");
    const [activeTab, setActiveTab] = useState<TabKey>("main");

    const update = useCallback((key: ProfileKey, value: string) => {
      setProfile((prev) => ({ ...prev, [key]: value }));
      setStatus("idle");
    }, []);

    const applyPartial = useCallback((partial: Partial<Profile>) => {
      const safePatch: Record<string, string> = {};
      for (const [key, value] of Object.entries(partial)) {
        if (typeof value === "string") safePatch[key] = value;
      }
      setProfile((prev) => ({ ...prev, ...safePatch }));
      setStatus("idle");
    }, []);

    useImperativeHandle(ref, () => ({ applyPartial }), [applyPartial]);

    const save = async () => {
      setStatus("saving");
      try {
        const supabase = createClient();
        const normalizedProfile = normalizeProfileLinks(profile);
        const dbData = profileToDb(normalizedProfile);
        const { error } = await supabase
          .from("profiles")
          .upsert({ id: userId, ...dbData, updated_at: new Date().toISOString() }, { onConflict: "id" });
        setProfile(normalizedProfile);
        setStatus(error ? "error" : "saved");
      } catch {
        setStatus("error");
      }
    };

    const sections = activeTab === "main" ? MAIN_SECTIONS : ADDITIONAL_SECTIONS;

    return (
      <div className="rounded-2xl border border-brand-line bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-brand-ink">Profile</h2>
          <button
            type="button"
            onClick={save}
            disabled={status === "saving"}
            className="rounded-lg bg-brand-strong px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-ink disabled:opacity-50"
          >
            {status === "saving" ? "Saving…" : "Save"}
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
            メイン
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
            追加情報
          </button>
        </div>

        {status === "saved" && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">
            Profile saved successfully.
          </div>
        )}
        {status === "error" && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            Failed to save. Please try again.
          </div>
        )}

        <div className="space-y-8">
          {sections.map((section) => (
            <fieldset key={section.title}>
              <legend className="mb-3 text-sm font-semibold uppercase tracking-wider text-brand">
                {section.title}
              </legend>
              <div className="grid gap-4 sm:grid-cols-2">
                {section.fields.map((field) => (
                  <FieldRenderer
                    key={field.key}
                    field={field}
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
  value,
  onChange,
}: {
  field: FieldDef;
  value: string;
  onChange: (value: string) => void;
}) {
  if (field.options) {
    return (
      <SelectField
        label={field.label}
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
        label={field.label}
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
        label={field.label}
        value={value}
        rows={field.rows}
        placeholder={field.placeholder}
        onChange={onChange}
        full={field.full}
      />
    );
  }

  return (
    <InputField
      label={field.label}
      type={field.type ?? "text"}
      placeholder={field.placeholder}
      value={value}
      onChange={onChange}
      full={field.full}
    />
  );
}

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
        className="w-full rounded-lg border border-brand-line bg-brand-bg/40 px-3 py-2 text-sm text-brand-ink placeholder:text-brand-muted/50 transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
      />
    </label>
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
