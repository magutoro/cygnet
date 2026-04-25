import { useCallback, useEffect, useRef, useState } from "react";
import {
  DEFAULT_PROFILE,
  GENDER_OPTIONS,
  EDUCATION_TYPE_OPTIONS,
  HUMANITIES_SCIENCE_OPTIONS,
  extractKatakanaCandidate,
  normalizeProfileUrl
} from "@cygnet/shared";
import type { Profile, Settings } from "@cygnet/shared";
import { getSettings, saveSettings } from "../lib/storage.js";
import { startSignIn, signOut, getUser, waitForUser, onAuthStateChange } from "../lib/auth.js";
import {
  getSignInBusyLabel,
  getSignInLabel,
  getSignInOpenedStatus,
  getSignInRequiredMessage,
} from "../lib/browser.js";
import { syncProfile, pushProfileToSupabase } from "../lib/sync.js";
import { openWebDashboard } from "../lib/web.js";
import type { User } from "@supabase/supabase-js";

type ProfileKey = string;
type TabKey = "main" | "additional";

interface ChoiceDef {
  value: string;
  label: string;
}

interface FieldDef {
  name: ProfileKey;
  label: string;
  type?: string;
  placeholder?: string;
  options?: ReadonlyArray<ChoiceDef>;
  multiOptions?: ReadonlyArray<ChoiceDef>;
  full?: boolean;
  rows?: number;
}

interface SectionDef {
  title: string;
  fields: FieldDef[];
}

const YES_NO_OPTIONS: ChoiceDef[] = [
  { value: "", label: "未設定" },
  { value: "yes", label: "はい / Yes" },
  { value: "no", label: "いいえ / No" }
];

const DEGREE_OPTIONS: ChoiceDef[] = [
  { value: "", label: "未設定" },
  { value: "bachelor", label: "学士 / Bachelor" },
  { value: "master", label: "修士 / Master" },
  { value: "doctor", label: "博士 / Doctor" },
  { value: "other", label: "その他 / Other" }
];

const ENGLISH_ABILITY_OPTIONS: ChoiceDef[] = [
  { value: "", label: "未設定" },
  { value: "none", label: "未経験" },
  { value: "basic", label: "基礎" },
  { value: "daily", label: "日常会話" },
  { value: "business", label: "ビジネス" },
  { value: "native", label: "ネイティブ" }
];

const WORK_EMPLOYMENT_OPTIONS: ChoiceDef[] = [
  { value: "", label: "未設定" },
  { value: "full_time", label: "正社員" },
  { value: "contract", label: "契約社員" },
  { value: "dispatch", label: "派遣社員" },
  { value: "part_time", label: "アルバイト" },
  { value: "other", label: "その他" }
];

const WORK_STATUS_OPTIONS: ChoiceDef[] = [
  { value: "", label: "未設定" },
  { value: "currently_employed", label: "在職中 / Currently employed" },
  { value: "planning_to_resign", label: "退職予定 / Planning to resign" },
  { value: "resigned", label: "退職済み / Resigned" }
];

const OVERSEAS_REASON_OPTIONS: ChoiceDef[] = [
  { value: "", label: "未設定" },
  { value: "study_abroad", label: "留学" },
  { value: "work", label: "就業" },
  { value: "internship", label: "インターン" },
  { value: "volunteer", label: "ボランティア" },
  { value: "family", label: "家族都合" },
  { value: "other", label: "その他" }
];

const REASON_FOR_ENTRY_OPTIONS: ChoiceDef[] = [
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
  { value: "other", label: "その他 / Others" }
];

const SCHOOL_ATTENDANCE_REASON_OPTIONS: ChoiceDef[] = [
  { value: "study_abroad", label: "留学のため / To study abroad" },
  { value: "job_search", label: "就職浪人のため / To search for jobs" },
  { value: "repeat_year", label: "学業による留年のため / To repeat a year" },
  { value: "grad_exam", label: "大学院受験のため（浪人） / Graduate school entrance exam" },
  { value: "other", label: "その他 / Other" }
];

const HIGH_SCHOOL_GAP_REASON_OPTIONS: ChoiceDef[] = [
  { value: "prep_university_exam", label: "大学受験のため（浪人）" },
  { value: "study_abroad_after_grad", label: "卒業後の留学のため" },
  { value: "overseas_university", label: "高校と異なる国の大学に入学したため" },
  { value: "other", label: "その他" }
];

const LICENSE_CERTIFICATION_OPTIONS: ChoiceDef[] = [
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
  { value: "cpa", label: "公認会計士" }
];

const BASIC_FIELDS: FieldDef[] = [
  { name: "lastNameKanji", label: "姓(漢字)" },
  { name: "firstNameKanji", label: "名(漢字)" },
  { name: "lastNameKana", label: "姓(フリガナ・カタカナ)" },
  { name: "firstNameKana", label: "名(フリガナ・カタカナ)" },
  { name: "lastNameEnglish", label: "姓(English)" },
  { name: "firstNameEnglish", label: "名(English)" },
  { name: "preferredName", label: "希望名 / Preferred Name" },
  { name: "gender", label: "性別", options: GENDER_OPTIONS },
  { name: "email", label: "Email", type: "email" },
  { name: "mobileEmail", label: "携帯Email(任意)", type: "email" },
  { name: "phone", label: "電話番号" },
  { name: "postalCode", label: "郵便番号" },
  { name: "prefecture", label: "都道府県" },
  { name: "city", label: "市区町村" },
  { name: "addressLine1", label: "住所1" },
  { name: "addressLine2", label: "住所2" },
  { name: "birthDate", label: "生年月日(YYYY-MM-DD)", type: "date" }
];

const EDUCATION_FIELDS: FieldDef[] = [
  { name: "educationType", label: "学校の種類", options: EDUCATION_TYPE_OPTIONS },
  { name: "universityKanaInitial", label: "学校名の頭文字(任意)" },
  { name: "university", label: "学校名" },
  { name: "universityPrefecture", label: "学校所在地(任意)" },
  { name: "faculty", label: "学部" },
  { name: "department", label: "学科" },
  { name: "humanitiesScienceType", label: "文理区分", options: HUMANITIES_SCIENCE_OPTIONS },
  { name: "graduationYear", label: "卒業年月", placeholder: "YYYY-MM" },
  { name: "company", label: "現職会社" }
];

const LINKS_FIELDS: FieldDef[] = [
  { name: "linkedIn", label: "LinkedIn URL" },
  { name: "github", label: "GitHub URL" },
  { name: "portfolio", label: "Portfolio URL" }
];

const ADDITIONAL_LATEST_ACADEMIC_FIELDS: FieldDef[] = [
  { name: "degree", label: "学位 / Degree", options: DEGREE_OPTIONS },
  {
    name: "schoolAttendanceReasons",
    label: "在学期間の理由 / Period of School Attendance",
    multiOptions: SCHOOL_ATTENDANCE_REASON_OPTIONS,
    full: true
  },
  { name: "schoolAttendanceOtherReason", label: "在学期間(その他)" , full: true },
  { name: "seminarLaboratory", label: "所属ゼミ・研究室名", full: true },
  { name: "researchTheme", label: "専攻テーマ・研究テーマ(題名)", full: true },
  { name: "schoolClubActivity", label: "所属クラブ・サークル名", full: true }
];

const ADDITIONAL_SCHOOL_LIFE_FIELDS: FieldDef[] = [
  { name: "schoolLifeExperience1", label: "学生時代の経験 1", rows: 4, full: true },
  { name: "schoolLifeExperience2", label: "学生時代の経験 2", rows: 4, full: true }
];

const ADDITIONAL_OTHER_EDUCATION_FIELDS: FieldDef[] = [
  { name: "otherEducationSchool1", label: "大学1 / School1", full: true },
  { name: "otherEducationDepartment1", label: "学部学科1 / Department and major1", full: true },
  { name: "otherEducationAdmission1", label: "入学・留学開始年月1", placeholder: "YYYY-MM" },
  { name: "otherEducationGraduation1", label: "卒業・留学修了年月1", placeholder: "YYYY-MM" },
  { name: "otherEducationSchool2", label: "大学2 / School2", full: true },
  { name: "otherEducationDepartment2", label: "学部学科2 / Department and major2", full: true },
  { name: "otherEducationAdmission2", label: "入学・留学開始年月2", placeholder: "YYYY-MM" },
  { name: "otherEducationGraduation2", label: "卒業・留学修了年月2", placeholder: "YYYY-MM" }
];

const ADDITIONAL_OVERSEAS_FIELDS: FieldDef[] = [
  { name: "overseasExperience", label: "海外経験の有無", options: YES_NO_OPTIONS },
  { name: "overseasCountry1", label: "国名1 / Country1" },
  { name: "overseasReason1", label: "滞在理由1", options: OVERSEAS_REASON_OPTIONS },
  { name: "overseasPeriod1Start", label: "滞在期間1 開始", placeholder: "YYYY-MM" },
  { name: "overseasPeriod1End", label: "滞在期間1 終了", placeholder: "YYYY-MM" },
  { name: "overseasCountry2", label: "国名2 / Country2" },
  { name: "overseasReason2", label: "滞在理由2", options: OVERSEAS_REASON_OPTIONS },
  { name: "overseasPeriod2Start", label: "滞在期間2 開始", placeholder: "YYYY-MM" },
  { name: "overseasPeriod2End", label: "滞在期間2 終了", placeholder: "YYYY-MM" },
  { name: "overseasCountry3", label: "国名3 / Country3" },
  { name: "overseasReason3", label: "滞在理由3", options: OVERSEAS_REASON_OPTIONS },
  { name: "overseasPeriod3Start", label: "滞在期間3 開始", placeholder: "YYYY-MM" },
  { name: "overseasPeriod3End", label: "滞在期間3 終了", placeholder: "YYYY-MM" },
  { name: "overseasOtherExperience", label: "その他海外経験", rows: 4, full: true }
];

const ADDITIONAL_LANGUAGE_FIELDS: FieldDef[] = [
  { name: "hospitalizedTwoWeeks", label: "2週間以上の入院歴", options: YES_NO_OPTIONS },
  { name: "workConsiderations", label: "勤務上配慮事項", rows: 3, full: true },
  { name: "englishAbility", label: "英語レベル", options: ENGLISH_ABILITY_OPTIONS },
  { name: "toeicScore", label: "TOEICスコア" },
  { name: "toeicScoreCertificate", label: "TOEICスコアシート" },
  { name: "toeflIbtScore", label: "TOEFL iBTスコア" },
  { name: "toeflCbtScore", label: "TOEFL CBTスコア" },
  { name: "toeflItpScore", label: "TOEFL iTPスコア" },
  { name: "ieltsScore", label: "IELTSスコア" },
  { name: "languageOtherScores", label: "その他語学スコア・資格", rows: 3, full: true }
];

const ADDITIONAL_LICENSE_FIELDS: FieldDef[] = [
  {
    name: "licensesCertifications",
    label: "免許・資格",
    multiOptions: LICENSE_CERTIFICATION_OPTIONS,
    full: true
  },
  { name: "driverLicense", label: "自動車免許", options: YES_NO_OPTIONS },
  { name: "otherLicensesCertifications", label: "その他免許・資格", full: true },
  { name: "awardsRecognition", label: "賞有無", options: YES_NO_OPTIONS },
  { name: "awardsRecognitionDetails", label: "賞の詳細", full: true },
  { name: "criminalRecord", label: "罰有無", options: YES_NO_OPTIONS }
];

const ADDITIONAL_WORK_HISTORY_FIELDS: FieldDef[] = [
  { name: "workHistoryCompany1", label: "勤務先名（1社目）", full: true },
  { name: "workHistoryPeriod1Start", label: "勤務期間1 開始", placeholder: "YYYY-MM" },
  { name: "workHistoryPeriod1End", label: "勤務期間1 終了", placeholder: "YYYY-MM" },
  { name: "workHistoryEmploymentStatus1", label: "雇用形態（1社目）", options: WORK_EMPLOYMENT_OPTIONS },
  { name: "workHistoryResponsibilities1", label: "業務内容（1社目）", full: true },
  { name: "workHistoryJobStatus1", label: "在職状況（1社目）", options: WORK_STATUS_OPTIONS },
  { name: "workHistoryCompany2", label: "勤務先名（2社目）", full: true },
  { name: "workHistoryPeriod2Start", label: "勤務期間2 開始", placeholder: "YYYY-MM" },
  { name: "workHistoryPeriod2End", label: "勤務期間2 終了", placeholder: "YYYY-MM" },
  { name: "workHistoryEmploymentStatus2", label: "雇用形態（2社目）", options: WORK_EMPLOYMENT_OPTIONS },
  { name: "workHistoryResponsibilities2", label: "業務内容（2社目）", full: true },
  { name: "workHistoryJobStatus2", label: "在職状況（2社目）", options: WORK_STATUS_OPTIONS },
  { name: "workHistoryOther", label: "その他職務経歴", rows: 4, full: true }
];

const ADDITIONAL_HIGH_SCHOOL_FIELDS: FieldDef[] = [
  { name: "highSchool", label: "高校 / High school", full: true },
  { name: "highSchoolGraduationDate", label: "高校卒業年月", placeholder: "YYYY-MM" },
  {
    name: "highSchoolGapReasons",
    label: "高校卒業後の理由",
    multiOptions: HIGH_SCHOOL_GAP_REASON_OPTIONS,
    full: true
  },
  { name: "highSchoolGapOther", label: "高校卒業後の理由（その他）", full: true }
];

const ADDITIONAL_LATEST_BACKGROUND_FIELDS: FieldDef[] = [
  { name: "latestAcademicAdmissionDate", label: "入学年月 / Admission date", placeholder: "YYYY-MM" },
  { name: "latestAcademicOverseasSchool", label: "最終学歴は海外学校か", options: YES_NO_OPTIONS },
  { name: "latestAcademicUniversityLocation", label: "所在国 / University location" },
  { name: "latestAcademicUniversityLocationOther", label: "所在国（その他）", full: true },
  { name: "latestAcademicUniversityName", label: "大学 / University" },
  { name: "latestAcademicUniversityNameOther", label: "大学（その他）", full: true },
  { name: "latestAcademicDepartmentName", label: "学部 / Department" },
  { name: "latestAcademicDepartmentNameOther", label: "学部（その他）", full: true }
];

const ADDITIONAL_NATIONALITY_FIELDS: FieldDef[] = [
  { name: "nationalityPrimary", label: "第1国籍" },
  { name: "nationalitySecondary", label: "第2国籍" }
];

const ADDITIONAL_ENTRY_FIELDS: FieldDef[] = [
  { name: "reasonForEntry", label: "エントリーのきっかけ", options: REASON_FOR_ENTRY_OPTIONS, full: true }
];

const ADDITIONAL_VACATION_CONTACT_FIELDS: FieldDef[] = [
  { name: "vacationAddressSameAsCurrent", label: "休暇中住所が現住所と同じ", options: YES_NO_OPTIONS },
  { name: "vacationPostalCode", label: "休暇中 郵便番号" },
  { name: "vacationPrefecture", label: "休暇中 都道府県" },
  { name: "vacationAddressLine1", label: "休暇中 市区郡・地名・番地", full: true },
  { name: "vacationAddressLine2", label: "休暇中 アパート・マンション名・番号", full: true },
  { name: "vacationPhone", label: "休暇中 電話番号" }
];

const MAIN_SECTIONS: SectionDef[] = [
  { title: "基本情報", fields: BASIC_FIELDS },
  { title: "学歴・職歴", fields: EDUCATION_FIELDS },
  { title: "リンク", fields: LINKS_FIELDS }
];

const ADDITIONAL_SECTIONS: SectionDef[] = [
  { title: "最終学歴情報", fields: ADDITIONAL_LATEST_ACADEMIC_FIELDS },
  { title: "経験と志望", fields: ADDITIONAL_SCHOOL_LIFE_FIELDS },
  { title: "その他学歴", fields: ADDITIONAL_OTHER_EDUCATION_FIELDS },
  { title: "海外経験", fields: ADDITIONAL_OVERSEAS_FIELDS },
  { title: "語学能力・その他", fields: ADDITIONAL_LANGUAGE_FIELDS },
  { title: "資格・賞罰", fields: ADDITIONAL_LICENSE_FIELDS },
  { title: "職務経歴", fields: ADDITIONAL_WORK_HISTORY_FIELDS },
  { title: "高校情報", fields: ADDITIONAL_HIGH_SCHOOL_FIELDS },
  { title: "最終学歴について", fields: ADDITIONAL_LATEST_BACKGROUND_FIELDS },
  { title: "国籍", fields: ADDITIONAL_NATIONALITY_FIELDS },
  { title: "エントリー情報", fields: ADDITIONAL_ENTRY_FIELDS },
  { title: "休暇中の連絡先", fields: ADDITIONAL_VACATION_CONTACT_FIELDS }
];

const URL_PROFILE_KEYS: ProfileKey[] = ["linkedIn", "github", "portfolio"];

function normalizeProfileLinks(profile: Profile): Profile {
  const next: Profile = { ...profile };
  for (const key of URL_PROFILE_KEYS) {
    next[key] = normalizeProfileUrl(next[key]);
  }
  return next;
}

function Field({
  def,
  value,
  onChange
}: {
  def: FieldDef;
  value: string;
  onChange: (name: ProfileKey, value: string) => void;
}) {
  if (def.options) {
    return (
      <label className={def.full ? "full" : undefined}>
        {def.label}
        <select value={value} onChange={(e) => onChange(def.name, e.target.value)}>
          {def.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>
    );
  }

  if (def.multiOptions) {
    const selected = new Set(
      String(value || "")
        .split("|")
        .map((x) => x.trim())
        .filter(Boolean)
    );

    return (
      <label className={def.full ? "full" : undefined}>
        {def.label}
        <div className="multi-options">
          {def.multiOptions.map((opt) => {
            const checked = selected.has(opt.value);
            return (
              <label key={opt.value} className="multi-option-item">
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
                    onChange(def.name, Array.from(next).join("|"));
                  }}
                />
                <span>{opt.label}</span>
              </label>
            );
          })}
        </div>
      </label>
    );
  }

  if (def.rows) {
    return (
      <label className={def.full ? "full" : undefined}>
        {def.label}
        <textarea rows={def.rows} value={value} onChange={(e) => onChange(def.name, e.target.value)} />
      </label>
    );
  }

  return (
    <label className={def.full ? "full" : undefined}>
      {def.label}
      <input
        type={def.type || "text"}
        placeholder={def.placeholder}
        value={value}
        onChange={(e) => onChange(def.name, e.target.value)}
      />
    </label>
  );
}

function FieldGrid({
  fields,
  profile,
  onChange
}: {
  fields: FieldDef[];
  profile: Profile;
  onChange: (name: ProfileKey, value: string) => void;
}) {
  return (
    <div className="grid">
      {fields.map((def) => (
        <Field key={def.name} def={def} value={profile[def.name] || ""} onChange={onChange} />
      ))}
    </div>
  );
}

function SectionList({
  sections,
  profile,
  onChange
}: {
  sections: SectionDef[];
  profile: Profile;
  onChange: (name: ProfileKey, value: string) => void;
}) {
  return (
    <>
      {sections.map((section) => (
        <section key={section.title}>
          <h2>{section.title}</h2>
          <FieldGrid fields={section.fields} profile={profile} onChange={onChange} />
        </section>
      ))}
    </>
  );
}

export function App() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [status, setStatus] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("main");
  const composingRef = useRef<{ lastKana: Record<string, string> }>({ lastKana: {} });

  const refreshState = useCallback(async () => {
    const [nextSettings, nextUser] = await Promise.all([getSettings(), getUser()]);
    setSettings(nextSettings);
    setUser(nextUser);
    if (!nextUser) return;

    await syncProfile().catch(() => {});
    const refreshed = await getSettings();
    setSettings(refreshed);
  }, []);

  useEffect(() => {
    refreshState().catch(() => {});
    const unsubscribe = onAuthStateChange((nextUser) => {
      setUser(nextUser);
      if (nextUser) {
        syncProfile().then(() => getSettings().then(setSettings)).catch(() => {});
      }
    });

    const storageListener = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string
    ) => {
      if (changes.settings && (areaName === "sync" || areaName === "local")) {
        const next = changes.settings.newValue as Settings | undefined;
        if (next) setSettings(next);
      }
      if (areaName === "local" && changes.cygnetStateVersion) {
        refreshState().catch(() => {});
      }
    };

    const runtimeListener = (msg: { type?: string }) => {
      if (msg?.type === "CYGNET_REFRESH_STATE") {
        refreshState().catch(() => {});
      }
    };

    chrome.storage.onChanged.addListener(storageListener);
    chrome.runtime.onMessage.addListener(runtimeListener);
    return () => {
      unsubscribe();
      chrome.storage.onChanged.removeListener(storageListener);
      chrome.runtime.onMessage.removeListener(runtimeListener);
    };
  }, [refreshState]);

  const handleSignIn = useCallback(async () => {
    setAuthLoading(true);
    try {
      const signInMode = await startSignIn();
      if (signInMode === "web") {
        setStatus(getSignInOpenedStatus());
        return;
      }
      const u = await waitForUser();
      if (!u) {
        throw new Error("ログインは完了しましたが、拡張機能セッションを取得できませんでした");
      }
      setUser(u);
      await syncProfile();
      const refreshed = await getSettings();
      setSettings(refreshed);
      setStatus(getSignInOpenedStatus());
    } catch (err) {
      const message = err instanceof Error ? err.message : "ログインに失敗しました";
      setStatus(`ログイン失敗: ${message}`);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    await signOut();
    setUser(null);
    setStatus("ログアウトしました");
  }, []);

  const handleFieldChange = useCallback(
    (name: ProfileKey, value: string) => {
      if (!settings) return;
      const next = { ...settings, profile: { ...settings.profile, [name]: value } };

      if (name === "lastNameKanji" || name === "firstNameKanji") {
        const kanaKey = name === "lastNameKanji" ? "lastNameKana" : "firstNameKana";
        const candidate = extractKatakanaCandidate(value);
        if (candidate) {
          next.profile[kanaKey] = candidate;
          composingRef.current.lastKana[name] = candidate;
        } else if (composingRef.current.lastKana[name] && !next.profile[kanaKey]) {
          next.profile[kanaKey] = composingRef.current.lastKana[name];
        }
      }

      setSettings(next);
    },
    [settings]
  );

  const handleSave = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!settings) return;
      if (!user) {
        setStatus(getSignInRequiredMessage());
        return;
      }
      const normalizedProfile = normalizeProfileLinks(settings.profile);
      const normalizedSettings: Settings = { ...settings, profile: normalizedProfile };
      setSettings(normalizedSettings);
      await saveSettings(normalizedSettings);

      try {
        await pushProfileToSupabase(normalizedProfile);
        setStatus("保存・同期しました");
      } catch {
        setStatus("保存しました（同期に失敗）");
      }
    },
    [settings, user]
  );

  const handleReset = useCallback(async () => {
    const next: Settings = { enabled: settings?.enabled ?? true, profile: { ...DEFAULT_PROFILE } };
    setSettings(next);
    await saveSettings(next);
    setStatus("リセットしました");
  }, [settings]);

  const handleExport = useCallback(() => {
    if (!settings) return;
    const payload = JSON.stringify(settings.profile, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cygnet-profile.json";
    a.click();
    URL.revokeObjectURL(url);
    setStatus("JSONを出力しました");
  }, [settings]);

  const handleOpenDashboard = useCallback(async () => {
    try {
      await openWebDashboard();
      setStatus("Webダッシュボードを開きました");
    } catch {
      setStatus("Webダッシュボードを開けませんでした");
    }
  }, []);

  if (!settings) return null;

  return (
    <main>
      <header>
        <div className="header-row">
          <div>
            <h1>Cygnet 設定</h1>
            <p>応募フォームに入力するプロフィールを登録してください。</p>
            <p className="status">
              保存済みログインのパスワードはこの画面では管理せず、拡張機能内のローカル暗号化された資格情報保管庫でのみ扱います。
            </p>
          </div>
          <div className="auth-section">
            {user ? (
              <div className="auth-user">
                {user.user_metadata?.avatar_url && <img className="avatar" src={user.user_metadata.avatar_url} alt="" />}
                <div className="auth-info">
                  <span className="auth-email">{user.email}</span>
                  <div className="auth-actions">
                    <button type="button" className="auth-btn secondary" onClick={handleSignOut}>
                      ログアウト
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button type="button" className="google-btn" onClick={handleSignIn} disabled={authLoading}>
                {authLoading ? getSignInBusyLabel() : getSignInLabel()}
              </button>
            )}
          </div>
        </div>
      </header>

      {user ? (
        <form onSubmit={handleSave}>
          <div className="tab-row" role="tablist" aria-label="プロフィールタブ">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "main"}
              className={`tab-btn ${activeTab === "main" ? "active" : ""}`}
              onClick={() => setActiveTab("main")}
            >
              メイン
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "additional"}
              className={`tab-btn ${activeTab === "additional" ? "active" : ""}`}
              onClick={() => setActiveTab("additional")}
            >
              追加情報
            </button>
          </div>

          {activeTab === "main" ? (
            <SectionList sections={MAIN_SECTIONS} profile={settings.profile} onChange={handleFieldChange} />
          ) : (
            <SectionList sections={ADDITIONAL_SECTIONS} profile={settings.profile} onChange={handleFieldChange} />
          )}

          <footer>
            <button type="submit">保存 & 同期</button>
            <button type="button" className="secondary" onClick={handleReset}>
              リセット
            </button>
            <button type="button" className="secondary" onClick={handleExport}>
              JSONエクスポート
            </button>
            <button type="button" className="secondary" onClick={handleOpenDashboard}>
              Webダッシュボード
            </button>
          </footer>
          {status && (
            <p className="status" role="status">
              {status}
            </p>
          )}
        </form>
      ) : (
        <section className="auth-required-card">
          <h2>ログインが必要です</h2>
          <p>この設定を使うにはGoogleログインが必要です。</p>
          <div className="auth-required-actions">
            <button type="button" className="secondary" onClick={handleOpenDashboard}>
              Webダッシュボードを開く
            </button>
          </div>
          {status && (
            <p className="status" role="status">
              {status}
            </p>
          )}
        </section>
      )}
    </main>
  );
}
