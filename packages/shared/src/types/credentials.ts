export interface EncryptedBlob {
  iv: string;
  cipher: string;
}

export interface CredentialVaultMeta {
  version: number;
  salt: string;
  iterations: number;
  verification?: EncryptedBlob;
}

export interface EncryptedCredentialRecord {
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
  usernameEnc: EncryptedBlob;
  passwordEnc: EncryptedBlob;
  createdAt: number;
  updatedAt: number;
}

export interface CredentialEntry {
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
  password: string;
  createdAt: number;
  updatedAt: number;
}

export interface CredentialCapturePayload {
  pageUrl: string;
  pageTitle?: string;
  formAction?: string;
  formSignature?: string;
  labelHint?: string;
  username: string;
  password: string;
}

export interface CredentialUpsertInput {
  id?: string;
  pageUrl: string;
  formAction?: string;
  formSignature?: string;
  label?: string;
  username: string;
  password: string;
}

export interface CredentialMatchContext {
  pageUrl: string;
  formAction?: string;
  formSignature?: string;
}

export interface CredentialVaultState {
  unlocked: boolean;
  hasVault: boolean;
  entryCount: number;
}
