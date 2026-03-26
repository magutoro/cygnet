export const EDUCATION_TYPE_LABELS: Record<string, string> = {
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
  // Backward-compatible labels for existing saved profiles.
  university: "大学",
  graduate_master: "大学院(修士)",
  graduate_doctor: "大学院(博士)",
  junior_college: "短期大学",
  vocational: "専門学校",
  high_school: "高等学校",
  foreign_university_jp: "外国大学日本校",
  foreign_university: "外国大学",
};

export const GENDER_OPTIONS = [
  { value: "", label: "未設定" },
  { value: "male", label: "男性" },
  { value: "female", label: "女性" },
  { value: "non_binary", label: "ノンバイナリー" },
  { value: "prefer_not_to_say", label: "回答しない" },
  { value: "other", label: "その他" },
] as const;

export const EDUCATION_TYPE_OPTIONS = [
  { value: "", label: "未設定" },
  { value: "national_university", label: "国立大学" },
  { value: "public_university", label: "公立大学" },
  { value: "private_university", label: "私立大学" },
  { value: "national_graduate_school", label: "国立大学院" },
  { value: "public_graduate_school", label: "公立大学院" },
  { value: "private_graduate_school", label: "私立大学院" },
  { value: "national_junior_college", label: "国立短大" },
  { value: "public_junior_college", label: "公立短大" },
  { value: "private_junior_college", label: "私立短大" },
  { value: "technical_college", label: "高等専門学校" },
  { value: "vocational_school", label: "専門学校" },
  { value: "overseas_university", label: "海外大学" },
  { value: "other", label: "その他" },
] as const;

export const HUMANITIES_SCIENCE_OPTIONS = [
  { value: "", label: "未設定" },
  { value: "arts", label: "文系" },
  { value: "science", label: "理系" },
  { value: "other", label: "その他" },
] as const;
