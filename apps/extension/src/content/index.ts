/// <reference types="chrome" />

/* ── Types ── */

interface Profile {
  [key: string]: string | undefined;
}

interface Settings {
  enabled: boolean;
  profile: Profile;
}

interface ParsedBirthDate {
  year: string;
  month: string;
  monthRaw: string;
  day: string;
  dayRaw: string;
}

interface ParsedYearMonth {
  year: string;
  month: string;
  monthRaw: string;
}

interface Candidate {
  el: HTMLElement;
  layoutEl: HTMLElement;
  meta: string;
  rawHint: string;
  field: string | null;
  contactSubtype: string | null;
  kanaTarget: string | null;
  namePart: string | null;
  scriptHint: string | null;
  combineCityForAddressLine1: boolean;
}

interface OverlayRefs {
  host: HTMLElement;
  shadow: ShadowRoot;
  root: HTMLElement;
  launcherWrap: HTMLElement;
  launcher: HTMLElement;
  hideLauncherBtn: HTMLElement;
  closeBtn: HTMLElement;
  authEmail: HTMLElement;
  signInBtn: HTMLButtonElement;
  logoutBtn: HTMLButtonElement;
  controlsWrap: HTMLElement;
  enabledToggle: HTMLInputElement;
  autofillBtn: HTMLElement;
  tabsWrap: HTMLElement;
  tabMainBtn: HTMLButtonElement;
  tabAdditionalBtn: HTMLButtonElement;
  tabCredentialsBtn: HTMLButtonElement;
  status: HTMLElement;
  sections: HTMLElement;
  statusTimer: number | null;
  resizeHandler: () => void;
}

interface OverlayDomainState {
  visible?: boolean;
  top?: number;
}

interface UniversityReadingOverride {
  keywords: string[];
  reading: string;
}

interface ProfileSectionItem {
  label: string;
  value: string | undefined;
}

interface ProfileSection {
  title: string;
  items: ProfileSectionItem[];
}

type OverlayProfileTab = "main" | "additional" | "credentials";

interface CredentialSummary {
  id: string;
  label: string;
  labelManual: boolean;
  siteKey: string;
  origin: string;
  host: string;
  path: string;
  queryKey: string;
  formAction: string;
  formSignature: string;
  username: string;
  createdAt: number;
  updatedAt: number;
}

interface CredentialVaultState {
  unlocked: boolean;
  hasVault: boolean;
  entryCount: number;
}

interface CredentialDraft {
  label: string;
  username: string;
  password: string;
  passphrase: string;
}

interface PositionedCandidate {
  candidate: Candidate;
  rect: DOMRect;
}

interface OptionLike {
  textContent: string | null;
  label?: string;
  value?: string;
}

/* ── Storage helper ── */

const storageArea: chrome.storage.StorageArea = chrome.storage.sync ?? chrome.storage.local;

/* ── Constants ── */

const STORAGE_KEY = "settings";

const NON_NAME_FIELD_PATTERNS: Record<string, RegExp[]> = {
  email: [/mail/, /e-?mail/, /メール/],
  phone: [/tel/, /phone/, /電話/],
  postalCode: [/postal/, /post.?code/, /zip/, /〒/, /郵便/, /郵便番号/],
  prefecture: [/prefecture/, /都道府県/],
  city: [/city/, /市区町村/],
  addressLine1: [/\baddress\b/, /\baddress.?line.?1\b/, /住所/, /丁目|番地/],
  addressLine2: [/\baddress.?2\b/, /\baddress.?line.?2\b/, /building/, /マンション/, /アパート/, /建物/, /号室/],
  birthDate: [/birth/, /birthday/, /生年月日/],
  preferredName: [/preferred.?name/, /preffered.?name/, /希望名/, /通称/, /ニックネーム/],
  gender: [/gender/, /sex/, /性別/],
  password: [/password/, /passcode/, /パスワード/, /暗証/],
  educationType: [/学校区分/, /学歴区分/, /学校.?種類/, /school.?type/, /education.?type/, /\bgkbn\b/],
  universityKanaInitial: [/学校名.?頭文字/, /頭文字/, /name.?initial/, /\bgon\b/],
  universityPrefecture: [/学校所在地/, /大学所在地/, /所在地.*都道府県/, /所在地.*検索対象/, /university.*prefecture/, /\bdken\b/],
  university: [/university/, /college/, /大学名/, /出身校/, /学校名/],
  faculty: [/faculty/, /学部/, /major/],
  department: [/department/, /学科/, /専攻/, /course/],
  humanitiesScienceType: [/文理区分/, /文系理系/, /arts.?science/, /humanities/, /science/],
  graduationYear: [/graduation/, /graduation.?month/, /卒業/, /卒業年月/, /year/, /year.?month/],
  company: [/company/, /current.?employer/, /勤務先/, /会社/],
  highSchool: [/出身.*(?:高等学校|高校)/, /卒業された.*(?:高等学校|高校)/, /(?:高等学校|高校).*(?:名|学校)/, /high.?school/],
  highSchoolGraduationDate: [/(?:高等学校|高校).*卒業/, /high.?school.*graduation/],
  linkedIn: [/linkedin/],
  github: [/github/],
  portfolio: [/portfolio/, /website/, /url/, /ブログ/],
  seminarLaboratory: [/ゼミ/, /研究室/, /seminar/, /laboratory/],
  researchTheme: [/研究テーマ/, /専攻テーマ/, /題名/, /thesis/, /research.?theme/],
  schoolClubActivity: [/クラブ/, /サークル/, /club/, /circle/, /部活/],
  vacationAddressSameAsCurrent: [/現住所.*同じ/, /same.*current/, /same.*address/, /休暇中住所.*同じ/],
  vacationPostalCode: [/休暇中.*郵便/, /vacation.*postal/, /temporary.*postal/],
  vacationPrefecture: [/休暇中.*都道府県/, /vacation.*prefecture/, /temporary.*prefecture/],
  vacationAddressLine1: [/休暇中.*(市区|地名|番地|住所)/, /vacation.*address/, /temporary.*address/],
  vacationAddressLine2: [/休暇中.*(マンション|アパート|建物|号室)/, /vacation.*address.?2/, /temporary.*address.?2/],
  vacationPhone: [/休暇中.*電話/, /vacation.*phone/, /temporary.*phone/]
};

const FIELD_NEGATIVE_PATTERNS: Record<string, RegExp[]> = {
  addressLine1: [/ゼミ/, /研究室/, /サークル/, /クラブ/, /趣味/, /資格/, /免許/, /志望/, /自己pr/],
  addressLine2: [/ゼミ/, /研究室/, /サークル/, /クラブ/, /趣味/, /資格/, /免許/, /志望/, /自己pr/],
  highSchool: [/卒業年月/, /卒業後/, /理由/, /gap/]
};

const KANA_FIELD_KEYS = new Set(["lastNameKana", "firstNameKana"]);
const KANA_SCRIPT_KEYS = new Set(["kana", "hiragana", "katakana"]);
const AUTO_RUN_OBSERVE_MS = 15000;
const AUTO_RUN_DEBOUNCE_MS = 600;
const AUTH_STATE_CACHE_TTL_MS = 3000;
const CREDENTIAL_CAPTURE_DEDUPE_MS = 5000;
const CREDENTIAL_REVEAL_TTL_MS = 12000;
const OVERLAY_HOST_ID = "cygnet-inpage-overlay";
const OVERLAY_DOMAIN_STATE_KEY = "overlayDomainState";
const WEB_BRIDGE_ORIGINS = new Set([
  "https://cygnet-two.vercel.app",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
]);
const WEB_BRIDGE_REQUEST_TYPE = "CYGNET_REQUEST_EXTENSION_ID";
const WEB_BRIDGE_RESPONSE_TYPE = "CYGNET_EXTENSION_ID";
const LAUNCHER_ICON_PATH = "icons/icon32.png";

const GENDER_VALUE_ALIASES: Record<string, string[]> = {
  male: ["male", "man", "m", "男性", "男", "男性（男）", "男性（man）"],
  female: ["female", "woman", "f", "女性", "女", "女性（女）", "女性（woman）"],
  non_binary: ["non binary", "non-binary", "x", "ノンバイナリー", "その他"],
  prefer_not_to_say: ["prefer not to say", "none", "無回答", "回答しない", "選択しない"],
  other: ["other", "others", "その他", "該当なし"]
};

const EDUCATION_TYPE_ALIASES: Record<string, string[]> = {
  national_university: ["national university", "国立大学"],
  public_university: ["public university", "公立大学"],
  private_university: ["private university", "私立大学"],
  national_graduate_school: ["national graduate school", "国立大学院"],
  public_graduate_school: ["public graduate school", "公立大学院"],
  private_graduate_school: ["private graduate school", "私立大学院"],
  national_junior_college: ["national junior college", "国立短大", "国立短期大学"],
  public_junior_college: ["public junior college", "公立短大", "公立短期大学"],
  private_junior_college: ["private junior college", "私立短大", "私立短期大学"],
  technical_college: ["technical college", "高等専門学校", "高専"],
  vocational_school: ["vocational school", "専門学校"],
  overseas_university: ["overseas university", "海外大学", "外国大学"],
  other: ["other", "その他"],
  // Backward compatibility for existing stored values.
  university: ["university", "大学", "私立大学"],
  graduate_master: ["graduate school master", "master", "修士", "大学院（修士）", "大学院(修士)", "私立大学院"],
  graduate_doctor: ["graduate school doctor", "doctor", "phd", "博士", "大学院（博士）", "大学院(博士)", "私立大学院"],
  junior_college: ["junior college", "短期大学", "短大", "私立短大"],
  vocational: ["vocational school", "専門学校"],
  high_school: ["high school", "高校", "高等学校"],
  foreign_university_jp: ["foreign university japan", "外国大学日本校", "海外大学"],
  foreign_university: ["foreign university", "外国大学", "海外大学"]
};

const EDUCATION_TYPE_LABELS: Record<string, string> = {
  national_university: "国立大学",
  public_university: "公立大学",
  private_university: "私立大学",
  national_graduate_school: "国立大学院",
  public_graduate_school: "公立大学院",
  private_graduate_school: "私立大学院",
  national_junior_college: "国立短大",
  public_junior_college: "公立短大",
  private_junior_college: "私立短大",
  technical_college: "高等専門学校",
  vocational_school: "専門学校",
  overseas_university: "海外大学",
  other: "その他",
  // Backward compatibility labels.
  university: "大学",
  graduate_master: "大学院(修士)",
  graduate_doctor: "大学院(博士)",
  junior_college: "短期大学",
  vocational: "専門学校",
  high_school: "高等学校",
  foreign_university_jp: "外国大学日本校",
  foreign_university: "外国大学"
};

const HUMANITIES_SCIENCE_TYPE_ALIASES: Record<string, string[]> = {
  arts: ["arts", "humanities", "文系"],
  science: ["science", "理系"],
  other: ["other", "その他"]
};

const HUMANITIES_SCIENCE_TYPE_LABELS: Record<string, string> = {
  arts: "文系",
  science: "理系",
  other: "その他"
};

const YES_NO_LABELS: Record<string, string> = {
  yes: "はい / Yes",
  no: "いいえ / No"
};

const DEGREE_LABELS: Record<string, string> = {
  bachelor: "学士 / Bachelor",
  master: "修士 / Master",
  doctor: "博士 / Doctor",
  other: "その他 / Other"
};

const ENGLISH_ABILITY_LABELS: Record<string, string> = {
  none: "未経験",
  basic: "基礎",
  daily: "日常会話",
  business: "ビジネス",
  native: "ネイティブ"
};

const WORK_EMPLOYMENT_LABELS: Record<string, string> = {
  full_time: "正社員",
  contract: "契約社員",
  dispatch: "派遣社員",
  part_time: "アルバイト",
  other: "その他"
};

const WORK_STATUS_LABELS: Record<string, string> = {
  currently_employed: "在職中 / Currently employed",
  planning_to_resign: "退職予定 / Planning to resign",
  resigned: "退職済み / Resigned"
};

const OVERSEAS_REASON_LABELS: Record<string, string> = {
  study_abroad: "留学",
  work: "就業",
  internship: "インターン",
  volunteer: "ボランティア",
  family: "家族都合",
  other: "その他"
};

const REASON_FOR_ENTRY_LABELS: Record<string, string> = {
  mynavi: "マイナビ / Mynavi",
  rikunavi: "リクナビ / Rikunavi",
  career_forum_net: "Career Forum Net",
  one_career: "ONE CAREER",
  career_tasu_shukatsu: "キャリタス就活 / Career-tasu Shukatsu",
  career_tasu_uc: "キャリタスUC / Career-tasu UC",
  type_shukatsu: "Type就活 / Type Shukatsu",
  redesigner: "ReDesigner",
  leading_mark: "リーディングマーク / Leading Mark",
  gaishi_shukatsu: "外資就活 / Gaishi Shukatsu",
  open_work: "Open Work",
  offer_box: "Offer Box",
  bizreach: "BizReach",
  shirucafe: "知るカフェ / Meetup",
  career_office: "大学の求人票 / Job Posting on College Career Office Website",
  joint_job_fair: "イベント（合同説明会） / Event (Joint job fairs)",
  boston_career_forum: "Boston Career Forum",
  on_campus_event: "学内説明会 / On-Campus Event",
  interview_staff: "採用担当との面談 / Interview with Recruitment staff",
  obog_visit: "OBOG訪問 / Alumni's visit",
  instagram: "Instagram",
  x: "X (旧Twitter)",
  youtube: "YouTube",
  company_video: "会社説明動画 / Company Video",
  referral: "紹介 / Referral",
  other: "その他 / Others"
};

const SCHOOL_ATTENDANCE_REASON_LABELS: Record<string, string> = {
  study_abroad: "留学のため / To study abroad",
  job_search: "就職浪人のため / To search for jobs",
  repeat_year: "学業による留年のため / To repeat a year",
  grad_exam: "大学院受験のため（浪人） / Graduate school entrance exam",
  other: "その他 / Other"
};

const HIGH_SCHOOL_GAP_REASON_LABELS: Record<string, string> = {
  prep_university_exam: "大学受験のため（浪人）",
  study_abroad_after_grad: "卒業後の留学のため",
  overseas_university: "高校と異なる国の大学に入学したため",
  other: "その他"
};

const LICENSE_CERTIFICATION_LABELS: Record<string, string> = {
  boki_1: "日商簿記1級",
  boki_2: "日商簿記2級",
  boki_3: "日商簿記3級",
  fp_1: "FP技能検定1級",
  fp_2: "FP技能検定2級",
  fp_3: "FP技能検定3級",
  it_passport: "ITパスポート",
  actuary_associate: "アクチュアリー準会員",
  actuary_fellow: "アクチュアリー正会員",
  labor_social_security: "社会保険労務士",
  fundamental_it: "基本情報技術者試験",
  statistics_grade1: "統計検定1級",
  statistics_pre1: "統計検定準1級",
  statistics_grade2: "統計検定2級",
  real_estate_notary: "宅地建物取引士",
  lawyer: "弁護士資格",
  cpa: "公認会計士"
};

interface AdditionalSectionField {
  key: string;
  label: string;
  labels?: Record<string, string>;
  multi?: boolean;
}

interface AdditionalSectionDefinition {
  title: string;
  fields: AdditionalSectionField[];
}

const ADDITIONAL_PROFILE_SECTIONS: AdditionalSectionDefinition[] = [
  {
    title: "最終学歴情報 / Latest academic information",
    fields: [
      { key: "degree", label: "学位 / Degree", labels: DEGREE_LABELS },
      { key: "schoolAttendanceReasons", label: "在学期間の理由", labels: SCHOOL_ATTENDANCE_REASON_LABELS, multi: true },
      { key: "schoolAttendanceOtherReason", label: "在学期間(その他)" },
      { key: "seminarLaboratory", label: "所属ゼミ・研究室名" },
      { key: "researchTheme", label: "専攻テーマ・研究テーマ(題名)" },
      { key: "schoolClubActivity", label: "所属クラブ・サークル名" }
    ]
  },
  {
    title: "経験と志望 / Experiences and reasons",
    fields: [
      { key: "schoolLifeExperience1", label: "学生時代の経験 1" },
      { key: "schoolLifeExperience2", label: "学生時代の経験 2" }
    ]
  },
  {
    title: "その他学歴 / Other education",
    fields: [
      { key: "otherEducationSchool1", label: "大学1 / School1" },
      { key: "otherEducationDepartment1", label: "学部学科1 / Department and major1" },
      { key: "otherEducationAdmission1", label: "入学・留学開始年月1" },
      { key: "otherEducationGraduation1", label: "卒業・留学修了年月1" },
      { key: "otherEducationSchool2", label: "大学2 / School2" },
      { key: "otherEducationDepartment2", label: "学部学科2 / Department and major2" },
      { key: "otherEducationAdmission2", label: "入学・留学開始年月2" },
      { key: "otherEducationGraduation2", label: "卒業・留学修了年月2" }
    ]
  },
  {
    title: "海外経験 / Overseas experience",
    fields: [
      { key: "overseasExperience", label: "海外経験の有無", labels: YES_NO_LABELS },
      { key: "overseasCountry1", label: "国名1 / Country1" },
      { key: "overseasReason1", label: "滞在理由1", labels: OVERSEAS_REASON_LABELS },
      { key: "overseasPeriod1Start", label: "滞在期間1 開始" },
      { key: "overseasPeriod1End", label: "滞在期間1 終了" },
      { key: "overseasCountry2", label: "国名2 / Country2" },
      { key: "overseasReason2", label: "滞在理由2", labels: OVERSEAS_REASON_LABELS },
      { key: "overseasPeriod2Start", label: "滞在期間2 開始" },
      { key: "overseasPeriod2End", label: "滞在期間2 終了" },
      { key: "overseasCountry3", label: "国名3 / Country3" },
      { key: "overseasReason3", label: "滞在理由3", labels: OVERSEAS_REASON_LABELS },
      { key: "overseasPeriod3Start", label: "滞在期間3 開始" },
      { key: "overseasPeriod3End", label: "滞在期間3 終了" },
      { key: "overseasOtherExperience", label: "その他海外経験" }
    ]
  },
  {
    title: "語学能力・その他 / Language and others",
    fields: [
      { key: "hospitalizedTwoWeeks", label: "2週間以上の入院歴", labels: YES_NO_LABELS },
      { key: "workConsiderations", label: "勤務上配慮事項" },
      { key: "englishAbility", label: "英語レベル", labels: ENGLISH_ABILITY_LABELS },
      { key: "toeicScore", label: "TOEICスコア" },
      { key: "toeicScoreCertificate", label: "TOEICスコアシート" },
      { key: "toeflIbtScore", label: "TOEFL iBTスコア" },
      { key: "toeflCbtScore", label: "TOEFL CBTスコア" },
      { key: "toeflItpScore", label: "TOEFL iTPスコア" },
      { key: "ieltsScore", label: "IELTSスコア" },
      { key: "languageOtherScores", label: "その他語学スコア・資格" }
    ]
  },
  {
    title: "資格・賞罰 / License and recognition",
    fields: [
      { key: "licensesCertifications", label: "免許・資格", labels: LICENSE_CERTIFICATION_LABELS, multi: true },
      { key: "driverLicense", label: "自動車免許", labels: YES_NO_LABELS },
      { key: "otherLicensesCertifications", label: "その他免許・資格" },
      { key: "awardsRecognition", label: "賞有無", labels: YES_NO_LABELS },
      { key: "awardsRecognitionDetails", label: "賞の詳細" },
      { key: "criminalRecord", label: "罰有無", labels: YES_NO_LABELS }
    ]
  },
  {
    title: "職務経歴 / Work history",
    fields: [
      { key: "workHistoryCompany1", label: "勤務先名（1社目）" },
      { key: "workHistoryPeriod1Start", label: "勤務期間1 開始" },
      { key: "workHistoryPeriod1End", label: "勤務期間1 終了" },
      { key: "workHistoryEmploymentStatus1", label: "雇用形態（1社目）", labels: WORK_EMPLOYMENT_LABELS },
      { key: "workHistoryResponsibilities1", label: "業務内容（1社目）" },
      { key: "workHistoryJobStatus1", label: "在職状況（1社目）", labels: WORK_STATUS_LABELS },
      { key: "workHistoryCompany2", label: "勤務先名（2社目）" },
      { key: "workHistoryPeriod2Start", label: "勤務期間2 開始" },
      { key: "workHistoryPeriod2End", label: "勤務期間2 終了" },
      { key: "workHistoryEmploymentStatus2", label: "雇用形態（2社目）", labels: WORK_EMPLOYMENT_LABELS },
      { key: "workHistoryResponsibilities2", label: "業務内容（2社目）" },
      { key: "workHistoryJobStatus2", label: "在職状況（2社目）", labels: WORK_STATUS_LABELS },
      { key: "workHistoryOther", label: "その他職務経歴" }
    ]
  },
  {
    title: "高校情報 / High school",
    fields: [
      { key: "highSchool", label: "高校 / High school" },
      { key: "highSchoolGraduationDate", label: "高校卒業年月" },
      { key: "highSchoolGapReasons", label: "高校卒業後の理由", labels: HIGH_SCHOOL_GAP_REASON_LABELS, multi: true },
      { key: "highSchoolGapOther", label: "高校卒業後の理由（その他）" }
    ]
  },
  {
    title: "最終学歴について / About latest academic background",
    fields: [
      { key: "latestAcademicAdmissionDate", label: "入学年月 / Admission date" },
      { key: "latestAcademicOverseasSchool", label: "最終学歴は海外学校か", labels: YES_NO_LABELS },
      { key: "latestAcademicUniversityLocation", label: "所在国 / University location" },
      { key: "latestAcademicUniversityLocationOther", label: "所在国（その他）" },
      { key: "latestAcademicUniversityName", label: "大学 / University" },
      { key: "latestAcademicUniversityNameOther", label: "大学（その他）" },
      { key: "latestAcademicDepartmentName", label: "学部 / Department" },
      { key: "latestAcademicDepartmentNameOther", label: "学部（その他）" }
    ]
  },
  {
    title: "国籍 / Nationality",
    fields: [
      { key: "nationalityPrimary", label: "第1国籍" },
      { key: "nationalitySecondary", label: "第2国籍" }
    ]
  },
  {
    title: "エントリー情報 / Entry",
    fields: [{ key: "reasonForEntry", label: "エントリーのきっかけ", labels: REASON_FOR_ENTRY_LABELS }]
  },
  {
    title: "休暇中の連絡先 / Vacation contact",
    fields: [
      { key: "vacationAddressSameAsCurrent", label: "休暇中住所が現住所と同じ", labels: YES_NO_LABELS },
      { key: "vacationPostalCode", label: "休暇中 郵便番号" },
      { key: "vacationPrefecture", label: "休暇中 都道府県" },
      { key: "vacationAddressLine1", label: "休暇中 市区郡・地名・番地" },
      { key: "vacationAddressLine2", label: "休暇中 アパート・マンション名・番号" },
      { key: "vacationPhone", label: "休暇中 電話番号" }
    ]
  }
];

const URL_FIELD_KEYS = new Set(["linkedIn", "github", "portfolio"]);

const UNIVERSITY_READING_OVERRIDES: UniversityReadingOverride[] = [
  { keywords: ["国際基督教大学", "icu", "internationalchristianuniversity"], reading: "こくさいきりすときょうだいがく" },
  { keywords: ["東京大学", "とうだい", "todai", "theuniversityoftokyo"], reading: "とうきょうだいがく" },
  { keywords: ["京都大学", "きょうだい", "kyotouniversity"], reading: "きょうとだいがく" },
  { keywords: ["早稲田大学", "waseda"], reading: "わせだだいがく" },
  { keywords: ["慶應義塾大学", "慶応義塾大学", "keio"], reading: "けいおうぎじゅくだいがく" },
  { keywords: ["上智大学", "sophia"], reading: "じょうちだいがく" },
  { keywords: ["一橋大学", "hitotsubashi"], reading: "ひとつばしだいがく" },
  { keywords: ["東北大学", "tohoku"], reading: "とうほくだいがく" },
  { keywords: ["北海道大学", "hokkaido", "hokudai"], reading: "ほっかいどうだいがく" },
  { keywords: ["大阪大学", "osaka", "handai"], reading: "おおさかだいがく" },
  { keywords: ["名古屋大学", "nagoya"], reading: "なごやだいがく" },
  { keywords: ["九州大学", "kyushu"], reading: "きゅうしゅうだいがく" },
  { keywords: ["神戸大学", "kobe"], reading: "こうべだいがく" },
  { keywords: ["筑波大学", "tsukuba"], reading: "つくばだいがく" },
  { keywords: ["東京科学大学", "東京工業大学", "tokyotech"], reading: "とうきょうかがくだいがく" },
  { keywords: ["工学院大学", "kogakuin"], reading: "こうがくいんだいがく" },
  { keywords: ["国学院大学", "kokugakuin"], reading: "こくがくいんだいがく" },
  { keywords: ["国士舘大学", "kokushikan"], reading: "こくしかんだいがく" },
  { keywords: ["駒澤大学", "駒沢大学", "komazawa"], reading: "こまざわだいがく" },
  { keywords: ["駒澤女子大学", "駒沢女子大学", "komazawajoshi"], reading: "こまざわじょしだいがく" },
  { keywords: ["国際医療福祉大学", "iuhw"], reading: "こくさいいりょうふくしだいがく" },
  { keywords: ["国際仏教学大学院大学"], reading: "こくさいぶっきょうがくだいがくいんだいがく" },
  { keywords: ["こども教育宝仙大学"], reading: "こどもきょういくほうせんだいがく" },
  { keywords: ["航空保安大学校"], reading: "こうくうほあんだいがっこう" },
  { keywords: ["国際ファッション専門職大学"], reading: "こくさいふぁっしょんせんもんしょくだいがく" },
  { keywords: ["国立看護大学校"], reading: "こくりつかんごだいがっこう" }
];

const GOJUON_INITIAL_MAP: Record<string, string> = {
  ぁ: "あ",
  ぃ: "い",
  ぅ: "う",
  ぇ: "え",
  ぉ: "お",
  ゃ: "や",
  ゅ: "ゆ",
  ょ: "よ",
  ゎ: "わ",
  ゕ: "か",
  ゖ: "け",
  ゐ: "い",
  ゑ: "え",
  ゔ: "う",
  が: "か",
  ぎ: "き",
  ぐ: "く",
  げ: "け",
  ご: "こ",
  ざ: "さ",
  じ: "し",
  ず: "す",
  ぜ: "せ",
  ぞ: "そ",
  だ: "た",
  ぢ: "ち",
  づ: "つ",
  で: "て",
  ど: "と",
  ば: "は",
  び: "ひ",
  ぶ: "ふ",
  べ: "へ",
  ぼ: "ほ",
  ぱ: "は",
  ぴ: "ひ",
  ぷ: "ふ",
  ぺ: "へ",
  ぽ: "ほ",
  っ: "",
  ー: ""
};

/* ── Module-level state ── */

let overlayRefs: OverlayRefs | null = null;
let storageListenerBound = false;
let launcherTopPx = 180;
const copiedTimerIds = new WeakMap<HTMLElement, number>();
let authStateCache: { authenticated: boolean; email: string; fetchedAt: number } | null = null;
let overlayActiveTab: OverlayProfileTab = "main";
let credentialVaultState: CredentialVaultState = { unlocked: false, hasVault: false, entryCount: 0 };
let credentialSummariesCache: CredentialSummary[] = [];
let credentialEditingId: string | "add" | null = null;
let credentialPromptId: string | "add" | null = null;
const credentialDrafts = new Map<string, CredentialDraft>();
const revealedCredentialPasswords = new Map<string, string>();
const revealedCredentialTimers = new Map<string, number>();
let credentialsCaptureBound = false;
let lastCapturedCredentialHash = "";
let lastCapturedCredentialAt = 0;

/* ── Utility functions ── */

function normalize(text: string | null | undefined): string {
  return (text || "")
    .toString()
    .toLowerCase()
    .replace(/[\s\-_:/\\|()\[\]{}]+/g, " ")
    .trim();
}

function toHalfWidth(text: string | null | undefined): string {
  return String(text || "")
    .normalize("NFKC")
    .replace(/[\uFF01-\uFF5E]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
    .replace(/\u3000/g, " ");
}

function extractDigits(text: string | null | undefined): string {
  return toHalfWidth(text).replace(/\D/g, "");
}

function splitEmailAddress(email: string): [string, string] {
  const normalized = toHalfWidth(email).trim();
  const atIndex = normalized.indexOf("@");
  if (atIndex < 0) return [normalized, ""];
  return [normalized.slice(0, atIndex), normalized.slice(atIndex + 1)];
}

function normalizeUniversityKey(text: string | null | undefined): string {
  return toHalfWidth(String(text || ""))
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "");
}

function getMatchedUniversityOverrides(universityText: string): UniversityReadingOverride[] {
  const key = normalizeUniversityKey(universityText);
  if (!key) return [];
  return UNIVERSITY_READING_OVERRIDES.filter((override) =>
    override.keywords.some((keyword) => {
      const keywordKey = normalizeUniversityKey(keyword);
      return keywordKey && (key.includes(keywordKey) || keywordKey.includes(key));
    })
  );
}

async function sendRuntimeMessage(message: unknown): Promise<unknown> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      const err = chrome.runtime.lastError;
      if (err) {
        reject(new Error(String(err.message || err)));
        return;
      }
      resolve(response);
    });
  });
}

async function getAuthState(force = false): Promise<{ authenticated: boolean; email: string }> {
  const now = Date.now();
  if (!force && authStateCache && now - authStateCache.fetchedAt < AUTH_STATE_CACHE_TTL_MS) {
    return { authenticated: authStateCache.authenticated, email: authStateCache.email };
  }

  try {
    const response = (await sendRuntimeMessage({ type: "GET_AUTH_STATE" })) as
      | { authenticated?: boolean; email?: string | null }
      | undefined;
    const authenticated = Boolean(response?.authenticated);
    const email = String(response?.email || "").trim();
    authStateCache = { authenticated, email, fetchedAt: now };
    return { authenticated, email };
  } catch {
    authStateCache = { authenticated: false, email: "", fetchedAt: now };
    return { authenticated: false, email: "" };
  }
}

async function isUserAuthenticated(): Promise<boolean> {
  const state = await getAuthState();
  return state.authenticated;
}

function cleanProfileValue(value: string | null | undefined): string {
  return String(value || "").trim();
}

function normalizeCredentialText(value: string | null | undefined): string {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ");
}

function sanitizeCredentialInput(value: string | null | undefined): string {
  return normalizeCredentialText(value).slice(0, 1000);
}

function maskSecret(value: string | null | undefined): string {
  const text = String(value || "");
  if (!text) return "";
  return "•".repeat(Math.min(16, Math.max(6, text.length)));
}

function buildAuthFormSignature(form: HTMLFormElement): string {
  const tokens = Array.from(form.querySelectorAll("input, select, textarea"))
    .map((el) => {
      if (!(el instanceof HTMLElement)) return "";
      const name = String((el as HTMLInputElement).name || "").trim();
      const id = String(el.id || "").trim();
      const type = String((el as HTMLInputElement).type || "").trim();
      const auto = String(el.getAttribute("autocomplete") || "").trim();
      return [name, id, type, auto].filter(Boolean).join(":");
    })
    .filter(Boolean)
    .slice(0, 18);
  return tokens.join("|").slice(0, 420);
}

function inferCompanyLabelFromPage(): string {
  const candidates: string[] = [];
  const title = String(document.title || "").trim();
  if (title) candidates.push(title);

  const ogTitle = document.querySelector("meta[property='og:site_name'], meta[property='og:title']");
  if (ogTitle instanceof HTMLMetaElement && ogTitle.content.trim()) candidates.push(ogTitle.content.trim());

  const h1 = document.querySelector("h1");
  if (h1?.textContent?.trim()) candidates.push(h1.textContent.trim());

  for (const value of candidates) {
    const head = value.split(/[\-|｜|\/|:]/)[0]?.trim();
    if (!head) continue;
    if (/log.?in|sign.?in|mypage|マイページ|ログイン|会員|entry/i.test(head)) continue;
    return head.slice(0, 120);
  }
  return location.hostname;
}

function getVisibleAuthForms(): HTMLFormElement[] {
  return Array.from(document.forms).filter((form) => {
    const passwordFields = Array.from(form.querySelectorAll("input[type='password']")).filter(
      (el): el is HTMLInputElement => el instanceof HTMLInputElement && isVisible(el)
    );
    if (!passwordFields.length) return false;
    const usernameField = findLikelyUsernameField(form);
    if (!usernameField) return false;
    const hint = normalize(
      [
        form.id,
        form.className,
        form.getAttribute("name"),
        form.getAttribute("action"),
        form.getAttribute("aria-label"),
        form.textContent
      ]
        .map((x) => toHalfWidth(String(x || "")))
        .join(" ")
    );
    if (/log.?in|sign.?in|mypage|会員|ログイン|パスワード|password|id|mail|email|account|認証/.test(hint)) {
      return true;
    }
    return true;
  });
}

function findLikelyUsernameField(form: HTMLFormElement): HTMLInputElement | null {
  const inputs = Array.from(form.querySelectorAll("input"))
    .filter((el): el is HTMLInputElement => el instanceof HTMLInputElement)
    .filter((el) => {
      const type = String(el.type || "").toLowerCase();
      if (["hidden", "submit", "button", "checkbox", "radio", "file"].includes(type)) return false;
      if (type === "password") return false;
      if (!isVisible(el)) return false;
      return true;
    });

  if (!inputs.length) return null;

  let best: { score: number; el: HTMLInputElement } | null = null;
  for (const el of inputs) {
    const type = String(el.type || "").toLowerCase();
    const metadata = normalize(
      [
        el.name,
        el.id,
        el.placeholder,
        el.getAttribute("autocomplete"),
        el.getAttribute("aria-label"),
        el.getAttribute("title")
      ]
        .map((x) => toHalfWidth(String(x || "")))
        .join(" ")
    );

    let score = 0;
    if (type === "email") score += 14;
    if (type === "text" || type === "tel" || type === "number") score += 6;
    if (/\bemail\b|mail|ログイン|会員|ユーザー|username|user.?id|login.?id|account/.test(metadata)) score += 12;
    if (/\bnew-password\b|\bone-time-code\b/.test(metadata)) score -= 12;
    if (/\bsearch\b|q=|keyword/.test(metadata)) score -= 8;
    if (metadata.includes("captcha")) score -= 12;

    if (!best || score > best.score) {
      best = { score, el };
    }
  }

  if (!best || best.score < 4) return null;
  return best.el;
}

function buildCredentialMatchContext(): { pageUrl: string; formAction?: string; formSignature?: string } {
  const forms = getVisibleAuthForms();
  const topForm = forms[0];
  return {
    pageUrl: location.href,
    formAction: topForm?.getAttribute("action") || "",
    formSignature: topForm ? buildAuthFormSignature(topForm) : ""
  };
}

async function getCredentialVaultStateFromRuntime(): Promise<CredentialVaultState> {
  const response = (await sendRuntimeMessage({ type: "CREDENTIAL_VAULT_STATE" })) as
    | { ok?: boolean; state?: CredentialVaultState }
    | undefined;
  if (!response?.ok || !response.state) return { unlocked: false, hasVault: false, entryCount: 0 };
  return response.state;
}

async function listCredentialSummariesFromRuntime(): Promise<CredentialSummary[]> {
  const response = (await sendRuntimeMessage({ type: "CREDENTIAL_LIST_SUMMARIES" })) as
    | { ok?: boolean; entries?: CredentialSummary[]; error?: string }
    | undefined;
  if (!response?.ok) {
    throw new Error(String(response?.error || "failed_to_list_credentials"));
  }
  return Array.isArray(response.entries) ? response.entries : [];
}

async function revealCredentialPasswordFromRuntime(id: string, passphrase: string): Promise<string> {
  const response = (await sendRuntimeMessage({
    type: "CREDENTIAL_REVEAL_PASSWORD",
    id,
    passphrase
  })) as { ok?: boolean; password?: string; error?: string } | undefined;
  if (!response?.ok || typeof response.password !== "string") {
    throw new Error(String(response?.error || "reveal_failed"));
  }
  return response.password;
}

async function upsertCredentialEntryFromRuntime(payload: {
  id?: string;
  label: string;
  username: string;
  password?: string;
  passphrase?: string;
  pageUrl: string;
  formAction?: string;
  formSignature?: string;
}): Promise<CredentialSummary> {
  const response = (await sendRuntimeMessage({
    type: "CREDENTIAL_UPSERT",
    entry: payload
  })) as { ok?: boolean; entry?: CredentialSummary; error?: string } | undefined;
  if (!response?.ok || !response.entry) {
    throw new Error(String(response?.error || "save_failed"));
  }
  return response.entry;
}

async function deleteCredentialEntryFromRuntime(id: string): Promise<void> {
  const response = (await sendRuntimeMessage({
    type: "CREDENTIAL_DELETE",
    id
  })) as { ok?: boolean; error?: string } | undefined;
  if (!response?.ok) {
    throw new Error(String(response?.error || "delete_failed"));
  }
}

async function getBestCredentialForCurrentPage(): Promise<CredentialSummary | null> {
  const response = (await sendRuntimeMessage({
    type: "CREDENTIAL_MATCH",
    context: buildCredentialMatchContext()
  })) as { ok?: boolean; entry?: CredentialSummary | null } | undefined;
  if (!response?.ok) return null;
  return response.entry || null;
}

async function captureCredentialFromSubmitForm(form: HTMLFormElement): Promise<void> {
  const passwordField = Array.from(form.querySelectorAll("input[type='password']")).find(
    (el): el is HTMLInputElement => el instanceof HTMLInputElement && isVisible(el)
  );
  if (!passwordField) return;

  const usernameField = findLikelyUsernameField(form);
  const username = sanitizeCredentialInput(usernameField?.value);
  const password = sanitizeCredentialInput(passwordField.value);
  if (!username || !password) return;

  const dedupeKey = `${location.href}|${buildAuthFormSignature(form)}|${username}|${password}`;
  const now = Date.now();
  if (dedupeKey === lastCapturedCredentialHash && now - lastCapturedCredentialAt < CREDENTIAL_CAPTURE_DEDUPE_MS) {
    return;
  }
  lastCapturedCredentialHash = dedupeKey;
  lastCapturedCredentialAt = now;

  const response = (await sendRuntimeMessage({
    type: "CREDENTIAL_CAPTURE",
    payload: {
      pageUrl: location.href,
      pageTitle: document.title,
      formAction: form.getAttribute("action") || "",
      formSignature: buildAuthFormSignature(form),
      labelHint: inferCompanyLabelFromPage(),
      username,
      password
    }
  })) as { ok?: boolean; captured?: boolean } | undefined;

  if (!response?.ok || !response.captured) return;
  credentialVaultState = await getCredentialVaultStateFromRuntime();
  if (overlayRefs && overlayActiveTab === "credentials") {
    credentialSummariesCache = await listCredentialSummariesFromRuntime().catch(
      () => credentialSummariesCache
    );
    renderCredentialSections();
    setOverlayStatus("ログイン情報を保存しました");
  }
}

function bindCredentialCaptureListener(): void {
  if (credentialsCaptureBound) return;
  document.addEventListener(
    "submit",
    (event) => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement)) return;
      if (!getVisibleAuthForms().includes(form)) return;
      captureCredentialFromSubmitForm(form).catch(() => {});
    },
    true
  );
  credentialsCaptureBound = true;
}

function detectContactSubtype(field: string, text: string | null | undefined): string {
  const source = normalize(toHalfWidth(text || ""));
  if (field === "email") {
    if (/(携帯|mobile|keitai|スマホ)/.test(source)) return "email_mobile";
    if (/(pc|パソコン|e mail|email|メール|mail)/.test(source)) return "email_pc";
    return "email_unknown";
  }

  if (field === "phone") {
    if (/(携帯|mobile|cell|スマホ)/.test(source)) return "phone_mobile";
    if (/(固定|自宅|landline|home|電話番号|tel|phone)/.test(source)) return "phone_landline";
    return "phone_unknown";
  }

  return "";
}

function resolveEmailValueForSubtype(subtype: string, profile: Profile): string {
  const primary = cleanProfileValue(profile.email);
  const mobile = cleanProfileValue(profile.mobileEmail);
  if (subtype === "email_mobile") return mobile;
  if (subtype === "email_pc") return primary || mobile;
  return primary || mobile;
}

function resolvePhoneValueForSubtype(subtype: string, profile: Profile): string {
  const primary = cleanProfileValue(profile.phone);
  const mobile = cleanProfileValue(profile.mobilePhone);

  if (subtype === "phone_mobile") return mobile;
  if (subtype === "phone_landline") return primary || mobile;
  return primary || mobile;
}

function isVisible(el: Element): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const style = getComputedStyle(el);
  if (style.visibility === "hidden" || style.display === "none") return false;
  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

function isJqTransformHiddenSelect(el: Element): boolean {
  if (!(el instanceof HTMLSelectElement)) return false;
  const cls = String(el.className || "");
  if (/jqTransformHidden/i.test(cls)) return true;
  const style = getComputedStyle(el);
  return style.display === "none" && !!el.parentElement?.querySelector(".jqTransformSelectWrapper");
}

function isJqTransformHiddenChoice(el: Element): boolean {
  if (!(el instanceof HTMLInputElement)) return false;
  if (!["radio", "checkbox"].includes(String(el.type || "").toLowerCase())) return false;
  const cls = String(el.className || "");
  if (!/jqTransformHidden/i.test(cls)) return false;
  const parent = el.parentElement;
  if (!parent) return false;
  return parent.classList.contains("jqTransformRadioWrapper") || parent.classList.contains("jqTransformCheckboxWrapper");
}

function getJqTransformWrapper(el: Element): HTMLElement | null {
  if (!(el instanceof HTMLSelectElement)) return null;
  const direct = el.closest(".jqTransformSelectWrapper");
  if (direct instanceof HTMLElement) return direct;

  const parent = el.parentElement;
  if (!parent) return null;

  if (parent.classList?.contains("jqTransformSelectWrapper")) return parent;

  const wrappers = Array.from(parent.querySelectorAll(".jqTransformSelectWrapper")).filter(
    (node): node is HTMLElement => node instanceof HTMLElement
  );
  if (!wrappers.length) return null;
  const prev = el.previousElementSibling;
  if (prev instanceof HTMLElement && prev.classList.contains("jqTransformSelectWrapper")) return prev;
  return wrappers[0] || null;
}

function getLayoutElement(el: HTMLElement): HTMLElement {
  if (el instanceof HTMLSelectElement && isJqTransformHiddenSelect(el)) {
    const wrapper = getJqTransformWrapper(el);
    if (wrapper) return wrapper;
  }
  return el;
}

function collectStructuredTextHints(el: HTMLElement): string[] {
  const hints: string[] = [];
  const pushIfText = (value: string | null | undefined): void => {
    const text = String(value || "").trim();
    if (text) hints.push(text);
  };

  const cell = el.closest("td, th");
  if (cell?.previousElementSibling) pushIfText(cell.previousElementSibling.textContent);

  const tr = el.closest("tr");
  if (tr) {
    const firstCell = Array.from(tr.children).find(
      (node) => node instanceof HTMLElement && /^(TH|TD)$/.test(node.tagName)
    );
    if (firstCell) pushIfText(firstCell.textContent);
  }

  const dd = el.closest("dd");
  if (dd) {
    const dt = dd.previousElementSibling;
    if (dt?.tagName === "DT") pushIfText(dt.textContent);
  }

  const localContainerSelectors = [
    "[class*='form-row']",
    "[class*='form-group']",
    "[class*='field']",
    "[class*='item']",
    "fieldset",
    "li"
  ];
  for (const selector of localContainerSelectors) {
    const container = el.closest(selector);
    if (!container) continue;
    const labelLike = container.querySelector(
      ":scope > label, :scope > legend, :scope > th, :scope > dt, :scope > .label, :scope > .title"
    );
    if (labelLike) pushIfText(labelLike.textContent);
    break;
  }

  if (el.parentElement?.previousElementSibling) pushIfText(el.parentElement.previousElementSibling.textContent);

  return hints;
}

function getTextMeta(el: HTMLElement): string {
  const inputEl = el as HTMLInputElement;
  const parts: (string | null | undefined)[] = [
    el.id,
    inputEl.name,
    inputEl.placeholder,
    inputEl.autocomplete,
    el.getAttribute("aria-label"),
    el.getAttribute("data-testid"),
    el.getAttribute("data-qa"),
    el.className
  ];

  if (inputEl.labels?.length) {
    for (const lbl of Array.from(inputEl.labels)) parts.push(lbl.textContent);
  }

  const labelledBy = el.getAttribute("aria-labelledby");
  if (labelledBy) {
    labelledBy.split(/\s+/).forEach((id) => {
      const node = document.getElementById(id);
      if (node?.textContent) parts.push(node.textContent);
    });
  }

  parts.push(...collectStructuredTextHints(el));

  return normalize(parts.filter(Boolean).join(" "));
}

function getRawHintText(el: HTMLElement): string {
  const inputEl = el as HTMLInputElement;
  const parts: (string | null | undefined)[] = [
    el.id,
    inputEl.name,
    inputEl.placeholder,
    el.getAttribute("aria-label"),
    el.getAttribute("title"),
    el.getAttribute("pattern")
  ];

  if (inputEl.labels?.length) {
    for (const lbl of Array.from(inputEl.labels)) parts.push(lbl.textContent);
  }

  const labelledBy = el.getAttribute("aria-labelledby");
  if (labelledBy) {
    labelledBy.split(/\s+/).forEach((id) => {
      const node = document.getElementById(id);
      if (node?.textContent) parts.push(node.textContent);
    });
  }

  parts.push(...collectStructuredTextHints(el));

  return parts.filter(Boolean).join(" ");
}

function detectNamePart(meta: string): "last" | "first" | null {
  if (!meta) return null;

  if (
    /(建物名|会社名|学校名|大学名|病院名|商品名|地名|町名|部署名|ユーザー名|サイト名|件名|署名|宛名|希望名|通称|ニックネーム|建物|部屋|号室)/.test(
      meta
    ) &&
    !/(family.?name|last.?name|given.?name|first.?name|surname|姓名|氏名)/.test(meta)
  ) {
    return null;
  }

  const hasStandaloneSei = /(?:^|\s)姓(?:$|\s|[（(])/u.test(meta) || /(?:^|\s)名字(?:$|\s|[（(])/u.test(meta);
  const hasStandaloneMei = /(?:^|\s)名(?:$|\s|[（(])/u.test(meta);
  const hasNameContext = /(name|family|given|first|last|surname|full.?name|氏名|姓名|お名前|姓|名)/.test(meta);
  if (!hasNameContext) return null;

  if (/(company|organization|school|faculty|大学|会社|企業|団体|学校|学部)/.test(meta) && !/(姓|名|first|last|given|family|surname)/.test(meta)) {
    return null;
  }

  if (/(family.?name|last.?name|surname)/.test(meta) || hasStandaloneSei) return "last";
  if (/(given.?name|first.?name)/.test(meta) || hasStandaloneMei) return "first";
  return null;
}

function detectNameScriptHint(meta: string): string {
  if (!meta) return "unknown";
  if (/(western.?script|roman|latin|alphabet|english|英字|英語|ローマ字)/.test(meta)) return "roman";
  if (/(hiragana|ひらがな)/.test(meta)) return "hiragana";
  if (/(katakana|カタカナ|全角.?カナ)/.test(meta)) return "katakana";
  if (/(furigana|kana|かな|カナ|ふりがな|フリガナ|phonetic)/.test(meta)) return "kana";
  if (/(kanji|漢字)/.test(meta)) return "kanji";
  return "unknown";
}

function chooseUnknownScript(partCandidates: Candidate[]): void {
  const hasExplicitKanji = partCandidates.some((x) => x.scriptHint === "kanji");
  const hasExplicitKana = partCandidates.some((x) => KANA_SCRIPT_KEYS.has(x.scriptHint!));

  for (const candidate of partCandidates) {
    if (candidate.scriptHint !== "unknown") continue;

    if (hasExplicitKanji && !hasExplicitKana) {
      candidate.scriptHint = "kana";
      continue;
    }

    if (hasExplicitKana && !hasExplicitKanji) {
      candidate.scriptHint = "kanji";
      continue;
    }

    candidate.scriptHint = "kanji";
  }
}

function mapNameCandidate(candidate: Candidate): void {
  if (!candidate.namePart || !candidate.scriptHint) return;

  if (candidate.scriptHint === "roman") {
    candidate.field = candidate.namePart === "last" ? "lastNameEnglish" : "firstNameEnglish";
    return;
  }

  if (candidate.namePart === "last") {
    if (candidate.scriptHint === "kanji") {
      candidate.field = "lastNameKanji";
      return;
    }

    if (candidate.scriptHint === "hiragana") {
      candidate.field = "lastNameKana";
      candidate.kanaTarget = "hiragana";
      return;
    }

    if (candidate.scriptHint === "katakana") {
      candidate.field = "lastNameKana";
      candidate.kanaTarget = "katakana";
      return;
    }

    candidate.field = "lastNameKana";
    return;
  }

  if (candidate.namePart === "first") {
    if (candidate.scriptHint === "kanji") {
      candidate.field = "firstNameKanji";
      return;
    }

    if (candidate.scriptHint === "hiragana") {
      candidate.field = "firstNameKana";
      candidate.kanaTarget = "hiragana";
      return;
    }

    if (candidate.scriptHint === "katakana") {
      candidate.field = "firstNameKana";
      candidate.kanaTarget = "katakana";
      return;
    }

    candidate.field = "firstNameKana";
  }
}

function assignNameFields(candidates: Candidate[]): void {
  const grouped: { last: Candidate[]; first: Candidate[] } = { last: [], first: [] };

  for (const candidate of candidates) {
    if (!(candidate.el instanceof HTMLInputElement || candidate.el instanceof HTMLTextAreaElement)) continue;
    if (candidate.el instanceof HTMLInputElement) {
      const inputType = String(candidate.el.type || "").toLowerCase();
      if (["hidden", "radio", "checkbox"].includes(inputType)) continue;
    }

    const part = detectNamePart(candidate.meta);
    if (!part) continue;

    candidate.namePart = part;
    candidate.scriptHint = detectNameScriptHint(candidate.meta);
    grouped[part].push(candidate);
  }

  chooseUnknownScript(grouped.last);
  chooseUnknownScript(grouped.first);

  for (const candidate of grouped.last) mapNameCandidate(candidate);
  for (const candidate of grouped.first) mapNameCandidate(candidate);
}

function assignNameFieldsByPairRows(candidates: Candidate[]): void {
  const unresolved = candidates.filter((candidate) => {
    if (candidate.field) return false;
    if (!(candidate.el instanceof HTMLElement)) return false;
    if (!candidate.el.matches("input, textarea, [role='combobox']")) return false;
    const type = String((candidate.el as HTMLInputElement).type || "").toLowerCase();
    return !["hidden", "checkbox", "radio"].includes(type);
  });

  const rowLike = unresolved.filter((candidate) =>
    /(氏名|姓名|お名前|漢字氏名|カナ氏名|フリガナ氏名|name)/.test(candidate.meta)
  );
  const rows = buildLineGroups(rowLike, 24);

  for (const row of rows) {
    const rowCandidates = row.map((item) => item.candidate).filter((candidate) => !candidate.field);
    if (rowCandidates.length < 2) continue;

    const combinedMeta = rowCandidates.map((candidate) => candidate.meta).join(" ");
    const sorted = [...rowCandidates].sort(
      (a, b) => (a.layoutEl || a.el).getBoundingClientRect().left - (b.layoutEl || b.el).getBoundingClientRect().left
    );

    let targetFields: [string, string] | null = null;
    if (/(漢字氏名|氏名.*漢字|漢字)/.test(combinedMeta)) {
      targetFields = ["lastNameKanji", "firstNameKanji"];
    } else if (/(カナ氏名|フリガナ|ふりがな|かな氏名|カナ|かな)/.test(combinedMeta)) {
      targetFields = ["lastNameKana", "firstNameKana"];
    } else if (/(english|英字|ローマ字|roman|latin)/.test(combinedMeta)) {
      targetFields = ["lastNameEnglish", "firstNameEnglish"];
    }

    if (!targetFields) continue;
    sorted[0].field = targetFields[0];
    sorted[1].field = targetFields[1];

    if (targetFields[0] === "lastNameKana") {
      const kanaTarget = /(hiragana|ひらがな)/.test(combinedMeta)
        ? "hiragana"
        : /(katakana|カタカナ)/.test(combinedMeta)
          ? "katakana"
          : null;
      if (kanaTarget) {
        sorted[0].kanaTarget = kanaTarget;
        sorted[1].kanaTarget = kanaTarget;
      }
    }
  }
}

function hasVacationContext(el: HTMLElement | null, meta: string, rawHint: string = ""): boolean {
  const combined = `${meta} ${normalize(toHalfWidth(rawHint))}`;
  if (/(休暇中|vacation|temporary)/i.test(combined)) return true;

  const scopedContainer = el?.closest?.("tbody") || el?.closest?.("fieldset") || el?.closest?.("section");
  if (scopedContainer) {
    const scopedText = toHalfWidth(String(scopedContainer.textContent || ""));
    if (/休暇中の連絡先|休暇中住所|現住所と同じ場合/.test(scopedText)) return true;
  }

  const tr = el?.closest?.("tr");
  if (tr) {
    let cursor: Element | null = tr;
    for (let i = 0; i < 8 && cursor; i += 1) {
      const text = toHalfWidth(String((cursor as HTMLElement).textContent || ""));
      if (/休暇中の連絡先|休暇中住所|現住所と同じ場合/.test(text)) return true;
      cursor = cursor.previousElementSibling;
    }
  }

  return false;
}

function matchVacationField(meta: string, type: string): string | null {
  if (/(現住所.*同じ|same.*current|same.*address|休暇中住所.*同じ)/.test(meta)) {
    return "vacationAddressSameAsCurrent";
  }
  if (type === "tel" || /電話|phone|tel/.test(meta)) return "vacationPhone";
  if (/郵便|postal|post.?code|zip|〒/.test(meta)) return "vacationPostalCode";
  if (/都道府県|prefecture/.test(meta)) return "vacationPrefecture";
  if (/マンション|アパート|建物|号室|address.?line.?2|address.?2/.test(meta)) return "vacationAddressLine2";
  if (/市区|地名|番地|住所|address/.test(meta)) return "vacationAddressLine1";
  return null;
}

function matchNonNameField(meta: string, type: string, el: HTMLElement | null, rawHint: string = ""): string | null {
  const combinedMeta = `${meta} ${normalize(toHalfWidth(rawHint))}`;
  const rowContext = normalize(
    toHalfWidth(String(el?.closest?.("tr")?.textContent || el?.closest?.("fieldset, section")?.textContent || ""))
  );
  const contextualMeta = `${combinedMeta} ${rowContext}`;
  const name = normalize(toHalfWidth(el?.getAttribute?.("name") || (el as HTMLInputElement)?.name || ""));
  const id = normalize(toHalfWidth(el?.id || ""));
  const autocomplete = normalize(toHalfWidth(el?.getAttribute?.("autocomplete") || ""));
  const keyed = `${name} ${id} ${autocomplete}`;
  const keyId = `${name} ${id}`;

  if (/(?:高等学校|高校).*(卒業年月|卒業年|graduation)/i.test(contextualMeta)) return "highSchoolGraduationDate";
  if (
    /(出身.*(?:高等学校|高校)|卒業された.*(?:高等学校|高校)|(?:高等学校|高校).*(?:名|学校)|high.?school)/i.test(
      contextualMeta
    ) &&
    !/(卒業年月|卒業年|卒業後|理由|gap)/i.test(contextualMeta)
  ) {
    return "highSchool";
  }

  if (
    el &&
    (el.tagName === "SELECT" || isCustomCombobox(el)) &&
    /(卒業年月|graduation.?month|year.?month)/i.test(contextualMeta) &&
    !/(高等学校|高校)/i.test(contextualMeta)
  ) {
    return "graduationYear";
  }

  if (hasVacationContext(el, meta, rawHint)) {
    const vacationField = matchVacationField(`${meta} ${keyed}`, type);
    if (vacationField) return vacationField;
  }

  if (/\bpostal(?:\s|-)?code\b|\bzip\b/.test(autocomplete)) return "postalCode";
  if (/\baddress(?:\s|-)?level1\b/.test(autocomplete)) return "prefecture";
  if (/\baddress(?:\s|-)?level2\b/.test(autocomplete)) return "city";
  if (/\baddress(?:\s|-)?line1\b/.test(autocomplete)) return "addressLine1";
  if (/\baddress(?:\s|-)?line2\b/.test(autocomplete)) return "addressLine2";

  if (/\bgkbn\b/.test(keyed)) return "educationType";
  if (/\bgon\b/.test(keyed)) return "universityKanaInitial";
  if (/\bdken\b/.test(keyed)) return "universityPrefecture";
  if (/\bgakka\b|\bdepartment\b/.test(keyed)) return "department";
  if (/\bbunri\b|\bhumanities.?science\b|\barts.?science\b/.test(keyed)) return "humanitiesScienceType";
  if (/\bybirth\b|\bmbirth\b|\bdbirth\b/.test(keyed)) return "birthDate";
  if (/\bpostal\b|\bpost.?code\b|\bzip\b|郵便/.test(keyId)) return "postalCode";
  if (/\bcity\b|\bmunicipality\b|市区町村|市区郡/.test(keyId)) return "city";
  if (/\baddress.?line.?2\b|\baddress.?2\b|\bline.?2\b|\baddr.?2\b/.test(keyId)) return "addressLine2";
  if (/\baddress.?line.?1\b|\baddress.?1\b|\bline.?1\b|\baddr.?1\b/.test(keyId)) return "addressLine1";
  if (/\baddress\b/.test(keyId)) return "addressLine1";

  if (type === "email") return "email";
  if (type === "tel") return "phone";
  if (type === "url") return "portfolio";
  if (type === "password") return "password";

  for (const [field, patterns] of Object.entries(NON_NAME_FIELD_PATTERNS)) {
    if (patterns.some((pattern) => pattern.test(meta))) {
      const negatives = FIELD_NEGATIVE_PATTERNS[field];
      if (negatives?.some((pattern) => pattern.test(meta))) continue;
      return field;
    }
  }

  return null;
}

function katakanaToHiragana(value: string | null | undefined): string {
  return String(value || "")
    .normalize("NFKC")
    .replace(/[\u30a1-\u30f6]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0x60));
}

function hiraganaToKatakana(value: string | null | undefined): string {
  return String(value || "")
    .normalize("NFKC")
    .replace(/[\u3041-\u3096]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) + 0x60));
}

function deriveGojuonInitial(text: string | null | undefined): string {
  const hira = katakanaToHiragana(toHalfWidth(String(text || "")));
  for (const ch of hira) {
    if (!/[ぁ-ゖゔ]/.test(ch)) continue;
    const mapped = GOJUON_INITIAL_MAP[ch] ?? ch;
    if (!mapped) continue;
    if (/[あ-ん]/.test(mapped)) return mapped;
  }
  return "";
}

function deriveUniversityKanaInitial(profile: Profile): string {
  const explicit = deriveGojuonInitial(profile.universityKanaInitial);
  if (explicit) return explicit;

  const university = cleanProfileValue(profile.university);
  if (!university) return "";

  const direct = deriveGojuonInitial(university);
  if (direct) return direct;

  for (const override of getMatchedUniversityOverrides(university)) {
    const initial = deriveGojuonInitial(override.reading);
    if (initial) return initial;
  }

  return "";
}

function splitPostalDigits(value: string | null | undefined): [string, string] {
  const digits = extractDigits(value);
  return [digits.slice(0, 3), digits.slice(3, 7)];
}

function getDefaultPhoneLengths(digits: string): [number, number, number] {
  if (digits.length === 11) return [3, 4, 4];
  if (digits.length === 10 && /^(03|06)/.test(digits)) return [2, 4, 4];
  if (digits.length === 10) return [3, 3, 4];
  if (digits.length === 9) return [2, 3, 4];
  return [3, 4, 4];
}

function splitDigitsByLengths(digits: string, partCount: number, explicitLengths: number[] = []): string[] {
  const parts: string[] = [];
  let cursor = 0;

  for (let i = 0; i < partCount; i += 1) {
    if (i === partCount - 1) {
      parts.push(digits.slice(cursor));
      break;
    }

    let len = Number(explicitLengths[i]);
    if (!Number.isFinite(len) || len <= 0) {
      const remainingParts = partCount - i;
      len = Math.max(1, Math.floor((digits.length - cursor) / remainingParts));
    }

    parts.push(digits.slice(cursor, cursor + len));
    cursor += len;
  }

  return parts;
}

function splitPhoneDigits(value: string | null | undefined, partCount: number, explicitLengths: number[] = []): string[] {
  const digits = extractDigits(value);
  if (!digits) return Array(partCount).fill("");
  if (partCount <= 1) return [digits];

  const hasExplicit = explicitLengths.some((x) => Number.isFinite(Number(x)) && Number(x) > 0);
  const defaultLengths = getDefaultPhoneLengths(digits);
  const lengths = hasExplicit ? explicitLengths : defaultLengths;

  return splitDigitsByLengths(digits, partCount, lengths);
}

function formatPhoneForSingleField(value: string | null | undefined): string {
  const digits = extractDigits(value);
  if (digits.length <= 4) return digits;
  return splitPhoneDigits(digits, 3).filter(Boolean).join("-");
}

function formatPostalForSingleField(value: string | null | undefined): string {
  const [a, b] = splitPostalDigits(value);
  return b ? `${a}-${b}` : a;
}

function normalizeProfileUrl(value: string | null | undefined): string {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;

  const withoutFragment = trimmed.split("#")[0] || "";
  const head = withoutFragment.split("/")[0] || "";
  if (/^[a-z0-9][a-z0-9.-]*\.[a-z][a-z0-9.-]*$/i.test(head)) {
    return `https://${trimmed}`;
  }

  return trimmed;
}

function parseBirthDate(value: string | null | undefined): ParsedBirthDate | null {
  const normalized = toHalfWidth(value).trim();
  const matched = normalized.match(/(\d{4})\D+(\d{1,2})\D+(\d{1,2})/) || normalized.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (!matched) return null;

  const year = matched[1];
  const monthNum = Number(matched[2]);
  const dayNum = Number(matched[3]);
  if (!Number.isFinite(monthNum) || !Number.isFinite(dayNum)) return null;

  return {
    year,
    month: String(monthNum).padStart(2, "0"),
    monthRaw: String(monthNum),
    day: String(dayNum).padStart(2, "0"),
    dayRaw: String(dayNum)
  };
}

function parseYearMonth(value: string | null | undefined): ParsedYearMonth | null {
  const normalized = toHalfWidth(value).trim();
  if (!normalized) return null;

  const matched =
    normalized.match(/(\d{4})\D+(\d{1,2})/) ||
    normalized.match(/^(\d{4})(\d{2})$/) ||
    normalized.match(/^(\d{4})-(\d{2})$/);
  if (!matched) return null;

  const year = matched[1];
  const monthNum = Number(matched[2]);
  if (!Number.isFinite(monthNum) || monthNum < 1 || monthNum > 12) return null;

  return {
    year,
    month: String(monthNum).padStart(2, "0"),
    monthRaw: String(monthNum)
  };
}

function detectBirthPartHint(candidate: Candidate): string {
  const idName = normalize(`${candidate.el?.id || ""} ${(candidate.el as HTMLInputElement)?.name || ""}`);
  if (/(^| )ybirth( |$)|birth.?year|(^| )year( |$)/i.test(idName)) return "year";
  if (/(^| )mbirth( |$)|birth.?month|(^| )month( |$)/i.test(idName)) return "month";
  if (/(^| )dbirth( |$)|birth.?day|(^| )day( |$)/i.test(idName)) return "day";

  const narrowHint = `${(candidate.el as HTMLInputElement)?.placeholder || ""} ${candidate.el?.getAttribute("aria-label") || ""} ${
    candidate.el?.getAttribute("title") || ""
  }`;
  if (/(year|yyyy|yy)/i.test(narrowHint)) return "year";
  if (/(month|mm)/i.test(narrowHint)) return "month";
  if (/(day|dd)/i.test(narrowHint)) return "day";

  const hint = `${candidate.rawHint || ""} ${candidate.meta || ""}`;
  const hasYear = /(year|年|yyyy|yy|birth.?year)/i.test(hint);
  const hasMonth = /(month|月|mm|birth.?month)/i.test(hint);
  const hasDay = /(day|日|dd|birth.?day)/i.test(hint);
  const hits = Number(hasYear) + Number(hasMonth) + Number(hasDay);
  if (hits > 1) return "";
  if (hasYear) return "year";
  if (hasMonth) return "month";
  if (hasDay) return "day";
  return "";
}

function birthPartValues(part: string, parsed: ParsedBirthDate | null): string[] {
  if (!parsed) return [];
  if (part === "year") return [parsed.year];
  if (part === "month") return [parsed.month, parsed.monthRaw];
  if (part === "day") return [parsed.day, parsed.dayRaw];
  return [];
}

function getExplicitSegmentLength(el: HTMLElement): number {
  const maxLen = Number((el as HTMLInputElement).maxLength);
  if (Number.isFinite(maxLen) && maxLen > 0 && maxLen <= 8) return maxLen;

  const pattern = el.getAttribute("pattern") || "";
  const matched = pattern.match(/\{(\d+)\}/);
  if (matched) {
    const len = Number(matched[1]);
    if (Number.isFinite(len) && len > 0 && len <= 8) return len;
  }

  return 0;
}

function shouldHyphenatePhone(candidate: Candidate): boolean {
  const hint = `${candidate.rawHint || ""} ${candidate.meta || ""}`;
  if (/ハイフン不要|ハイフンなし|記号なし|without hyphen/i.test(hint)) return false;
  if (/ハイフン|半角記号|[-－ー]\d{2,4}[-－ー]\d{2,4}/.test(hint)) return true;
  const pattern = candidate.el.getAttribute("pattern") || "";
  return pattern.includes("-");
}

function shouldHyphenatePostal(candidate: Candidate): boolean {
  const hint = `${candidate.rawHint || ""} ${candidate.meta || ""}`;
  if (/ハイフン不要|ハイフンなし|記号なし|without hyphen/i.test(hint)) return false;
  if (/〒|郵便番号|ハイフン|[-－ー]\d{4}/.test(hint)) return true;
  const pattern = candidate.el.getAttribute("pattern") || "";
  return pattern.includes("-");
}

function isYesValue(value: string | null | undefined): boolean {
  const normalized = normalize(toHalfWidth(String(value || "")));
  return ["yes", "はい", "true", "1", "同じ"].some((token) => normalized === token || normalized.includes(token));
}

function isNoValue(value: string | null | undefined): boolean {
  const normalized = normalize(toHalfWidth(String(value || "")));
  return ["no", "いいえ", "false", "0", "別"].some((token) => normalized === token || normalized.includes(token));
}

function shouldUseVacationSameAsCurrent(profile: Profile): boolean {
  const explicit = cleanProfileValue(profile.vacationAddressSameAsCurrent);
  if (isYesValue(explicit)) return true;
  if (isNoValue(explicit)) return false;

  const hasVacationAddress = [
    profile.vacationPostalCode,
    profile.vacationPrefecture,
    profile.vacationAddressLine1,
    profile.vacationAddressLine2,
    profile.vacationPhone
  ].some((value) => cleanProfileValue(value).length > 0);

  // If user left vacation address blank, default to "same as current address".
  return !hasVacationAddress;
}

function resolveAutofillValue(candidate: Candidate, profile: Profile): string | undefined {
  const { field, kanaTarget } = candidate;
  let rawValue = profile[field!];
  const useVacationSameAsCurrent = shouldUseVacationSameAsCurrent(profile);

  if (field === "vacationAddressSameAsCurrent") {
    return useVacationSameAsCurrent ? "yes" : rawValue;
  }

  if (
    useVacationSameAsCurrent &&
    (field === "vacationPostalCode" ||
      field === "vacationPrefecture" ||
      field === "vacationAddressLine1" ||
      field === "vacationAddressLine2" ||
      field === "vacationPhone")
  ) {
    return "";
  }

  if (field === "email") {
    rawValue = resolveEmailValueForSubtype(candidate.contactSubtype || "email_unknown", profile);
  }

  if (field === "phone") {
    rawValue = resolvePhoneValueForSubtype(candidate.contactSubtype || "phone_unknown", profile);
  }

  if (field === "universityKanaInitial") {
    rawValue = rawValue || deriveUniversityKanaInitial(profile);
  }

  if (URL_FIELD_KEYS.has(field!)) {
    rawValue = normalizeProfileUrl(rawValue);
  }

  if (field === "graduationYear") {
    const parsed = parseYearMonth(rawValue);
    if (parsed) {
      const hints = [
        candidate.meta,
        candidate.rawHint,
        candidate.el.getAttribute("name"),
        candidate.el.id,
        (candidate.el as HTMLInputElement).placeholder,
        candidate.el.getAttribute("aria-label"),
        candidate.el.getAttribute("title")
      ]
        .map((x) => toHalfWidth(String(x || "")))
        .join(" ");

      const asksYearMonth = /(卒業年月|year.?month|graduation.?month)/i.test(hints);
      const asksMonthOnly = /(月|month)/i.test(hints) && !asksYearMonth && !/(年|year)/i.test(hints);
      const asksYearOnly = /(年|year)/i.test(hints) && !asksYearMonth && !/(月|month)/i.test(hints);

      if (asksMonthOnly) {
        rawValue = parsed.month;
      } else if (asksYearOnly) {
        rawValue = parsed.year;
      } else {
        rawValue = `${parsed.year}-${parsed.month}`;
      }
    }
  }

  if (field === "addressLine1") {
    const line1 = cleanProfileValue(rawValue);
    if (!line1) return line1;

    const shouldCombineCity = Boolean(candidate.combineCityForAddressLine1);
    if (!shouldCombineCity) return line1;

    const city = cleanProfileValue(profile.city);
    if (!city) return line1;

    const cityNorm = normalize(toHalfWidth(city));
    const line1Norm = normalize(toHalfWidth(line1));
    if (line1Norm.startsWith(cityNorm)) return line1;
    return `${city}${line1}`;
  }

  if (rawValue == null || rawValue === "") return rawValue;

  if (field === "postalCode" || field === "vacationPostalCode") {
    return shouldHyphenatePostal(candidate) ? formatPostalForSingleField(rawValue) : extractDigits(rawValue);
  }

  if (field === "phone" || field === "vacationPhone") {
    return shouldHyphenatePhone(candidate) ? formatPhoneForSingleField(rawValue) : extractDigits(rawValue);
  }

  if (!KANA_FIELD_KEYS.has(field!)) return rawValue;

  if (kanaTarget === "hiragana") return katakanaToHiragana(rawValue);
  if (kanaTarget === "katakana") return hiraganaToKatakana(rawValue);
  return rawValue;
}

function expandCandidateValues(field: string, value: string | null | undefined): string[] {
  if (value == null || value === "") return [];

  if (
    field === "vacationAddressSameAsCurrent" ||
    field === "overseasExperience" ||
    field === "hospitalizedTwoWeeks" ||
    field === "driverLicense" ||
    field === "awardsRecognition" ||
    field === "criminalRecord" ||
    field === "latestAcademicOverseasSchool"
  ) {
    if (isYesValue(value)) {
      return ["yes", "はい", "有", "1", "true", "同じ"];
    }
    if (isNoValue(value)) {
      return ["no", "いいえ", "無", "0", "false", "別"];
    }
    return [String(value)];
  }

  if (field === "educationType") {
    const aliases = EDUCATION_TYPE_ALIASES[value] || [];
    return Array.from(new Set([String(value), ...aliases].map((x) => toHalfWidth(x).trim()).filter(Boolean)));
  }

  if (field === "humanitiesScienceType") {
    const aliases = HUMANITIES_SCIENCE_TYPE_ALIASES[value] || [];
    return Array.from(new Set([String(value), ...aliases].map((x) => toHalfWidth(x).trim()).filter(Boolean)));
  }

  if (field === "universityKanaInitial") {
    const base = toHalfWidth(String(value)).trim();
    if (!base) return [];
    return Array.from(new Set([base, katakanaToHiragana(base), hiraganaToKatakana(base)]));
  }

  if (field === "birthDate") {
    const normalized = toHalfWidth(String(value)).trim();
    const numeric = String(Number(normalized));
    const values = [normalized];
    if (Number.isFinite(Number(normalized))) values.push(numeric);
    return Array.from(new Set(values.filter(Boolean)));
  }

  if (field === "graduationYear") {
    const parsed = parseYearMonth(value);
    if (!parsed) return [String(value)];
    const variants = [
      `${parsed.year}-${parsed.month}`,
      `${parsed.year}/${parsed.month}`,
      `${parsed.year}/${parsed.monthRaw}`,
      `${parsed.year}年${parsed.month}月`,
      `${parsed.year}年${parsed.monthRaw}月`,
      parsed.year,
      parsed.month,
      parsed.monthRaw
    ];
    return Array.from(new Set(variants.map((x) => toHalfWidth(String(x)).trim()).filter(Boolean)));
  }

  if (field !== "gender") return [String(value)];

  const aliasValues = GENDER_VALUE_ALIASES[value] || [];
  return [String(value), ...aliasValues];
}

function getInputLabelText(input: HTMLInputElement): string {
  const parts: (string | null | undefined)[] = [
    input.value,
    input.getAttribute("aria-label"),
    input.id,
    input.name
  ];
  if (input.labels?.length) {
    for (const label of Array.from(input.labels)) parts.push(label.textContent);
  }
  const wrapper = input.closest("label");
  if (wrapper?.textContent) parts.push(wrapper.textContent);

  if (
    input.parentElement?.classList?.contains("jqTransformRadioWrapper") ||
    input.parentElement?.classList?.contains("jqTransformCheckboxWrapper")
  ) {
    const sibling = input.parentElement.nextElementSibling;
    if (sibling?.tagName === "LABEL" && sibling.textContent) {
      parts.push(sibling.textContent);
    }
  }

  const li = input.closest("li");
  if (li) {
    const labelLike = li.querySelector("label, .gojyuuon, .smallmar");
    if (labelLike?.textContent) parts.push(labelLike.textContent);
    const sectionHeading = li.closest(".formbox04, .formbox06")?.querySelector("h3, h4, .heading_l3, .heading_l4");
    if (sectionHeading?.textContent) parts.push(sectionHeading.textContent);
  }

  return normalize(parts.filter(Boolean).join(" "));
}

function getRadioChoiceLabel(input: HTMLInputElement): string {
  const parts: string[] = [];
  const push = (value: string | null | undefined): void => {
    const text = String(value || "").trim();
    if (text) parts.push(text);
  };

  if (input.labels?.length) {
    for (const label of Array.from(input.labels)) push(label.textContent);
  }

  const wrapper = input.closest("label");
  if (wrapper) push(wrapper.textContent);

  const next = input.nextElementSibling;
  if (next?.tagName === "LABEL") push(next.textContent);

  if (
    input.parentElement?.classList?.contains("jqTransformRadioWrapper") ||
    input.parentElement?.classList?.contains("jqTransformCheckboxWrapper")
  ) {
    const sibling = input.parentElement.nextElementSibling;
    if (sibling?.tagName === "LABEL") push(sibling.textContent);
  }

  const li = input.closest("li");
  if (li) {
    const labelLike = li.querySelector("label, .gojyuuon, .smallmar");
    if (labelLike) push(labelLike.textContent);
  }

  push(input.value);

  const unique = Array.from(new Set(parts));
  if (!unique.length) return "";
  return unique.sort((a, b) => b.length - a.length)[0];
}

function getRadioShortKanaLabel(input: HTMLInputElement): string {
  const labels: string[] = [];
  const push = (value: string | null | undefined): void => {
    const text = String(value || "").trim();
    if (text) labels.push(text);
  };

  if (input.labels?.length) {
    for (const label of Array.from(input.labels)) push(label.textContent);
  }
  const sibling = input.parentElement?.nextElementSibling;
  if (sibling?.tagName === "LABEL") push(sibling.textContent);
  const liLabel = input.closest("li")?.querySelector("label.gojyuuon");
  if (liLabel) push(liLabel.textContent);

  for (const text of labels) {
    const normalized = katakanaToHiragana(toHalfWidth(text)).trim();
    if (/^[ぁ-ん]$/.test(normalized)) return normalized;
  }
  return "";
}

function normalizeUniversityChoiceText(text: string | null | undefined): string {
  return toHalfWidth(String(text || ""))
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[()（）\[\]{}「」『』【】〈〉《》〔〕、。，,.・･'"]/g, "")
    .replace(/\s+/g, "")
    .replace(/ヶ/g, "ケ")
    .replace(/ヵ/g, "カ");
}

function buildUniversityChoiceCandidates(text: string | null | undefined): string[] {
  const candidates = new Set<string>();
  const prefixes = ["学校法人", "国立", "公立", "私立"];
  const suffixes = [
    "大学院大学",
    "高等専門学校",
    "短期大学",
    "専門学校",
    "大学院",
    "大学",
    "学園",
    "college",
    "university",
    "school"
  ];

  const addCandidateVariants = (sourceText: string): void => {
    const base = normalizeUniversityChoiceText(sourceText);
    if (!base) return;
    candidates.add(base);

    for (const prefix of prefixes) {
      const normalizedPrefix = normalizeUniversityChoiceText(prefix);
      if (base.startsWith(normalizedPrefix) && base.length > normalizedPrefix.length + 1) {
        candidates.add(base.slice(normalizedPrefix.length));
      }
    }

    const current = Array.from(candidates);
    for (const item of current) {
      for (const suffix of suffixes) {
        const normalizedSuffix = normalizeUniversityChoiceText(suffix);
        if (!normalizedSuffix) continue;
        if (item.endsWith(normalizedSuffix) && item.length > normalizedSuffix.length + 1) {
          candidates.add(item.slice(0, -normalizedSuffix.length));
        }
      }
    }
  };

  addCandidateVariants(String(text || ""));
  for (const override of getMatchedUniversityOverrides(String(text || ""))) {
    for (const keyword of override.keywords) {
      addCandidateVariants(keyword);
    }
  }

  return Array.from(candidates).filter((x) => x.length >= 2);
}

function isLikelyUniversityNameChoice(label: string | null | undefined): boolean {
  const text = toHalfWidth(String(label || ""));
  if (!/(大学|短期大学|大学院大学|専門学校|college|university|school)/i.test(text)) return false;
  return normalizeUniversityChoiceText(text).length >= 4;
}

function normalizeKanaForMatch(text: string | null | undefined): string {
  return normalize(katakanaToHiragana(toHalfWidth(String(text || ""))));
}

function clickLikeUser(el: HTMLElement): void {
  (["pointerdown", "mousedown", "mouseup", "click"] as const).forEach((eventName) => {
    el.dispatchEvent(new MouseEvent(eventName, { bubbles: true, cancelable: true, view: window }));
  });
}

function setRadioValue(
  el: HTMLInputElement,
  field: string,
  value: string,
  options: { overwrite?: boolean } = {}
): boolean {
  const { overwrite = true } = options;
  if (!overwrite && el.checked) return false;

  const targetCandidates = expandCandidateValues(field, value)
    .map((x) => normalize(x))
    .filter(Boolean);
  const targetKanaCandidates = targetCandidates.map((x) => normalizeKanaForMatch(x)).filter(Boolean);
  if (!targetCandidates.length && !targetKanaCandidates.length) return false;

  const escapedName = typeof CSS !== "undefined" && CSS.escape ? CSS.escape(el.name || "") : el.name || "";
  let radios: HTMLInputElement[];
  if (el.name) {
    radios = Array.from(document.querySelectorAll<HTMLInputElement>(`input[type="radio"][name="${escapedName}"]`));
  } else {
    radios = [el];
  }

  radios = radios.filter((radio) => !radio.disabled);
  if (!radios.length) return false;

  if (field === "universityKanaInitial") {
    const targetInitial = deriveGojuonInitial(value);
    if (targetInitial) {
      const byKanaLabel = radios.find((radio) => getRadioShortKanaLabel(radio) === targetInitial);
      if (byKanaLabel) {
        if (isJqTransformHiddenChoice(byKanaLabel)) {
          const proxy = byKanaLabel.parentElement?.querySelector("a.jqTransformRadio, a.jqTransformCheckbox");
          if (proxy instanceof HTMLElement) clickLikeUser(proxy);
        }
        clickLikeUser(byKanaLabel);
        byKanaLabel.checked = true;
        byKanaLabel.dispatchEvent(new Event("input", { bubbles: true }));
        byKanaLabel.dispatchEvent(new Event("change", { bubbles: true }));
        return true;
      }
    }
  }

  const exact = radios.find((radio) => {
    const meta = getInputLabelText(radio);
    const val = normalize(radio.value);
    const metaKana = normalizeKanaForMatch(meta);
    const valKana = normalizeKanaForMatch(radio.value);
    return (
      targetCandidates.some((target) => target === val || target === meta) ||
      targetKanaCandidates.some((target) => target === valKana || target === metaKana)
    );
  });

  const fuzzy =
    exact ||
    radios.find((radio) => {
      const meta = getInputLabelText(radio);
      const val = normalize(radio.value);
      const metaKana = normalizeKanaForMatch(meta);
      const valKana = normalizeKanaForMatch(radio.value);
      const textMatch = targetCandidates.some(
        (target) => meta.includes(target) || (val && (val.includes(target) || target.includes(val)))
      );
      const kanaMatch = targetKanaCandidates.some(
        (target) =>
          metaKana.includes(target) || (valKana && (valKana.includes(target) || target.includes(valKana)))
      );
      return textMatch || kanaMatch;
    });

  const matched = fuzzy;
  if (!matched) return false;

  if (isJqTransformHiddenChoice(matched)) {
    const proxy = matched.parentElement?.querySelector("a.jqTransformRadio, a.jqTransformCheckbox");
    if (proxy instanceof HTMLElement) clickLikeUser(proxy);
  }
  clickLikeUser(matched);
  matched.checked = true;
  matched.dispatchEvent(new Event("input", { bubbles: true }));
  matched.dispatchEvent(new Event("change", { bubbles: true }));
  return true;
}

function fillUniversityChoiceGroups(
  profile: Profile,
  overwrite: boolean,
  handledElements: Set<HTMLElement>
): void {
  const university = cleanProfileValue(profile.university);
  const targetCandidates = buildUniversityChoiceCandidates(university).filter((x) => x.length >= 3);
  if (!targetCandidates.length) return;

  const radios = Array.from(document.querySelectorAll<HTMLInputElement>("input[type='radio']")).filter(
    (el) => !el.disabled && (isVisible(el) || isJqTransformHiddenChoice(el))
  );
  const groups = new Map<string, HTMLInputElement[]>();
  for (const radio of radios) {
    if (!radio.name) continue;
    if (!groups.has(radio.name)) groups.set(radio.name, []);
    groups.get(radio.name)!.push(radio);
  }

  for (const group of groups.values()) {
    if (group.length < 2) continue;
    const checkedRadio = group.find((radio) => radio.checked) || null;

    const choices = group
      .map((radio) => {
        const label = getRadioChoiceLabel(radio);
        const normalized = buildUniversityChoiceCandidates(label);
        return { radio, label, normalized };
      })
      .filter((choice) => choice.normalized.length > 0);

    if (!choices.length) continue;

    const universityLikeCount = choices.filter((choice) => isLikelyUniversityNameChoice(choice.label)).length;
    if (universityLikeCount < 2) continue;

    let matched = choices.find((choice) =>
      choice.normalized.some((candidate) => targetCandidates.includes(candidate))
    );

    if (!matched) {
      matched = choices.find((choice) =>
        choice.normalized.some(
          (candidate) =>
            candidate.length >= 4 &&
            targetCandidates.some(
              (target) => target.length >= 4 && (candidate.includes(target) || target.includes(candidate))
            )
        )
      );
    }

    if (!matched) continue;

    if (checkedRadio) {
      const checkedChoice = choices.find((choice) => choice.radio === checkedRadio);
      if (checkedChoice) {
        const alreadyMatches =
          checkedChoice.normalized.some((candidate) => targetCandidates.includes(candidate)) ||
          checkedChoice.normalized.some(
            (candidate) =>
              candidate.length >= 4 &&
              targetCandidates.some(
                (target) => target.length >= 4 && (candidate.includes(target) || target.includes(candidate))
              )
          );
        if (alreadyMatches) continue;
      }
    }

    if (isJqTransformHiddenChoice(matched.radio)) {
      const proxy = matched.radio.parentElement?.querySelector("a.jqTransformRadio, a.jqTransformCheckbox");
      if (proxy instanceof HTMLElement) clickLikeUser(proxy);
    }
    clickLikeUser(matched.radio);
    matched.radio.checked = true;
    matched.radio.dispatchEvent(new Event("input", { bubbles: true }));
    matched.radio.dispatchEvent(new Event("change", { bubbles: true }));
    group.forEach((radio) => handledElements.add(radio));
  }
}

function chooseMatchingOption<T extends OptionLike>(options: T[], candidates: string[]): T | null {
  if (!options.length || !candidates.length) return null;

  const normalizedCandidates = candidates.map((x) => normalize(x)).filter(Boolean);

  for (const option of options) {
    const text = normalize(option.textContent || (option as OptionLike).label || "");
    const val = normalize((option as OptionLike).value || "");
    if (normalizedCandidates.some((target) => target === text || target === val)) {
      return option;
    }
  }

  for (const option of options) {
    const text = normalize(option.textContent || (option as OptionLike).label || "");
    const val = normalize((option as OptionLike).value || "");
    if (normalizedCandidates.some((target) => text.includes(target) || val.includes(target))) {
      return option;
    }
  }

  return null;
}

function selectFromCustomCombobox(el: HTMLElement, field: string, value: string | null | undefined): boolean {
  const candidates = expandCandidateValues(field, String(value ?? ""));
  if (!candidates.length) return false;

  clickLikeUser(el);

  const ariaControls = el.getAttribute("aria-controls");
  const scoped = ariaControls ? document.getElementById(ariaControls) : null;
  const optionSelector = "[role='option'], [data-value], li";

  const nodes = Array.from((scoped || document).querySelectorAll(optionSelector)).filter(
    (node): node is HTMLElement => node instanceof HTMLElement && isVisible(node) && normalize(node.textContent).length > 0
  ) as (HTMLElement & OptionLike)[];

  const matched = chooseMatchingOption(nodes, candidates);
  if (!matched) return false;

  clickLikeUser(matched);
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
  return true;
}

function selectElementByCandidates(
  el: HTMLElement,
  candidates: string[],
  options: { overwrite?: boolean } = {}
): boolean {
  const { overwrite = true } = options;
  const normalizedCandidates = candidates.map((x) => toHalfWidth(String(x || "")).trim()).filter(Boolean);
  if (!normalizedCandidates.length) return false;
  if (!overwrite && hasExistingValue(el)) return false;

  if (el.tagName === "SELECT") {
    const selectEl = el as HTMLSelectElement;
    const option = chooseMatchingOption(
      Array.from(selectEl.options) as (HTMLOptionElement & OptionLike)[],
      normalizedCandidates
    );
    if (!option) return false;
    selectEl.value = option.value!;
    const optionIndex = Array.from(selectEl.options).indexOf(option as HTMLOptionElement);
    if (optionIndex >= 0) selectEl.selectedIndex = optionIndex;
    if (option instanceof HTMLOptionElement) {
      option.selected = true;
      option.scrollIntoView({ block: "nearest" });
    }
    clickLikeUser(selectEl);

    if (isJqTransformHiddenSelect(el)) {
      const wrapper = getJqTransformWrapper(el);
      const label = wrapper?.querySelector("div > span, span");
      if (label) label.textContent = (option.textContent || (option as HTMLOptionElement).label || "").trim();
    }

    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  }

  if (isCustomCombobox(el)) {
    clickLikeUser(el);

    const ariaControls = el.getAttribute("aria-controls");
    const scoped = ariaControls ? document.getElementById(ariaControls) : null;
    const optionSelector = "[role='option'], [data-value], li";
    const nodes = Array.from((scoped || document).querySelectorAll(optionSelector)).filter(
      (node): node is HTMLElement => node instanceof HTMLElement && isVisible(node) && normalize(node.textContent).length > 0
    ) as (HTMLElement & OptionLike)[];

    const matched = chooseMatchingOption(nodes, normalizedCandidates);
    if (!matched) return false;

    clickLikeUser(matched);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  }

  return false;
}

function clearFieldValue(el: HTMLElement): boolean {
  if (el.tagName === "SELECT") {
    const selectEl = el as HTMLSelectElement;
    const placeholderIndex = Array.from(selectEl.options).findIndex(
      (option, index) =>
        option.value === "" ||
        option.disabled ||
        index === 0 ||
        /選択|未設定|choose|select/i.test(toHalfWidth(option.textContent || option.label || ""))
    );
    selectEl.selectedIndex = placeholderIndex >= 0 ? placeholderIndex : 0;
    selectEl.value = selectEl.options[selectEl.selectedIndex]?.value || "";
    clickLikeUser(selectEl);

    if (isJqTransformHiddenSelect(el)) {
      const wrapper = getJqTransformWrapper(el);
      const label = wrapper?.querySelector("div > span, span");
      if (label) {
        const selected = selectEl.options[selectEl.selectedIndex];
        label.textContent = (selected?.textContent || selected?.label || "").trim();
      }
    }
  } else if (isCustomCombobox(el)) {
    const inputLike = el as HTMLElement & { value?: string };
    if (typeof inputLike.value === "string") {
      inputLike.value = "";
    }
    if ("textContent" in el) {
      const text = normalize(el.textContent);
      if (text && /選択|choose|select|未設定/.test(text)) {
        el.textContent = "";
      }
    }
  } else if ((el as HTMLInputElement).type === "checkbox" || (el as HTMLInputElement).type === "radio") {
    const input = el as HTMLInputElement;
    if (!input.checked) return false;
    if (isJqTransformHiddenChoice(input)) {
      const proxy = input.parentElement?.querySelector("a.jqTransformRadio, a.jqTransformCheckbox");
      if (proxy instanceof HTMLElement) clickLikeUser(proxy);
    }
    clickLikeUser(input);
    input.checked = false;
  } else if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
    if (!el.value) return false;
    el.focus();
    el.value = "";
  } else {
    return false;
  }

  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
  return true;
}

function detectGraduationSelectPart(candidate: Candidate): "year" | "month" | "status" | "" {
  const hints = [
    candidate.meta,
    candidate.rawHint,
    candidate.el.getAttribute("name"),
    candidate.el.id,
    (candidate.el as HTMLInputElement).placeholder,
    candidate.el.getAttribute("aria-label"),
    candidate.el.getAttribute("title")
  ]
    .map((x) => toHalfWidth(String(x || "")))
    .join(" ");

  const hasYear = /(年|year)/i.test(hints);
  const hasMonth = /(月|month)/i.test(hints);
  if (hasYear && !hasMonth) return "year";
  if (hasMonth && !hasYear) return "month";

  if (candidate.el.tagName === "SELECT") {
    const optionText = Array.from((candidate.el as HTMLSelectElement).options)
      .map((option) => toHalfWidth(option.textContent || option.label || ""))
      .join(" ");
    if (/(卒業|修了|見込|status)/i.test(optionText) && !hasYear && !hasMonth) return "status";
  }

  if (/(卒業|修了|見込|status)/i.test(hints) && !hasYear && !hasMonth) return "status";
  return "";
}

function isCustomCombobox(el: HTMLElement): boolean {
  if (el.getAttribute("role") !== "combobox") return false;
  const tag = el.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return false;
  return true;
}

function isSelectPlaceholder(el: HTMLElement): boolean {
  if (!(el instanceof HTMLSelectElement)) return false;
  const selectedIndex = el.selectedIndex;
  const selected = selectedIndex >= 0 ? el.options[selectedIndex] : null;
  const value = normalize(toHalfWidth(el.value || ""));
  const text = normalize(toHalfWidth(selected?.textContent || ""));
  const rawValue = toHalfWidth(el.value || "").trim();
  const rawText = toHalfWidth(selected?.textContent || "").trim();

  if (!value && !text) return true;
  if (selected?.disabled && !value) return true;
  if (selectedIndex === 0 && !value) return true;

  const placeholderTokens = [
    "-",
    "--",
    "---",
    "0",
    "選択",
    "選択してください",
    "未選択",
    "未設定",
    "choose",
    "select"
  ];

  if (placeholderTokens.some((token) => value === token || text === token)) return true;

  if (
    /選択|choose|select|未選択|未設定/.test(rawValue) ||
    /選択|choose|select|未選択|未設定/.test(rawText)
  ) {
    return true;
  }

  if (/^[\-ー－−▼▽]+$/.test(rawValue || rawText)) return true;

  // Some DOB dropdowns keep placeholder-like labels such as "月" or "日".
  if (selectedIndex === 0 && /^(年|月|日)$/.test(rawValue || rawText)) return true;

  return false;
}

function hasExistingValue(el: HTMLElement): boolean {
  if (el.tagName === "SELECT") return !isSelectPlaceholder(el);
  if (el instanceof HTMLInputElement) {
    const type = String(el.type || "").toLowerCase();
    if (type === "radio" || type === "checkbox") return el.checked;
    return el.value.trim() !== "";
  }
  if (el instanceof HTMLTextAreaElement) return el.value.trim() !== "";
  const text = normalize(el.textContent);
  return text !== "";
}

function setFieldValue(
  el: HTMLElement,
  field: string,
  value: string | null | undefined,
  options: { overwrite?: boolean } = {}
): boolean {
  const { overwrite = true } = options;
  if (value == null || value === "") return false;
  if (!overwrite && hasExistingValue(el)) return false;

  if (el.tagName === "SELECT") {
    const selectEl = el as HTMLSelectElement;
    const option = chooseMatchingOption(
      Array.from(selectEl.options) as (HTMLOptionElement & OptionLike)[],
      expandCandidateValues(field, value)
    );
    if (!option) return false;
    selectEl.value = option.value!;
    const optionIndex = Array.from(selectEl.options).indexOf(option as HTMLOptionElement);
    if (optionIndex >= 0) selectEl.selectedIndex = optionIndex;
    if (option instanceof HTMLOptionElement) {
      option.selected = true;
      option.scrollIntoView({ block: "nearest" });
    }
    clickLikeUser(selectEl);

    if (isJqTransformHiddenSelect(el)) {
      const wrapper = getJqTransformWrapper(el);
      const label = wrapper?.querySelector("div > span, span");
      if (label) label.textContent = (option.textContent || (option as HTMLOptionElement).label || "").trim();
    }
  } else if (isCustomCombobox(el)) {
    return selectFromCustomCombobox(el, field, value);
  } else if ((el as HTMLInputElement).type === "radio") {
    return setRadioValue(el as HTMLInputElement, field, value, { overwrite });
  } else if ((el as HTMLInputElement).type === "checkbox") {
    const input = el as HTMLInputElement;
    const shouldCheck = isYesValue(value);
    if (!overwrite && input.checked === shouldCheck) return false;
    if (input.checked === shouldCheck) return true;
    if (isJqTransformHiddenChoice(input)) {
      const proxy = input.parentElement?.querySelector("a.jqTransformRadio, a.jqTransformCheckbox");
      if (proxy instanceof HTMLElement) clickLikeUser(proxy);
    }
    clickLikeUser(input);
    input.checked = shouldCheck;
  } else {
    el.focus();
    (el as HTMLInputElement).value = String(value);
  }

  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
  return true;
}

function isFillable(el: Element): el is HTMLElement {
  if (!(el instanceof HTMLElement)) return false;
  const allowHiddenSpecialSelect = el.tagName === "SELECT" && isJqTransformHiddenSelect(el);
  const allowHiddenSpecialChoice = isJqTransformHiddenChoice(el);
  if (!allowHiddenSpecialSelect && !allowHiddenSpecialChoice && !isVisible(el)) return false;
  if (el.matches("[disabled], [readonly], [type='hidden']")) return false;
  if (el.getAttribute("aria-hidden") === "true") return false;
  return el.matches("input, textarea, select, [role='combobox']");
}

function buildLineGroups(candidates: Candidate[], tolerance: number = 24): PositionedCandidate[][] {
  const positioned: PositionedCandidate[] = candidates
    .map((candidate) => {
      const target = candidate.layoutEl || candidate.el;
      return { candidate, rect: target.getBoundingClientRect() };
    })
    .sort((a, b) => a.rect.top - b.rect.top || a.rect.left - b.rect.left);

  const rows: { top: number; items: PositionedCandidate[] }[] = [];
  for (const item of positioned) {
    const last = rows[rows.length - 1];
    if (!last || Math.abs(item.rect.top - last.top) > tolerance) {
      rows.push({ top: item.rect.top, items: [item] });
      continue;
    }
    last.items.push(item);
  }

  return rows.map((row) => row.items.sort((a, b) => a.rect.left - b.rect.left));
}

function findCommonAncestor(a: HTMLElement, b: HTMLElement): HTMLElement | null {
  const ancestors = new Set<HTMLElement>();
  let node: HTMLElement | null = a;
  while (node) {
    ancestors.add(node);
    node = node.parentElement;
  }

  node = b;
  while (node) {
    if (ancestors.has(node)) return node;
    node = node.parentElement;
  }

  return null;
}

function detectRowContactSubtype(row: PositionedCandidate[] | null, field: string): string {
  if (!row?.length) return field === "email" ? "email_unknown" : "phone_unknown";
  const left = row[0]?.candidate?.el || null;
  const right = row[row.length - 1]?.candidate?.el || null;
  const common = left && right ? findCommonAncestor(left, right) : null;
  const rowText = row
    .map((item) => `${item.candidate.meta || ""} ${item.candidate.rawHint || ""}`)
    .join(" ");
  return detectContactSubtype(field, `${rowText} ${common?.textContent || ""}`);
}

function isLikelySplitEmailPair(left: PositionedCandidate, right: PositionedCandidate): boolean {
  const gap = right.rect.left - left.rect.right;
  if (gap < -10 || gap > 240) return false;

  const hintMeta = `${left.candidate.meta} ${right.candidate.meta}`.toLowerCase();
  if (/(local|domain|前半|後半|ドメイン|ユーザー|アカウント)/.test(hintMeta)) return true;

  const common = findCommonAncestor(left.candidate.el, right.candidate.el);
  const rawText = common?.textContent || "";
  if (/@/.test(rawText)) return true;

  const leftMax = Number((left.candidate.el as HTMLInputElement).maxLength);
  const rightMax = Number((right.candidate.el as HTMLInputElement).maxLength);
  return (
    (Number.isFinite(leftMax) && leftMax > 0 && leftMax <= 80) ||
    (Number.isFinite(rightMax) && rightMax > 0 && rightMax <= 255)
  );
}

function fillSplitEmailFields(
  candidates: Candidate[],
  profile: Profile,
  overwrite: boolean,
  handledElements: Set<HTMLElement>
): void {
  const emailCandidates = candidates.filter((x) => x.field === "email" && !handledElements.has(x.el));
  const rows = buildLineGroups(emailCandidates);

  for (const row of rows) {
    if (row.length < 2) continue;
    const subtype = detectRowContactSubtype(row, "email");
    const rowEmail = resolveEmailValueForSubtype(subtype, profile);
    const [localPart, domainPart] = splitEmailAddress(rowEmail);
    if (!localPart || !domainPart) continue;

    for (let i = 0; i < row.length - 1; i += 1) {
      const left = row[i];
      const right = row[i + 1];
      if (handledElements.has(left.candidate.el) || handledElements.has(right.candidate.el)) continue;
      if (!isLikelySplitEmailPair(left, right)) continue;

      const filledLeft = setFieldValue(left.candidate.el, "email", localPart, { overwrite });
      const filledRight = setFieldValue(right.candidate.el, "email", domainPart, { overwrite });
      if (filledLeft || filledRight) {
        handledElements.add(left.candidate.el);
        handledElements.add(right.candidate.el);
        i += 1;
      }
    }
  }
}

function fillSplitPhoneFields(
  candidates: Candidate[],
  profile: Profile,
  overwrite: boolean,
  handledElements: Set<HTMLElement>
): void {
  const primaryPhone = cleanProfileValue(profile.phone);
  const mobilePhone = cleanProfileValue(profile.mobilePhone);
  const targets: Array<{
    field: "phone" | "vacationPhone";
    sourceValue: string;
  }> = [];

  if (primaryPhone || mobilePhone) {
    targets.push({ field: "phone", sourceValue: primaryPhone || mobilePhone });
  }

  if (!shouldUseVacationSameAsCurrent(profile)) {
    targets.push({ field: "vacationPhone", sourceValue: cleanProfileValue(profile.vacationPhone) });
  }

  for (const target of targets) {
    const phoneCandidates = candidates.filter((x) => x.field === target.field && !handledElements.has(x.el));
    const rows = buildLineGroups(phoneCandidates);
    const rowSubtypes = rows.map((row) =>
      target.field === "phone" ? detectRowContactSubtype(row, "phone") : "phone_unknown"
    );

    const rowInfos = rows
      .map((row, rowIndex) => {
        if (row.length < 2) return null;

        const items = row.filter((x) => x.candidate.el.tagName !== "SELECT");
        if (items.length < 2) return null;

        const fields = items.map((x) => x.candidate.el);
        const explicitLengths = fields.map((el) => getExplicitSegmentLength(el));
        const common = findCommonAncestor(fields[0], fields[fields.length - 1]);
        const rowHint = common?.textContent || "";
        const hasSplitHint =
          fields.length >= 3 ||
          explicitLengths.some((len) => len > 0) ||
          /[-－ー]/.test(rowHint) ||
          /(市外局番|下4桁|上4桁|前半|後半|3桁|4桁|電話番号1|電話番号2|電話番号3)/.test(rowHint);
        if (!hasSplitHint) return null;

        return {
          rowIndex,
          fields,
          explicitLengths,
          subtype: rowSubtypes[rowIndex] || "phone_unknown"
        };
      })
      .filter((row): row is NonNullable<typeof row> => Boolean(row));

    if (!rowInfos.length) continue;

    let primaryRowIndex = -1;
    let mobileRowIndex = -1;

    if (target.field === "phone") {
      primaryRowIndex = primaryPhone
        ? rowInfos.find((row) => row.subtype === "phone_landline")?.rowIndex ??
          rowInfos.find((row) => row.subtype === "phone_unknown")?.rowIndex ??
          rowInfos[0]?.rowIndex ??
          -1
        : rowInfos.find((row) => row.subtype === "phone_mobile")?.rowIndex ??
          rowInfos.find((row) => row.subtype === "phone_unknown")?.rowIndex ??
          rowInfos[0]?.rowIndex ??
          -1;

      if (primaryPhone && mobilePhone) {
        mobileRowIndex =
          rowInfos.find((row) => row.subtype === "phone_mobile" && row.rowIndex !== primaryRowIndex)?.rowIndex ??
          rowInfos.find((row) => row.subtype === "phone_unknown" && row.rowIndex !== primaryRowIndex)?.rowIndex ??
          rowInfos.find((row) => row.rowIndex !== primaryRowIndex)?.rowIndex ??
          -1;
      }
    }

    for (const rowInfo of rowInfos) {
      const { rowIndex, fields, explicitLengths, subtype } = rowInfo;
      if (target.field === "phone") {
        fields.forEach((el) => handledElements.add(el));
      }

      let rowPhone = target.field === "phone" ? "" : cleanProfileValue(target.sourceValue);

      if (target.field === "phone") {
        if (rowIndex === primaryRowIndex) {
          rowPhone = primaryPhone || mobilePhone;
        } else if (mobilePhone && rowIndex === mobileRowIndex) {
          rowPhone = mobilePhone;
        } else if (subtype === "phone_mobile" && !mobilePhone) {
          rowPhone = "";
        }
      }

      if (!rowPhone) continue;

      const segments = splitPhoneDigits(rowPhone, fields.length, explicitLengths);

      let changed = false;
      for (let i = 0; i < fields.length; i += 1) {
        if (!segments[i]) continue;
        if (setFieldValue(fields[i], target.field, segments[i], { overwrite })) changed = true;
      }

      if (changed) {
        fields.forEach((el) => handledElements.add(el));
      }
    }
  }
}

function fillSplitPostalFields(
  candidates: Candidate[],
  profile: Profile,
  overwrite: boolean,
  handledElements: Set<HTMLElement>
): void {
  const targets: Array<{ field: "postalCode" | "vacationPostalCode"; sourceValue: string }> = [];
  if (cleanProfileValue(profile.postalCode)) {
    targets.push({ field: "postalCode", sourceValue: cleanProfileValue(profile.postalCode) });
  }
  if (!shouldUseVacationSameAsCurrent(profile) && cleanProfileValue(profile.vacationPostalCode)) {
    targets.push({
      field: "vacationPostalCode",
      sourceValue: cleanProfileValue(profile.vacationPostalCode)
    });
  }

  for (const target of targets) {
    const postalCandidates = candidates.filter((x) => x.field === target.field && !handledElements.has(x.el));
    const rows = buildLineGroups(postalCandidates);

    for (const row of rows) {
      if (row.length < 2) continue;
      const [a, b] = splitPostalDigits(target.sourceValue);
      if (!a || !b) continue;

      const first = row[0].candidate.el;
      const second = row[1].candidate.el;
      const firstLen = getExplicitSegmentLength(first);
      const secondLen = getExplicitSegmentLength(second);
      const common = findCommonAncestor(first, second);
      const rowHint = common?.textContent || "";
      const hasSplitHint =
        (firstLen === 3 && secondLen === 4) || /[-－ー]/.test(rowHint) || /(前半|後半|3桁|4桁)/.test(rowHint);
      if (!hasSplitHint) continue;

      const changedA = setFieldValue(first, target.field, a, { overwrite });
      const changedB = setFieldValue(second, target.field, b, { overwrite });
      if (changedA || changedB) {
        handledElements.add(first);
        handledElements.add(second);
      }
    }
  }
}

function fillSplitBirthDateFields(
  candidates: Candidate[],
  profile: Profile,
  overwrite: boolean,
  handledElements: Set<HTMLElement>
): void {
  const parsed = parseBirthDate(profile.birthDate);
  if (!parsed) return;

  const birthCandidates = candidates.filter((x) => x.field === "birthDate" && !handledElements.has(x.el));
  const rows = buildLineGroups(birthCandidates);

  for (const row of rows) {
    if (row.length < 2) continue;

    const rowCandidates = row.map((x) => x.candidate);
    const byPart: Record<string, Candidate[]> = { year: [], month: [], day: [] };
    const unknown: Candidate[] = [];

    for (const candidate of rowCandidates) {
      const hint = detectBirthPartHint(candidate);
      if (hint) {
        byPart[hint].push(candidate);
      } else {
        unknown.push(candidate);
      }
    }

    if (!byPart.year.length && !byPart.month.length && !byPart.day.length && rowCandidates.length < 3) {
      continue;
    }

    let changed = false;
    for (const part of ["year", "month", "day"]) {
      for (const candidate of byPart[part]) {
        const values = birthPartValues(part, parsed);
        const ok = values.some((value) => value && setFieldValue(candidate.el, "birthDate", value, { overwrite }));
        if (ok) {
          handledElements.add(candidate.el);
          changed = true;
        }
      }
    }

    const partOrder = ["year", "month", "day"];
    const missingParts = partOrder.filter((part) => byPart[part].length === 0);
    for (let i = 0; i < unknown.length && i < missingParts.length; i += 1) {
      const part = missingParts[i];
      const values = birthPartValues(part, parsed);
      const ok = values.some((value) => value && setFieldValue(unknown[i].el, "birthDate", value, { overwrite }));
      if (ok) {
        handledElements.add(unknown[i].el);
        changed = true;
      }
    }

    if (changed) {
      for (const candidate of rowCandidates) {
        if (hasExistingValue(candidate.el)) handledElements.add(candidate.el);
      }
    }
  }
}

function collectBirthCandidates(): Candidate[] {
  const elements = Array.from(
    document.querySelectorAll("input, select, [role='combobox']")
  ).filter(isFillable);
  return elements
    .map((el) => {
      const meta = getTextMeta(el);
      const rawHint = getRawHintText(el);
      const field = matchNonNameField(meta, ((el as HTMLInputElement).type || "").toLowerCase(), el, rawHint);
      return {
        el,
        layoutEl: getLayoutElement(el),
        meta,
        rawHint,
        field,
        contactSubtype: null,
        kanaTarget: null,
        namePart: null,
        scriptHint: null,
        combineCityForAddressLine1: false
      };
    })
    .filter((candidate) => candidate.field === "birthDate");
}

function collectCandidatesByFields(fields: Set<string>): Candidate[] {
  const elements = Array.from(
    document.querySelectorAll("input, textarea, select, [role='combobox']")
  ).filter(isFillable);
  return elements
    .map((el) => {
      const meta = getTextMeta(el);
      const rawHint = getRawHintText(el);
      const field = matchNonNameField(meta, ((el as HTMLInputElement).type || "").toLowerCase(), el, rawHint);
      return {
        el,
        layoutEl: getLayoutElement(el),
        meta,
        rawHint,
        field,
        contactSubtype: null,
        kanaTarget: null,
        namePart: null,
        scriptHint: null,
        combineCityForAddressLine1: false
      };
    })
    .filter((candidate) => Boolean(candidate.field && fields.has(candidate.field)));
}

function fillCandidatesForField(
  candidates: Candidate[],
  field: string,
  profile: Profile,
  overwrite: boolean,
  handledElements: Set<HTMLElement>
): void {
  for (const candidate of candidates) {
    if (candidate.field !== field) continue;
    if (handledElements.has(candidate.el)) continue;
    const value = resolveAutofillValue(candidate, profile);
    if (setFieldValue(candidate.el, field, value, { overwrite })) {
      handledElements.add(candidate.el);
    }
  }
}

function clearVacationSectionFields(
  container: HTMLElement,
  toggle: HTMLElement,
  handledElements: Set<HTMLElement>
): void {
  const scoped = Array.from(container.querySelectorAll("input, textarea, select, [role='combobox']")).filter(
    (el): el is HTMLElement => el instanceof HTMLElement && isFillable(el)
  );

  for (const el of scoped) {
    if (el === toggle) continue;
    const meta = getTextMeta(el);
    const rawHint = getRawHintText(el);
    if (!hasVacationContext(el, meta, rawHint)) continue;
    const vacationField = matchVacationField(
      `${normalize(meta)} ${normalize(toHalfWidth(rawHint))} ${normalize(toHalfWidth(el.getAttribute("name") || ""))} ${normalize(
        toHalfWidth(el.id || "")
      )}`,
      ((el as HTMLInputElement).type || "").toLowerCase()
    );
    if (!vacationField || vacationField === "vacationAddressSameAsCurrent") continue;
    clearFieldValue(el);
    handledElements.add(el);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function retrySplitBirthDateFields(
  profile: Profile,
  overwrite: boolean,
  handledElements: Set<HTMLElement>
): Promise<void> {
  const parsed = parseBirthDate(profile.birthDate);
  if (!parsed) return;

  const retryDelaysMs = [150, 300, 450];
  for (const delayMs of retryDelaysMs) {
    await sleep(delayMs);
    const birthCandidates = collectBirthCandidates();
    if (!birthCandidates.length) continue;
    fillSplitBirthDateFields(birthCandidates, profile, overwrite, handledElements);
  }
}

async function retryUniversitySelectionFlow(
  profile: Profile,
  overwrite: boolean,
  handledElements: Set<HTMLElement>
): Promise<void> {
  const hasEducationData = Boolean(
    cleanProfileValue(profile.educationType) ||
      cleanProfileValue(profile.universityKanaInitial) ||
      cleanProfileValue(profile.university) ||
      cleanProfileValue(profile.faculty) ||
      cleanProfileValue(profile.department) ||
      cleanProfileValue(profile.humanitiesScienceType)
  );
  if (!hasEducationData) return;

  const fieldOrder = [
    "educationType",
    "universityKanaInitial",
    "university",
    "faculty",
    "department",
    "humanitiesScienceType"
  ];
  const trackedFields = new Set(fieldOrder);
  const retryDelaysMs = [160, 320, 520, 800];

  for (const delayMs of retryDelaysMs) {
    await sleep(delayMs);
    const candidates = collectCandidatesByFields(trackedFields);
    if (!candidates.length) continue;

    for (const field of fieldOrder) {
      fillCandidatesForField(candidates, field, profile, overwrite, handledElements);
    }
    fillUniversityChoiceGroups(profile, overwrite, handledElements);
  }
}

function fillVacationSameAsCurrentFallback(
  profile: Profile,
  overwrite: boolean,
  handledElements: Set<HTMLElement>
): void {
  if (!shouldUseVacationSameAsCurrent(profile)) return;

  const toggles = Array.from(document.querySelectorAll<HTMLInputElement>("input[type='checkbox'], input[type='radio']"))
    .filter((el) => !el.disabled && (isVisible(el) || isJqTransformHiddenChoice(el)))
    .filter((el) => {
      const label = normalize(toHalfWidth(getInputLabelText(el)));
      return /現住所.*同じ|same.*current|same.*address|休暇中住所.*同じ/.test(label);
    });

  for (const toggle of toggles) {
    if (handledElements.has(toggle)) continue;
    if (setFieldValue(toggle, "vacationAddressSameAsCurrent", "yes", { overwrite })) {
      handledElements.add(toggle);
    }

    const container =
      toggle.closest("table") ||
      toggle.closest("tbody") ||
      toggle.closest("fieldset") ||
      toggle.closest("section");
    if (!(container instanceof HTMLElement)) continue;
    clearVacationSectionFields(container, toggle, handledElements);
  }
}

function fillGroupedGraduationFields(
  candidates: Candidate[],
  profile: Profile,
  overwrite: boolean,
  handledElements: Set<HTMLElement>
): void {
  const parsed = parseYearMonth(profile.graduationYear);
  if (!parsed) return;

  const graduationCandidates = candidates.filter((x) => {
    if (handledElements.has(x.el)) return false;
    if (x.field === "graduationYear") return true;
    if (!(x.el.tagName === "SELECT" || isCustomCombobox(x.el))) return false;
    const rowText = toHalfWidth(String(x.el.closest("tr")?.textContent || x.meta || ""));
    return /(卒業年月|graduation.?month|year.?month)/i.test(rowText) && !/(高等学校|高校)/i.test(rowText);
  });
  const rows = buildLineGroups(graduationCandidates);

  for (const row of rows) {
    if (row.length < 2) continue;

    const rowCandidates = row.map((item) => item.candidate);
    const rowText = rowCandidates.map((candidate) => `${candidate.meta || ""} ${candidate.rawHint || ""}`).join(" ");
    if (!/(卒業|修了|graduation|completion|year|month|年月)/i.test(toHalfWidth(rowText))) continue;

    const byPart: Record<"year" | "month" | "status", Candidate[]> = { year: [], month: [], status: [] };
    const unknown: Candidate[] = [];

    for (const candidate of rowCandidates) {
      const part = detectGraduationSelectPart(candidate);
      if (part) {
        byPart[part].push(candidate);
      } else {
        unknown.push(candidate);
      }
    }

    const canAssumeGrouped = rowCandidates.length >= 3 || byPart.year.length > 0 || byPart.month.length > 0 || byPart.status.length > 0;
    if (!canAssumeGrouped) continue;

    const unknownQueue = [...unknown];
    if (!byPart.year.length && unknownQueue.length) byPart.year.push(unknownQueue.shift()!);
    if (!byPart.month.length && unknownQueue.length) byPart.month.push(unknownQueue.shift()!);
    if (!byPart.status.length && unknownQueue.length) byPart.status.push(unknownQueue.shift()!);

    let changed = false;

    for (const candidate of byPart.year) {
      if (setFieldValue(candidate.el, "graduationYear", parsed.year, { overwrite })) {
        handledElements.add(candidate.el);
        changed = true;
      }
    }

    for (const candidate of byPart.month) {
      const ok = [parsed.month, parsed.monthRaw].some((value) =>
        value ? setFieldValue(candidate.el, "graduationYear", value, { overwrite }) : false
      );
      if (ok) {
        handledElements.add(candidate.el);
        changed = true;
      }
    }

    for (const candidate of byPart.status) {
      const ok =
        selectElementByCandidates(
          candidate.el,
          ["卒業（修了）", "卒業(修了)", "卒業", "修了", "卒業見込", "修了見込", "卒業予定", "修了予定"],
          { overwrite }
        ) || setFieldValue(candidate.el, "graduationYear", "卒業", { overwrite });
      if (ok) {
        handledElements.add(candidate.el);
        changed = true;
      }
    }

    if (changed) {
      for (const candidate of rowCandidates) {
        if (hasExistingValue(candidate.el)) handledElements.add(candidate.el);
      }
    }
  }
}

function fillGroupedFields(
  candidates: Candidate[],
  profile: Profile,
  overwrite: boolean,
  handledElements: Set<HTMLElement>
): void {
  fillVacationSameAsCurrentFallback(profile, overwrite, handledElements);
  fillSplitBirthDateFields(candidates, profile, overwrite, handledElements);
  fillSplitEmailFields(candidates, profile, overwrite, handledElements);
  fillSplitPostalFields(candidates, profile, overwrite, handledElements);
  fillSplitPhoneFields(candidates, profile, overwrite, handledElements);
  fillGroupedGraduationFields(candidates, profile, overwrite, handledElements);
  fillUniversityChoiceGroups(profile, overwrite, handledElements);
}

async function getSettings(): Promise<Settings> {
  const stored = await storageArea.get([STORAGE_KEY]);
  return (stored[STORAGE_KEY] as Settings) || { enabled: true, profile: {} };
}

function currentDomainKey(): string {
  return String(location.hostname || "").toLowerCase();
}

function isCygnetManagedPage(): boolean {
  return WEB_BRIDGE_ORIGINS.has(window.location.origin);
}

async function getOverlayDomainStateMap(): Promise<Record<string, OverlayDomainState>> {
  const stored = await storageArea.get([OVERLAY_DOMAIN_STATE_KEY]);
  return (stored[OVERLAY_DOMAIN_STATE_KEY] as Record<string, OverlayDomainState>) || {};
}

async function getOverlayStateForCurrentDomain(): Promise<OverlayDomainState> {
  const map = await getOverlayDomainStateMap();
  return map[currentDomainKey()] || { visible: false };
}

async function updateOverlayStateForCurrentDomain(patch: Partial<OverlayDomainState>): Promise<void> {
  const domain = currentDomainKey();
  if (!domain) return;
  const map = await getOverlayDomainStateMap();
  const current = map[domain] || {};
  map[domain] = { ...current, ...patch };
  await storageArea.set({ [OVERLAY_DOMAIN_STATE_KEY]: map });
}

function joinNonEmpty(parts: (string | undefined | null)[], separator: string = " "): string {
  return parts
    .map((x) => String(x || "").trim())
    .filter(Boolean)
    .join(separator);
}

function mapOptionValue(rawValue: string | undefined, labels?: Record<string, string>): string {
  const value = cleanProfileValue(rawValue);
  if (!value) return "";
  return labels?.[value] || value;
}

function mapMultiOptionValue(rawValue: string | undefined, labels?: Record<string, string>): string {
  const values = cleanProfileValue(rawValue)
    .split("|")
    .map((x) => x.trim())
    .filter(Boolean);
  if (!values.length) return "";
  return values.map((value) => labels?.[value] || value).join(" / ");
}

function resolveAdditionalSectionValue(profile: Profile, field: AdditionalSectionField): string {
  const rawValue = cleanProfileValue(profile[field.key]);
  if (!rawValue) return "";
  if (field.multi) return mapMultiOptionValue(rawValue, field.labels);
  return mapOptionValue(rawValue, field.labels);
}

function buildMainProfileSections(profile: Profile = {}): ProfileSection[] {
  return [
    {
      title: "基本情報",
      items: [
        { label: "氏名(漢字)", value: joinNonEmpty([profile.lastNameKanji, profile.firstNameKanji]) },
        { label: "氏名(フリガナ)", value: joinNonEmpty([profile.lastNameKana, profile.firstNameKana]) },
        { label: "氏名(English)", value: joinNonEmpty([profile.lastNameEnglish, profile.firstNameEnglish]) },
        { label: "希望名", value: profile.preferredName },
        { label: "メール(PC)", value: profile.email },
        { label: "メール(携帯)", value: profile.mobileEmail },
        { label: "電話番号", value: profile.phone },
        { label: "携帯電話番号", value: profile.mobilePhone },
        { label: "生年月日", value: profile.birthDate },
        { label: "性別", value: profile.gender }
      ]
    },
    {
      title: "住所",
      items: [
        { label: "郵便番号", value: formatPostalForSingleField(profile.postalCode) || profile.postalCode },
        { label: "都道府県", value: profile.prefecture },
        { label: "市区町村", value: profile.city },
        { label: "住所", value: profile.addressLine1 },
        { label: "建物名・部屋番号", value: profile.addressLine2 }
      ]
    },
    {
      title: "学歴",
      items: [
        {
          label: "学校の種類",
          value: (profile.educationType && EDUCATION_TYPE_LABELS[profile.educationType]) || profile.educationType
        },
        { label: "学校名", value: profile.university },
        { label: "学校名頭文字", value: profile.universityKanaInitial },
        { label: "学校所在地", value: profile.universityPrefecture },
        { label: "学部", value: profile.faculty },
        { label: "学科", value: profile.department },
        {
          label: "文理区分",
          value:
            (profile.humanitiesScienceType && HUMANITIES_SCIENCE_TYPE_LABELS[profile.humanitiesScienceType]) ||
            profile.humanitiesScienceType
        },
        { label: "卒業年月", value: profile.graduationYear }
      ]
    },
    {
      title: "職歴・リンク",
      items: [
        { label: "勤務先", value: profile.company },
        { label: "LinkedIn", value: profile.linkedIn },
        { label: "GitHub", value: profile.github },
        { label: "Portfolio", value: profile.portfolio }
      ]
    }
  ];
}

function buildAdditionalProfileSections(profile: Profile = {}): ProfileSection[] {
  return ADDITIONAL_PROFILE_SECTIONS.map((section) => ({
    title: section.title,
    items: section.fields.map((field) => ({
      label: field.label,
      value: resolveAdditionalSectionValue(profile, field)
    }))
  }));
}

function buildProfileSections(profile: Profile = {}, tab: OverlayProfileTab = "main"): ProfileSection[] {
  if (tab === "additional") return buildAdditionalProfileSections(profile);
  return buildMainProfileSections(profile);
}

async function copyTextToClipboard(text: string | null | undefined): Promise<boolean> {
  const payload = String(text || "");
  if (!payload) return false;

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(payload);
      return true;
    }
  } catch (_err) {
    // Fallback below.
  }

  const ta = document.createElement("textarea");
  ta.value = payload;
  ta.setAttribute("readonly", "");
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  ta.style.pointerEvents = "none";
  document.body.appendChild(ta);
  ta.select();
  const ok = document.execCommand("copy");
  document.body.removeChild(ta);
  return ok;
}

function flashCopiedElement(el: HTMLElement): void {
  if (!(el instanceof HTMLElement)) return;
  el.classList.add("is-copied");
  const prevTimer = copiedTimerIds.get(el);
  if (prevTimer !== undefined) window.clearTimeout(prevTimer);
  copiedTimerIds.set(
    el,
    window.setTimeout(() => {
      el.classList.remove("is-copied");
    }, 900)
  );
}

function setOverlayStatus(message: string): void {
  if (!overlayRefs?.status) return;
  overlayRefs.status.textContent = message;
  if (overlayRefs.statusTimer !== null) window.clearTimeout(overlayRefs.statusTimer);
  overlayRefs.statusTimer = window.setTimeout(() => {
    if (overlayRefs?.status) overlayRefs.status.textContent = "";
  }, 2200);
}

function setOverlayOpen(open: boolean): void {
  if (!overlayRefs?.root) return;
  overlayRefs.root.classList.toggle("is-open", open);
}

async function setLauncherVisible(visible: boolean, options: { persist?: boolean } = {}): Promise<void> {
  const { persist = false } = options;
  if (!overlayRefs?.root) return;
  overlayRefs.root.classList.toggle("launcher-visible", visible);
  if (!visible) {
    setOverlayOpen(false);
  }
  if (persist) {
    await updateOverlayStateForCurrentDomain({ visible });
  }
}

function clampLauncherTop(topPx: number): number {
  const minTop = 12;
  const maxTop = Math.max(minTop, window.innerHeight - 72);
  return Math.max(minTop, Math.min(maxTop, Math.round(topPx)));
}

function applyLauncherTop(): void {
  if (!overlayRefs?.launcherWrap) return;
  launcherTopPx = clampLauncherTop(launcherTopPx);
  overlayRefs.launcherWrap.style.top = `${launcherTopPx}px`;
}

function createProfileCopyCard(item: ProfileSectionItem): HTMLDivElement {
  const card = document.createElement("div");
  card.className = "mg-copy";

  const fullButton = document.createElement("button");
  fullButton.type = "button";
  fullButton.className = "mg-copy-full";

  const label = document.createElement("span");
  label.className = "mg-copy-label";
  label.textContent = item.label;

  const value = document.createElement("span");
  value.className = "mg-copy-value";
  value.textContent = item.value ? String(item.value) : "未設定";

  fullButton.append(label, value);
  card.append(fullButton);

  if (!item.value) {
    fullButton.disabled = true;
    card.classList.add("is-empty");
  } else {
    fullButton.addEventListener("click", async () => {
      const ok = await copyTextToClipboard(item.value);
      if (ok) flashCopiedElement(fullButton);
      setOverlayStatus(ok ? `${item.label} をコピーしました` : "コピーに失敗しました");
    });
  }

  return card;
}

function renderOverlayProfile(profile: Profile = {}): void {
  if (!overlayRefs?.sections) return;
  overlayRefs.sections.innerHTML = "";

  for (const section of buildProfileSections(profile, overlayActiveTab)) {
    const sectionEl = document.createElement("section");
    sectionEl.className = "mg-section";

    const title = document.createElement("h3");
    title.className = "mg-section-title";
    title.textContent = section.title;
    sectionEl.appendChild(title);

    const grid = document.createElement("div");
    grid.className = "mg-grid";
    for (const item of section.items) {
      grid.appendChild(createProfileCopyCard(item));
    }
    sectionEl.appendChild(grid);
    overlayRefs.sections.appendChild(sectionEl);
  }
}

function clearRevealedCredentialPasswords(): void {
  for (const timerId of revealedCredentialTimers.values()) {
    window.clearTimeout(timerId);
  }
  revealedCredentialTimers.clear();
  revealedCredentialPasswords.clear();
}

async function refreshCredentialData(): Promise<void> {
  credentialVaultState = await getCredentialVaultStateFromRuntime();
  credentialSummariesCache = await listCredentialSummariesFromRuntime();
}

function getCredentialDraft(id: string | "add", seed?: Partial<CredentialDraft>): CredentialDraft {
  const key = String(id);
  const current = credentialDrafts.get(key);
  if (current) return current;
  const draft: CredentialDraft = {
    label: seed?.label ?? "",
    username: seed?.username ?? "",
    password: seed?.password ?? "",
    passphrase: seed?.passphrase ?? ""
  };
  credentialDrafts.set(key, draft);
  return draft;
}

function updateCredentialDraft(
  id: string | "add",
  patch: Partial<CredentialDraft>
): CredentialDraft {
  const key = String(id);
  const next = { ...getCredentialDraft(id), ...patch };
  credentialDrafts.set(key, next);
  return next;
}

function clearCredentialDraft(id: string | "add"): void {
  credentialDrafts.delete(String(id));
}

function setRevealedCredentialPassword(id: string, password: string): void {
  revealedCredentialPasswords.set(id, password);
  const previous = revealedCredentialTimers.get(id);
  if (previous !== undefined) {
    window.clearTimeout(previous);
  }
  const timerId = window.setTimeout(() => {
    revealedCredentialPasswords.delete(id);
    revealedCredentialTimers.delete(id);
    if (overlayRefs && overlayActiveTab === "credentials") {
      renderCredentialSections();
    }
  }, CREDENTIAL_REVEAL_TTL_MS);
  revealedCredentialTimers.set(id, timerId);
}

function createCredentialCopyCard(
  labelText: string,
  value: string,
  copiedMessage: string
): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "mg-copy-full mg-cred-copy";

  const label = document.createElement("span");
  label.className = "mg-copy-label";
  label.textContent = labelText;

  const display = document.createElement("span");
  display.className = "mg-copy-value";
  display.textContent = value || "未設定";

  button.append(label, display);
  if (!value) {
    button.disabled = true;
    button.classList.add("is-empty");
    return button;
  }

  button.addEventListener("click", async () => {
    const ok = await copyTextToClipboard(value);
    if (ok) flashCopiedElement(button);
    setOverlayStatus(ok ? copiedMessage : "コピーに失敗しました");
  });
  return button;
}

async function persistCredentialDraft(
  targetId: string | "add",
  current?: CredentialSummary
): Promise<void> {
  const draft = getCredentialDraft(targetId);
  const label = sanitizeCredentialInput(draft.label);
  const username = sanitizeCredentialInput(draft.username);
  const password = sanitizeCredentialInput(draft.password);
  const passphrase = String(draft.passphrase || "");

  if (!username) {
    setOverlayStatus("ユーザー名を入力してください");
    return;
  }
  if (!current && !password) {
    setOverlayStatus("パスワードを入力してください");
    return;
  }

  const needsPassphrase = !current || Boolean(password);
  if (needsPassphrase && passphrase.length < 4) {
    credentialPromptId = targetId;
    renderCredentialSections();
    setOverlayStatus(
      credentialVaultState.hasVault
        ? "パスフレーズを入力してください"
        : "新しいパスフレーズを作成してください"
    );
    return;
  }

  try {
    await upsertCredentialEntryFromRuntime({
      id: current?.id,
      label,
      username,
      password: password || undefined,
      passphrase: needsPassphrase ? passphrase : undefined,
      pageUrl: current ? `${current.origin}${current.path}` : location.href,
      formAction: current?.formAction || "",
      formSignature: current?.formSignature || ""
    });
    credentialEditingId = null;
    credentialPromptId = null;
    clearCredentialDraft(targetId);
    await refreshCredentialData();
    renderCredentialSections();
    setOverlayStatus(current ? "ログイン情報を更新しました" : "ログイン情報を追加しました");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("invalid_passphrase")) {
      setOverlayStatus("パスフレーズが違います");
    } else if (message.includes("passphrase_too_short")) {
      setOverlayStatus("パスフレーズは4文字以上にしてください");
    } else {
      setOverlayStatus(current ? "更新に失敗しました" : "追加に失敗しました");
    }
  }
}

async function revealCredentialForRow(entry: CredentialSummary): Promise<void> {
  const draft = getCredentialDraft(entry.id, {
    label: entry.label || entry.host,
    username: entry.username,
    passphrase: ""
  });
  if (draft.passphrase.length < 4) {
    credentialPromptId = entry.id;
    renderCredentialSections();
    setOverlayStatus(
      credentialVaultState.hasVault
        ? "パスフレーズを入力してください"
        : "新しいパスフレーズを作成してください"
    );
    return;
  }

  try {
    const password = await revealCredentialPasswordFromRuntime(entry.id, draft.passphrase);
    credentialPromptId = null;
    updateCredentialDraft(entry.id, { passphrase: "" });
    setRevealedCredentialPassword(entry.id, password);
    renderCredentialSections();
    const ok = await copyTextToClipboard(password);
    setOverlayStatus(ok ? "パスワードをコピーしました" : "コピーに失敗しました");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("invalid_passphrase")) {
      setOverlayStatus("パスフレーズが違います");
    } else if (message.includes("passphrase_too_short")) {
      setOverlayStatus("パスフレーズは4文字以上にしてください");
    } else {
      setOverlayStatus("パスワードを表示できませんでした");
    }
  }
}

function renderCredentialPrompt(targetId: string | "add", mode: "reveal" | "save"): HTMLDivElement {
  const draft = getCredentialDraft(targetId);
  const wrap = document.createElement("div");
  wrap.className = "mg-cred-prompt";

  const input = document.createElement("input");
  input.className = "mg-cred-input";
  input.type = "password";
  input.placeholder = credentialVaultState.hasVault ? "Passphrase" : "Create passphrase";
  input.value = draft.passphrase;
  input.addEventListener("input", () => updateCredentialDraft(targetId, { passphrase: input.value }));

  const confirm = document.createElement("button");
  confirm.type = "button";
  confirm.className = "mg-btn secondary mg-cred-mini-btn";
  confirm.textContent =
    mode === "reveal"
      ? credentialVaultState.hasVault
        ? "Reveal"
        : "Create"
      : credentialVaultState.hasVault
        ? "Save"
        : "Create";

  const cancel = document.createElement("button");
  cancel.type = "button";
  cancel.className = "mg-btn secondary mg-cred-mini-btn";
  cancel.textContent = "Cancel";

  cancel.addEventListener("click", () => {
    credentialPromptId = null;
    updateCredentialDraft(targetId, { passphrase: "" });
    renderCredentialSections();
  });

  wrap.append(input, confirm, cancel);

  if (mode === "reveal") {
    confirm.addEventListener("click", () => {
      const summary = credentialSummariesCache.find((item) => item.id === targetId);
      if (!summary) {
        setOverlayStatus("ログイン情報が見つかりません");
        return;
      }
      revealCredentialForRow(summary).catch(() => {});
    });
  } else {
    confirm.addEventListener("click", () => {
      const summary = credentialSummariesCache.find((item) => item.id === targetId);
      persistCredentialDraft(targetId, summary).catch(() => {});
    });
  }

  return wrap;
}

function renderCredentialSummaryRow(entry: CredentialSummary): HTMLDivElement {
  const row = document.createElement("div");
  row.className = "mg-cred-item";

  if (credentialEditingId === entry.id) {
    const draft = getCredentialDraft(entry.id, {
      label: entry.label || entry.host,
      username: entry.username,
      password: "",
      passphrase: ""
    });

    const editor = document.createElement("div");
    editor.className = "mg-cred-editor";

    const companyInput = document.createElement("input");
    companyInput.className = "mg-cred-input";
    companyInput.placeholder = "Company name";
    companyInput.value = draft.label;
    companyInput.addEventListener("input", () =>
      updateCredentialDraft(entry.id, { label: companyInput.value })
    );

    const usernameInput = document.createElement("input");
    usernameInput.className = "mg-cred-input";
    usernameInput.placeholder = "Username";
    usernameInput.value = draft.username;
    usernameInput.addEventListener("input", () =>
      updateCredentialDraft(entry.id, { username: usernameInput.value })
    );

    const passwordInput = document.createElement("input");
    passwordInput.className = "mg-cred-input";
    passwordInput.type = "password";
    passwordInput.placeholder = "Leave blank to keep password";
    passwordInput.value = draft.password;
    passwordInput.addEventListener("input", () =>
      updateCredentialDraft(entry.id, { password: passwordInput.value })
    );

    const actions = document.createElement("div");
    actions.className = "mg-cred-inline-actions";
    const saveButton = document.createElement("button");
    saveButton.type = "button";
    saveButton.className = "mg-btn mg-cred-mini-btn";
    saveButton.textContent = "Save";
    const cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.className = "mg-btn secondary mg-cred-mini-btn";
    cancelButton.textContent = "Cancel";
    actions.append(saveButton, cancelButton);

    saveButton.addEventListener("click", () => {
      persistCredentialDraft(entry.id, entry).catch(() => {});
    });
    cancelButton.addEventListener("click", () => {
      credentialEditingId = null;
      credentialPromptId = null;
      clearCredentialDraft(entry.id);
      renderCredentialSections();
    });

    editor.append(companyInput, usernameInput, passwordInput, actions);
    row.appendChild(editor);
    if (credentialPromptId === entry.id) {
      row.appendChild(renderCredentialPrompt(entry.id, "save"));
    }
    return row;
  }

  const info = document.createElement("div");
  info.className = "mg-cred-info";
  info.append(
    createCredentialCopyCard("Company", entry.label || entry.host, "会社名をコピーしました"),
    createCredentialCopyCard("Username", entry.username, "ユーザー名をコピーしました")
  );

  const passwordButton = document.createElement("button");
  passwordButton.type = "button";
  passwordButton.className = "mg-cred-password";
  const visiblePassword = revealedCredentialPasswords.get(entry.id);
  passwordButton.textContent = visiblePassword || "Click to reveal";
  passwordButton.addEventListener("click", async () => {
    if (visiblePassword) {
      const ok = await copyTextToClipboard(visiblePassword);
      if (ok) flashCopiedElement(passwordButton);
      setOverlayStatus(ok ? "パスワードをコピーしました" : "コピーに失敗しました");
      return;
    }
    credentialPromptId = credentialPromptId === entry.id ? null : entry.id;
    getCredentialDraft(entry.id, { label: entry.label || entry.host, username: entry.username });
    renderCredentialSections();
  });

  const actions = document.createElement("div");
  actions.className = "mg-cred-inline-actions";
  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.className = "mg-btn secondary mg-cred-mini-btn";
  editButton.textContent = "Edit";
  editButton.addEventListener("click", () => {
    credentialEditingId = entry.id;
    credentialPromptId = null;
    getCredentialDraft(entry.id, {
      label: entry.label || entry.host,
      username: entry.username,
      password: "",
      passphrase: ""
    });
    renderCredentialSections();
  });

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "mg-btn secondary mg-cred-mini-btn";
  deleteButton.textContent = "Delete";
  deleteButton.addEventListener("click", async () => {
    try {
      await deleteCredentialEntryFromRuntime(entry.id);
      revealedCredentialPasswords.delete(entry.id);
      const revealTimer = revealedCredentialTimers.get(entry.id);
      if (revealTimer !== undefined) {
        window.clearTimeout(revealTimer);
        revealedCredentialTimers.delete(entry.id);
      }
      clearCredentialDraft(entry.id);
      credentialEditingId = credentialEditingId === entry.id ? null : credentialEditingId;
      credentialPromptId = credentialPromptId === entry.id ? null : credentialPromptId;
      credentialSummariesCache = credentialSummariesCache.filter((item) => item.id !== entry.id);
      renderCredentialSections();
      setOverlayStatus("削除しました");
    } catch {
      setOverlayStatus("削除に失敗しました");
    }
  });

  actions.append(passwordButton, editButton, deleteButton);

  row.append(info, actions);
  if (credentialPromptId === entry.id) {
    row.appendChild(renderCredentialPrompt(entry.id, "reveal"));
  }
  return row;
}

function renderCredentialComposer(): HTMLDivElement {
  const wrap = document.createElement("div");
  wrap.className = "mg-cred-composer";

  if (credentialEditingId !== "add") {
    const addButton = document.createElement("button");
    addButton.type = "button";
    addButton.className = "mg-btn secondary";
    addButton.textContent = "Add login";
    addButton.addEventListener("click", () => {
      credentialEditingId = "add";
      credentialPromptId = null;
      getCredentialDraft("add", {
        label: (() => {
          try {
            return new URL(location.href).hostname || "";
          } catch {
            return location.hostname || "";
          }
        })(),
        username: "",
        password: "",
        passphrase: ""
      });
      renderCredentialSections();
    });
    wrap.appendChild(addButton);
    return wrap;
  }

  const draft = getCredentialDraft("add");
  const editor = document.createElement("div");
  editor.className = "mg-cred-editor";

  const companyInput = document.createElement("input");
  companyInput.className = "mg-cred-input";
  companyInput.placeholder = "Company name";
  companyInput.value = draft.label;
  companyInput.addEventListener("input", () => updateCredentialDraft("add", { label: companyInput.value }));

  const usernameInput = document.createElement("input");
  usernameInput.className = "mg-cred-input";
  usernameInput.placeholder = "Username";
  usernameInput.value = draft.username;
  usernameInput.addEventListener("input", () =>
    updateCredentialDraft("add", { username: usernameInput.value })
  );

  const passwordInput = document.createElement("input");
  passwordInput.className = "mg-cred-input";
  passwordInput.type = "password";
  passwordInput.placeholder = "Password";
  passwordInput.value = draft.password;
  passwordInput.addEventListener("input", () =>
    updateCredentialDraft("add", { password: passwordInput.value })
  );

  const actions = document.createElement("div");
  actions.className = "mg-cred-inline-actions";
  const saveButton = document.createElement("button");
  saveButton.type = "button";
  saveButton.className = "mg-btn mg-cred-mini-btn";
  saveButton.textContent = "Save";
  const cancelButton = document.createElement("button");
  cancelButton.type = "button";
  cancelButton.className = "mg-btn secondary mg-cred-mini-btn";
  cancelButton.textContent = "Cancel";
  actions.append(saveButton, cancelButton);

  saveButton.addEventListener("click", () => {
    persistCredentialDraft("add").catch(() => {});
  });
  cancelButton.addEventListener("click", () => {
    credentialEditingId = null;
    credentialPromptId = null;
    clearCredentialDraft("add");
    renderCredentialSections();
  });

  editor.append(companyInput, usernameInput, passwordInput, actions);
  wrap.appendChild(editor);

  if (credentialPromptId === "add") {
    wrap.appendChild(renderCredentialPrompt("add", "save"));
  }

  return wrap;
}

function renderCredentialSections(): void {
  if (!overlayRefs?.sections) return;

  const sections = overlayRefs.sections;
  sections.innerHTML = "";

  const credentialsSection = document.createElement("section");
  credentialsSection.className = "mg-section";

  const header = document.createElement("div");
  header.className = "mg-cred-header";
  const title = document.createElement("h3");
  title.className = "mg-section-title";
  title.textContent = "Saved logins";
  const headerActions = document.createElement("div");
  headerActions.className = "mg-cred-header-actions";
  const refreshButton = document.createElement("button");
  refreshButton.className = "mg-btn secondary";
  refreshButton.type = "button";
  refreshButton.textContent = "Refresh";
  refreshButton.addEventListener("click", async () => {
    await refreshCredentialData();
    renderCredentialSections();
    setOverlayStatus("ログイン情報を更新しました");
  });
  headerActions.append(refreshButton);
  header.append(title, headerActions);
  credentialsSection.appendChild(header);

  const list = document.createElement("div");
  list.className = "mg-cred-list";

  if (!credentialSummariesCache.length) {
    const empty = document.createElement("p");
    empty.className = "mg-help-inline mg-cred-empty";
    empty.textContent = "保存済みログイン情報はありません。";
    list.appendChild(empty);
  } else {
    for (const entry of credentialSummariesCache) {
      list.appendChild(renderCredentialSummaryRow(entry));
    }
  }

  credentialsSection.append(list, renderCredentialComposer());
  sections.appendChild(credentialsSection);
}

async function renderOverlayByActiveTab(settings: Settings): Promise<void> {
  if (overlayActiveTab === "credentials") {
    await refreshCredentialData().catch(() => {});
    renderCredentialSections();
  } else {
    renderOverlayProfile(settings.profile || {});
  }
  applyOverlayAuthUi(await getAuthState(), settings);
}

function updateOverlayTabUi(): void {
  if (!overlayRefs) return;
  const isMain = overlayActiveTab === "main";
  const isAdditional = overlayActiveTab === "additional";
  const isCredentials = overlayActiveTab === "credentials";
  overlayRefs.tabMainBtn.classList.toggle("is-active", isMain);
  overlayRefs.tabAdditionalBtn.classList.toggle("is-active", isAdditional);
  overlayRefs.tabCredentialsBtn.classList.toggle("is-active", isCredentials);
  overlayRefs.tabMainBtn.setAttribute("aria-pressed", String(isMain));
  overlayRefs.tabAdditionalBtn.setAttribute("aria-pressed", String(isAdditional));
  overlayRefs.tabCredentialsBtn.setAttribute("aria-pressed", String(isCredentials));
}

function applyOverlayAuthUi(state: { authenticated: boolean; email: string }, settings: Settings): void {
  if (!overlayRefs) return;

  const { authenticated, email } = state;

  overlayRefs.authEmail.textContent = email || "";

  overlayRefs.signInBtn.classList.toggle("is-hidden", authenticated);
  overlayRefs.logoutBtn.classList.toggle("is-hidden", !authenticated);
  overlayRefs.authEmail.classList.toggle("is-hidden", !authenticated);
  overlayRefs.controlsWrap.classList.toggle("is-hidden", !authenticated);
  overlayRefs.tabsWrap.classList.toggle("is-hidden", !authenticated);
  overlayRefs.sections.classList.toggle("is-hidden", !authenticated);

  overlayRefs.enabledToggle.checked = Boolean(settings.enabled);
  overlayRefs.enabledToggle.disabled = !authenticated;
  updateOverlayTabUi();
}

function ensureInPageOverlay(): OverlayRefs | null {
  if (window !== window.top || !document.body) return null;
  if (overlayRefs) return overlayRefs;

  let host = document.getElementById(OVERLAY_HOST_ID);
  if (!host) {
    host = document.createElement("div");
    host.id = OVERLAY_HOST_ID;
    document.body.appendChild(host);
  }

  const shadow = host.shadowRoot || host.attachShadow({ mode: "open" });
  shadow.innerHTML = `
    <style>
      .mg-root { position: fixed; inset: 0; pointer-events: none; z-index: 2147483646; font-family: "Inter", "Noto Sans JP", -apple-system, BlinkMacSystemFont, "Segoe UI", "Hiragino Sans", "Yu Gothic UI", "Yu Gothic", sans-serif; }
      .mg-panel { pointer-events: auto; position: fixed; top: 14px; right: 14px; width: min(448px, calc(100vw - 32px)); height: calc(100vh - 28px); background: linear-gradient(180deg, #f7fbff 0%, #edf6ff 100%); border: 1px solid rgba(216, 233, 249, 0.82); border-radius: 22px; box-shadow: -16px 0 34px rgba(67, 126, 178, 0.2); transform: translateX(calc(100% + 18px)); transition: transform .22s ease; display: flex; flex-direction: column; overflow: hidden; }
      .mg-root.is-open .mg-panel { transform: translateX(0); }
      .mg-launcher-wrap { display: none; pointer-events: auto; position: fixed; right: 12px; width: 56px; height: 56px; }
      .mg-root.launcher-visible .mg-launcher-wrap { display: block; }
      .mg-root.is-open .mg-launcher-wrap { opacity: 0; transform: translateX(8px); pointer-events: none; transition: opacity .15s ease, transform .15s ease; }
      .mg-launcher { width: 56px; height: 56px; border: 1px solid #c8e2fa; border-radius: 14px; background: linear-gradient(120deg, #5ba8e8 0%, #3c91d8 100%); color: #fff; font-size: 30px; font-weight: 800; line-height: 1; cursor: grab; box-shadow: 0 10px 22px rgba(73, 143, 200, 0.34); display: flex; align-items: center; justify-content: center; padding: 0; }
      .mg-launcher img { width: 28px; height: 28px; object-fit: contain; pointer-events: none; user-select: none; filter: drop-shadow(0 0 6px rgba(183, 231, 255, 0.4)); }
      .mg-launcher:active { cursor: grabbing; }
      .mg-launcher-hide { position: absolute; top: -8px; left: -8px; width: 22px; height: 22px; border: none; border-radius: 999px; background: #315a7f; color: #fff; font-size: 13px; font-weight: 700; cursor: pointer; opacity: 0; transform: scale(.9); transition: opacity .12s ease, transform .12s ease; }
      .mg-launcher-wrap:hover .mg-launcher-hide { opacity: 1; transform: scale(1); }
      .mg-header { display: flex; align-items: center; justify-content: space-between; padding: 18px 18px 12px; border-bottom: 1px solid #d8e9f9; background: #ffffff; }
      .mg-title { margin: 0; font-size: 24px; font-weight: 800; color: #1c3551; letter-spacing: -0.01em; }
      .mg-header-actions { display: flex; gap: 8px; }
      .mg-icon-btn { border: 1px solid #c8e2fa; background: #edf7ff; border-radius: 8px; width: 30px; height: 30px; cursor: pointer; color: #2d6fa8; font-weight: 700; }
      .mg-body { flex: 1; overflow: auto; padding: 12px 18px 18px; display: grid; align-content: start; gap: 10px; }
      .mg-auth-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; border: 1px solid rgba(216, 233, 249, 0.78); background: rgba(255, 255, 255, 0.95); border-radius: 14px; padding: 10px 12px; box-shadow: 0 8px 20px rgba(72, 131, 182, 0.08); }
      .mg-auth-email { margin: 0; min-width: 0; font-size: 12px; color: #3f6387; line-height: 1.35; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .mg-auth-actions { display: flex; gap: 8px; flex: 0 0 auto; }
      .mg-auth-actions .mg-btn { min-height: 32px; padding: 7px 12px; border-radius: 10px; font-size: 11px; }
      .mg-controls { display: grid; gap: 8px; }
      .mg-actions { display: grid; grid-template-columns: 1fr; gap: 8px; }
      .mg-tabs { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
      .mg-tab { border: 1px solid #d8e9f9; border-radius: 999px; padding: 8px 10px; background: #ffffff; color: #315a7f; font-size: 12px; font-weight: 700; cursor: pointer; transition: all .15s ease; text-align: center; min-width: 0; }
      .mg-tab:hover { border-color: #9fcff2; color: #1c3551; }
      .mg-tab.is-active { border-color: #3c91d8; background: #3c91d8; color: #ffffff; }
      .mg-btn { flex: 1; border: 1px solid #c8e2fa; border-radius: 13px; padding: 10px 13px; cursor: pointer; font-weight: 700; color: #fff; background: linear-gradient(120deg, #5ba8e8 0%, #3c91d8 100%); box-shadow: 0 8px 16px rgba(73, 143, 200, 0.24); font-size: 12px; min-height: 40px; }
      .mg-btn.secondary { background: #edf7ff; color: #2d6fa8; border: 1px solid #c8e2fa; box-shadow: none; }
      .mg-toggle { display: flex; align-items: center; justify-content: space-between; border: 1px solid #d8e9f9; background: #ffffff; border-radius: 13px; padding: 8px 12px; font-size: 12px; color: #1c3551; font-weight: 700; min-height: 40px; }
      .mg-toggle input { width: 16px; height: 16px; accent-color: #3c91d8; }
      .mg-status { min-height: 1.25em; margin: 0; color: #3f6387; font-size: 12px; font-weight: 700; }
      .mg-sections { display: grid; gap: 12px; }
      .mg-help-inline { margin: 0 0 10px; color: #5d7896; font-size: 12px; line-height: 1.5; }
      .mg-cred-header { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 10px; }
      .mg-cred-header .mg-section-title { margin: 0; }
      .mg-cred-header-actions { display: flex; gap: 8px; }
      .mg-cred-list { display: grid; gap: 10px; }
      .mg-cred-item { border: 1px solid #d8e9f9; border-radius: 14px; background: #fbfdff; padding: 10px; display: grid; gap: 8px; }
      .mg-cred-info { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 8px; }
      .mg-cred-copy { border: 1px solid #d8e9f9; border-radius: 12px; background: #f8fcff; padding: 9px 10px; min-width: 0; min-height: 72px; height: 100%; display: grid; align-content: start; }
      .mg-cred-copy.is-empty { opacity: 0.7; }
      .mg-cred-copy .mg-copy-value { display: block; width: auto; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .mg-cred-inline-actions { display: flex; align-items: stretch; justify-content: flex-end; gap: 6px; flex-wrap: wrap; }
      .mg-cred-password { flex: 1 1 120px; text-align: left; border: 1px solid #c8e2fa; border-radius: 12px; background: #edf7ff; color: #2d6fa8; min-height: 36px; padding: 8px 12px; font-size: 12px; font-weight: 700; cursor: pointer; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .mg-cred-password.is-copied { background: #dcefff; }
      .mg-cred-mini-btn { min-width: 62px !important; min-height: 34px; padding: 8px 10px; font-size: 11px; border-radius: 10px; box-shadow: none; flex: 0 0 auto; }
      .mg-cred-empty { margin: 0; padding: 12px 10px; }
      .mg-cred-composer { margin-top: 12px; }
      .mg-cred-editor { display: grid; gap: 8px; }
      .mg-cred-prompt { display: grid; grid-template-columns: minmax(0, 1fr) auto auto; gap: 8px; align-items: center; }
      .mg-cred-input { width: 100%; border: 1px solid #d8e9f9; border-radius: 10px; padding: 10px; font-size: 12px; color: #1c3551; background: #f8fcff; }
      .mg-cred-input:focus { outline: none; border-color: #76b8ea; box-shadow: 0 0 0 2px rgba(118, 184, 234, 0.16); background: #ffffff; }
      .mg-section { background: #ffffff; border: 1px solid rgba(216, 233, 249, 0.78); border-radius: 14px; padding: 10px; box-shadow: 0 8px 20px rgba(72, 131, 182, 0.08); }
      .mg-section-title { margin: 2px 2px 8px; font-size: 14px; color: #1c3551; font-weight: 700; }
      .mg-grid { display: grid; gap: 8px; }
      .mg-copy { text-align: left; border: 1px solid #d8e9f9; border-radius: 12px; background: #ffffff; padding: 10px 12px; display: grid; gap: 4px; min-height: 64px; }
      .mg-copy:hover { border-color: #d8e9f9; background: #f8fcff; }
      .mg-copy.is-empty { opacity: 0.7; background: #f2f8ff; }
      .mg-copy-full { text-align: left; border: none; background: transparent; padding: 0; margin: 0; cursor: pointer; display: grid; gap: 4px; }
      .mg-copy-full:disabled { cursor: default; }
      .mg-copy-full.is-copied .mg-copy-value { background: transparent; box-shadow: inset 0 -0.58em 0 #dcefff; }
      .mg-copy-label { font-size: 11px; color: #5d7896; font-weight: 700; }
      .mg-copy-value { font-size: 14px; color: #1c3551; white-space: pre-wrap; word-break: break-word; line-height: 1.38; display: inline; width: fit-content; box-decoration-break: clone; -webkit-box-decoration-break: clone; text-decoration: none; transition: color .18s ease, box-shadow .18s ease; }
      .mg-copy-full:not(:disabled):hover .mg-copy-value { color: #14507d; text-decoration: underline; text-underline-offset: 2px; text-decoration-thickness: 1.5px; }
      @media (max-width: 380px) {
        .mg-cred-info,
        .mg-actions { grid-template-columns: 1fr; }
      }
      .is-hidden { display: none !important; }
    </style>
    <div class="mg-root">
      <div class="mg-launcher-wrap" data-role="launcher-wrap">
        <button class="mg-launcher" type="button" title="Open Cygnet"><img data-role="launcher-icon" alt="Cygnet" /></button>
        <button class="mg-launcher-hide" type="button" data-role="hide-launcher" title="Hide">×</button>
      </div>
      <aside class="mg-panel" aria-label="Cygnet Profile Panel">
        <header class="mg-header">
          <h2 class="mg-title">Cygnet Profile</h2>
          <div class="mg-header-actions">
            <button class="mg-icon-btn" type="button" data-role="close" title="Close">×</button>
          </div>
        </header>
        <div class="mg-body" data-role="body">
          <section class="mg-auth-row">
            <p class="mg-auth-email is-hidden" data-role="auth-email"></p>
            <div class="mg-auth-actions">
              <button class="mg-btn" type="button" data-role="sign-in">Log in</button>
              <button class="mg-btn secondary is-hidden" type="button" data-role="logout">Log out</button>
            </div>
          </section>
          <div class="mg-controls is-hidden" data-role="controls">
            <label class="mg-toggle">
              <span>Autofill enabled</span>
              <input type="checkbox" data-role="enabled-toggle" />
            </label>
            <div class="mg-actions">
              <button class="mg-btn" type="button" data-role="autofill">Autofill this page</button>
            </div>
          </div>
          <div class="mg-tabs is-hidden" data-role="tabs">
            <button class="mg-tab is-active" type="button" data-role="tab-main" aria-pressed="true">メイン</button>
            <button class="mg-tab" type="button" data-role="tab-additional" aria-pressed="false">追加情報</button>
            <button class="mg-tab" type="button" data-role="tab-credentials" aria-pressed="false">ログイン情報</button>
          </div>
          <p class="mg-status" data-role="status"></p>
          <div class="mg-sections is-hidden" data-role="sections"></div>
        </div>
      </aside>
    </div>
  `;

  const root = shadow.querySelector(".mg-root") as HTMLElement;
  const launcherWrap = shadow.querySelector("[data-role='launcher-wrap']") as HTMLElement;
  const launcher = shadow.querySelector(".mg-launcher") as HTMLElement;
  const launcherIcon = shadow.querySelector("[data-role='launcher-icon']") as HTMLImageElement;
  const hideLauncherBtn = shadow.querySelector("[data-role='hide-launcher']") as HTMLElement;
  const closeBtn = shadow.querySelector("[data-role='close']") as HTMLElement;
  const authEmail = shadow.querySelector("[data-role='auth-email']") as HTMLElement;
  const signInBtn = shadow.querySelector("[data-role='sign-in']") as HTMLButtonElement;
  const logoutBtn = shadow.querySelector("[data-role='logout']") as HTMLButtonElement;
  const controlsWrap = shadow.querySelector("[data-role='controls']") as HTMLElement;
  const enabledToggle = shadow.querySelector("[data-role='enabled-toggle']") as HTMLInputElement;
  const autofillBtn = shadow.querySelector("[data-role='autofill']") as HTMLElement;
  const tabsWrap = shadow.querySelector("[data-role='tabs']") as HTMLElement;
  const tabMainBtn = shadow.querySelector("[data-role='tab-main']") as HTMLButtonElement;
  const tabAdditionalBtn = shadow.querySelector("[data-role='tab-additional']") as HTMLButtonElement;
  const tabCredentialsBtn = shadow.querySelector("[data-role='tab-credentials']") as HTMLButtonElement;
  const status = shadow.querySelector("[data-role='status']") as HTMLElement;
  const sections = shadow.querySelector("[data-role='sections']") as HTMLElement;

  launcherIcon.src = chrome.runtime.getURL(LAUNCHER_ICON_PATH);
  launcherIcon.draggable = false;

  let suppressLauncherClick = false;
  launcher.addEventListener("click", (event) => {
    if (suppressLauncherClick) {
      suppressLauncherClick = false;
      event.preventDefault();
      return;
    }
    setOverlayOpen(true);
  });
  hideLauncherBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    setLauncherVisible(false, { persist: true }).catch(() => {});
  });
  closeBtn.addEventListener("click", () => setOverlayOpen(false));

  signInBtn.addEventListener("click", async () => {
    try {
      const response = (await sendRuntimeMessage({ type: "OPEN_WEB_LOGIN" })) as
        | { ok?: boolean }
        | undefined;
      if (response?.ok) {
        setOverlayStatus("Webログインを開きました");
      } else {
        setOverlayStatus("Webログインを開けませんでした");
      }
    } catch {
      setOverlayStatus("Webログインを開けませんでした");
    }
  });

  logoutBtn.addEventListener("click", async () => {
    try {
      const response = (await sendRuntimeMessage({ type: "SIGN_OUT" })) as
        | { ok?: boolean }
        | undefined;
      if (!response?.ok) {
        setOverlayStatus("ログアウトに失敗しました");
        return;
      }
      authStateCache = null;
      credentialSummariesCache = [];
      credentialVaultState = { unlocked: false, hasVault: credentialVaultState.hasVault, entryCount: 0 };
      credentialEditingId = null;
      credentialPromptId = null;
      credentialDrafts.clear();
      clearRevealedCredentialPasswords();
      overlayActiveTab = "main";
      const settings = await getSettings();
      renderOverlayProfile(settings.profile || {});
      applyOverlayAuthUi({ authenticated: false, email: "" }, settings);
      setOverlayStatus("ログアウトしました");
    } catch {
      setOverlayStatus("ログアウトに失敗しました");
    }
  });

  enabledToggle.addEventListener("change", async () => {
    const state = await getAuthState(true);
    if (!state.authenticated) {
      enabledToggle.checked = false;
      setOverlayStatus("Create account to use");
      return;
    }
    const settings = await getSettings();
    const next = { ...settings, enabled: enabledToggle.checked };
    await new Promise<void>((resolve) => {
      storageArea.set({ [STORAGE_KEY]: next }, () => resolve());
    });
    setOverlayStatus(next.enabled ? "Autofill ON" : "Autofill OFF");
  });

  tabMainBtn.addEventListener("click", async () => {
    overlayActiveTab = "main";
    updateOverlayTabUi();
    const settings = await getSettings();
    await renderOverlayByActiveTab(settings);
  });

  tabAdditionalBtn.addEventListener("click", async () => {
    overlayActiveTab = "additional";
    updateOverlayTabUi();
    const settings = await getSettings();
    await renderOverlayByActiveTab(settings);
  });

  tabCredentialsBtn.addEventListener("click", async () => {
    overlayActiveTab = "credentials";
    updateOverlayTabUi();
    const settings = await getSettings();
    await renderOverlayByActiveTab(settings);
  });

  autofillBtn.addEventListener("click", async () => {
    const result = await autofill({ overwrite: true });
    if (result.reason === "auth_required") {
      setOverlayStatus("Create account to use");
      return;
    }
    if (result.reason === "dashboard_excluded") {
      setOverlayStatus("Cygnet のダッシュボード上では自動入力しません");
      return;
    }
    if (result.reason === "password_locked") {
      setOverlayStatus("ユーザー名のみ入力しました。パスワードは一覧で表示してから入力できます");
      return;
    }
    setOverlayStatus(`${result.filled || 0} 項目を入力しました`);
  });

  let dragging = false;
  let dragOffset = 0;
  let dragStartY = 0;

  launcher.addEventListener("pointerdown", (event: PointerEvent) => {
    dragging = true;
    suppressLauncherClick = false;
    dragStartY = event.clientY;
    dragOffset = event.clientY - launcherTopPx;
    (launcher as HTMLElement).setPointerCapture?.(event.pointerId);
  });

  launcher.addEventListener("pointermove", (event: PointerEvent) => {
    if (!dragging) return;
    if (Math.abs(event.clientY - dragStartY) > 4) suppressLauncherClick = true;
    launcherTopPx = clampLauncherTop(event.clientY - dragOffset);
    applyLauncherTop();
  });

  const endDrag = (event: PointerEvent): void => {
    if (!dragging) return;
    dragging = false;
    (launcher as HTMLElement).releasePointerCapture?.(event.pointerId);
    updateOverlayStateForCurrentDomain({ top: launcherTopPx }).catch(() => {});
  };

  launcher.addEventListener("pointerup", endDrag as EventListener);
  launcher.addEventListener("pointercancel", endDrag as EventListener);
  window.addEventListener("resize", applyLauncherTop);

  overlayRefs = {
    host,
    shadow,
    root,
    launcherWrap,
    launcher,
    hideLauncherBtn,
    closeBtn,
    authEmail,
    signInBtn,
    logoutBtn,
    controlsWrap,
    enabledToggle,
    autofillBtn,
    tabsWrap,
    tabMainBtn,
    tabAdditionalBtn,
    tabCredentialsBtn,
    status,
    sections,
    statusTimer: null,
    resizeHandler: applyLauncherTop
  };
  applyLauncherTop();

  return overlayRefs;
}

async function refreshInPageOverlay(): Promise<void> {
  const refs = ensureInPageOverlay();
  if (!refs) return;
  authStateCache = null;
  const settings = await getSettings();
  await getAuthState(true);
  await renderOverlayByActiveTab(settings);
}

function bindInPageOverlayStorageListener(): void {
  if (storageListenerBound) return;
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "sync" && areaName !== "local") return;
    if (areaName === "local" && changes.cygnetStateVersion) {
      refreshInPageOverlay().catch(() => {});
    }
    if (areaName === "local" && overlayRefs && overlayActiveTab === "credentials") {
      if (changes.cygnetCredentialVaultRecords || changes.cygnetCredentialVaultMeta) {
        refreshCredentialData()
          .then(() => renderCredentialSections())
          .catch(() => {});
      }
    }
    const changed = changes[STORAGE_KEY];
    if (!changed || !overlayRefs) return;
    const nextSettings = (changed.newValue as Settings) || { enabled: true, profile: {} };
    getAuthState(true)
      .then(() => renderOverlayByActiveTab(nextSettings))
      .catch(() => applyOverlayAuthUi({ authenticated: false, email: "" }, nextSettings));
  });
  storageListenerBound = true;
}

async function initInPageOverlay(options: { showLauncher?: boolean; persist?: boolean } = {}): Promise<void> {
  const { showLauncher = false, persist = false } = options;
  if (window !== window.top || !document.body) return;
  ensureInPageOverlay();
  bindInPageOverlayStorageListener();
  await refreshInPageOverlay();
  await setLauncherVisible(showLauncher, { persist });
  setOverlayOpen(false);
}

function applyStoredCredentialToAuthForms(
  credential: CredentialSummary | null,
  password: string,
  overwrite: boolean
): number {
  if (!credential) return 0;
  let filled = 0;
  const forms = getVisibleAuthForms();
  for (const form of forms) {
    const usernameField = findLikelyUsernameField(form);
    const passwordField = Array.from(form.querySelectorAll("input[type='password']")).find(
      (el): el is HTMLInputElement => el instanceof HTMLInputElement && isVisible(el)
    );

    if (usernameField) {
      const ok = setFieldValue(usernameField, "preferredName", credential.username, { overwrite });
      if (ok) filled += 1;
    }

    if (passwordField && password) {
      const ok = setFieldValue(passwordField, "password", password, { overwrite });
      if (ok) filled += 1;
    }
  }
  return filled;
}

async function autofill(options: { overwrite?: boolean } = {}): Promise<{ filled: number; reason?: string }> {
  const { overwrite = true } = options;
  if (isCygnetManagedPage()) {
    return { filled: 0, reason: "dashboard_excluded" };
  }

  const authenticated = await isUserAuthenticated();
  if (!authenticated) {
    return { filled: 0, reason: "auth_required" };
  }

  const settings = await getSettings();
  if (!settings.enabled) {
    return { filled: 0, reason: "disabled" };
  }

  const profile = settings.profile || {};
  const inputs = Array.from(
    document.querySelectorAll("input, textarea, select, [role='combobox']")
  ).filter(isFillable);

  const candidates: Candidate[] = inputs.map((el) => {
    const meta = getTextMeta(el);
    const rawHint = getRawHintText(el);
    return {
      el,
      layoutEl: getLayoutElement(el),
      meta,
      rawHint,
      field: null,
      contactSubtype: null,
      kanaTarget: null,
      namePart: null,
      scriptHint: null,
      combineCityForAddressLine1: false
    };
  });

  assignNameFields(candidates);
  assignNameFieldsByPairRows(candidates);

  for (const candidate of candidates) {
    if (candidate.field !== null && candidate.field !== undefined) continue;
    candidate.field = matchNonNameField(
      candidate.meta,
      ((candidate.el as HTMLInputElement).type || "").toLowerCase(),
      candidate.el,
      candidate.rawHint
    );
  }

  const hasCityFieldCandidate = candidates.some((candidate) => candidate.field === "city");
  for (const candidate of candidates) {
    if (candidate.field !== "addressLine1") continue;
    if (hasCityFieldCandidate) continue;

    const hint = `${candidate.meta || ""} ${candidate.rawHint || ""}`;
    const wantsTownOrFullAddress =
      /(町名以降|市区町村以降|番地と住所|住所.*以降|住所|address|street|丁目|番地)/.test(hint) &&
      !/(建物|マンション|アパート|部屋|号室|address.?line.?2|address.?2)/.test(hint);

    if (wantsTownOrFullAddress) {
      candidate.combineCityForAddressLine1 = true;
    }
  }

  for (const candidate of candidates) {
    if (candidate.field === "email" || candidate.field === "phone") {
      const text = `${candidate.meta || ""} ${candidate.rawHint || ""}`;
      candidate.contactSubtype = detectContactSubtype(candidate.field, text);
    }
  }

  const matchedCredential = await getBestCredentialForCurrentPage().catch(() => null);
  const revealedPassword = matchedCredential
    ? revealedCredentialPasswords.get(matchedCredential.id) || ""
    : "";
  let filled = applyStoredCredentialToAuthForms(matchedCredential, revealedPassword, overwrite);
  const handledElements = new Set<HTMLElement>();
  fillGroupedFields(candidates, profile, overwrite, handledElements);
  await retrySplitBirthDateFields(profile, overwrite, handledElements);

  for (const candidate of candidates) {
    const { el, field } = candidate;
    if (handledElements.has(el)) continue;
    if (!field) continue;
    const value = resolveAutofillValue(candidate, profile);
    if (setFieldValue(el, field, value, { overwrite })) filled += 1;
  }

  fillVacationSameAsCurrentFallback(profile, overwrite, handledElements);
  await retryUniversitySelectionFlow(profile, overwrite, handledElements);
  fillVacationSameAsCurrentFallback(profile, overwrite, handledElements);

  return {
    filled,
    reason: matchedCredential && !revealedPassword ? "password_locked" : undefined
  };
}

function debounce<T extends (...args: unknown[]) => void>(fn: T, waitMs: number): (...args: Parameters<T>) => void {
  let timeoutId: number | null = null;
  return (...args: Parameters<T>) => {
    if (timeoutId !== null) window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => fn(...args), waitMs);
  };
}

function startAutoRun(): void {
  if (isCygnetManagedPage()) return;

  const trigger = debounce(() => {
    autofill({ overwrite: false }).catch(() => {});
  }, AUTO_RUN_DEBOUNCE_MS);

  trigger();

  const observer = new MutationObserver(() => trigger());
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.setTimeout(() => observer.disconnect(), AUTO_RUN_OBSERVE_MS);
}

async function maybeShowLauncherFromDomainState(): Promise<void> {
  if (window !== window.top) return;
  const state = await getOverlayStateForCurrentDomain();
  if (!state?.visible) return;
  if (Number.isFinite(Number(state.top))) {
    launcherTopPx = clampLauncherTop(Number(state.top));
  }
  await initInPageOverlay({ showLauncher: true, persist: false });
}

function initWebDashboardBridge(): void {
  if (!WEB_BRIDGE_ORIGINS.has(window.location.origin)) return;

  window.addEventListener("message", (event: MessageEvent) => {
    if (event.source !== window) return;
    if (event.origin !== window.location.origin) return;
    const data = event.data as { type?: string } | undefined;
    if (data?.type !== WEB_BRIDGE_REQUEST_TYPE) return;

    window.postMessage(
      {
        type: WEB_BRIDGE_RESPONSE_TYPE,
        extensionId: chrome.runtime.id,
      },
      window.location.origin,
    );
  });
}

/* ── Initialization ── */

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startAutoRun, { once: true });
  document.addEventListener("DOMContentLoaded", bindCredentialCaptureListener, { once: true });
  document.addEventListener("DOMContentLoaded", initWebDashboardBridge, { once: true });
  document.addEventListener(
    "DOMContentLoaded",
    () => {
      maybeShowLauncherFromDomainState().catch(() => {});
    },
    { once: true }
  );
} else {
  startAutoRun();
  bindCredentialCaptureListener();
  initWebDashboardBridge();
  maybeShowLauncherFromDomainState().catch(() => {});
}

chrome.runtime.onMessage.addListener(
  (msg: { type?: string }, _sender: chrome.runtime.MessageSender, sendResponse: (response: unknown) => void) => {
    if (msg?.type === "CYGNET_REFRESH_STATE") {
      refreshInPageOverlay()
        .then(() => sendResponse({ ok: true }))
        .catch((err) => sendResponse({ ok: false, error: String(err) }));
      return true;
    }

    if (msg?.type === "CYGNET_SHOW_LAUNCHER") {
      getOverlayStateForCurrentDomain()
        .then((state) => {
          if (Number.isFinite(Number(state?.top))) {
            launcherTopPx = clampLauncherTop(Number(state.top));
          }
          return initInPageOverlay({ showLauncher: true, persist: true });
        })
        .then(() => {
          setOverlayOpen(true);
          sendResponse({ ok: true });
        })
        .catch((err) => sendResponse({ ok: false, error: String(err) }));
      return true;
    }

    if (msg?.type !== "AUTOFILL_NOW") return;

    autofill({ overwrite: true })
      .then((result) => {
        if (result.reason === "auth_required") {
          sendResponse({ ok: false, error: "auth_required", result });
          return;
        }
        sendResponse({ ok: true, result });
      })
      .catch((err) => sendResponse({ ok: false, error: String(err) }));

    return true;
  }
);
