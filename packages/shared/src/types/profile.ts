export interface Profile {
  [key: string]: string;
  lastNameKanji: string;
  firstNameKanji: string;
  lastNameKana: string;
  firstNameKana: string;
  lastNameEnglish: string;
  firstNameEnglish: string;
  preferredName: string;
  email: string;
  mobileEmail: string;
  phone: string;
  mobilePhone: string;
  gender: string;
  password: string;
  postalCode: string;
  prefecture: string;
  city: string;
  addressLine1: string;
  addressLine2: string;
  birthDate: string;
  university: string;
  educationType: string;
  universityKanaInitial: string;
  universityPrefecture: string;
  faculty: string;
  department: string;
  humanitiesScienceType: string;
  graduationYear: string;
  company: string;
  linkedIn: string;
  github: string;
  portfolio: string;
  note: string;
}

export type ProfileKey = string;

export const DEFAULT_PROFILE: Profile = {
  lastNameKanji: "",
  firstNameKanji: "",
  lastNameKana: "",
  firstNameKana: "",
  lastNameEnglish: "",
  firstNameEnglish: "",
  preferredName: "",
  email: "",
  mobileEmail: "",
  phone: "",
  mobilePhone: "",
  gender: "",
  password: "",
  postalCode: "",
  prefecture: "",
  city: "",
  addressLine1: "",
  addressLine2: "",
  birthDate: "",
  university: "",
  educationType: "",
  universityKanaInitial: "",
  universityPrefecture: "",
  faculty: "",
  department: "",
  humanitiesScienceType: "",
  graduationYear: "",
  company: "",
  linkedIn: "",
  github: "",
  portfolio: "",
  note: "",
};
