import type { Settings } from "./settings.js";
import type {
  CredentialCapturePayload,
  CredentialMatchContext,
  CredentialUpsertInput,
  CredentialVaultState,
  CredentialEntry
} from "./credentials.js";

export type ExtensionMessage =
  | { type: "AUTOFILL_NOW" }
  | { type: "CYGNET_SHOW_LAUNCHER" }
  | { type: "CYGNET_IMPORT_SUPABASE_SESSION"; accessToken: string; refreshToken: string }
  | { type: "GET_DEFAULTS" }
  | { type: "GET_AUTH_STATE" }
  | { type: "OPEN_WEB_LOGIN" }
  | { type: "OPEN_WEB_DASHBOARD" }
  | { type: "SIGN_OUT" }
  | { type: "OPEN_OPTIONS_PAGE" }
  | { type: "CREDENTIAL_VAULT_STATE" }
  | { type: "CREDENTIAL_UNLOCK"; passphrase: string }
  | { type: "CREDENTIAL_LOCK" }
  | { type: "CREDENTIAL_LIST" }
  | { type: "CREDENTIAL_UPSERT"; entry: CredentialUpsertInput }
  | { type: "CREDENTIAL_DELETE"; id: string }
  | { type: "CREDENTIAL_MATCH"; context: CredentialMatchContext }
  | { type: "CREDENTIAL_CAPTURE"; payload: CredentialCapturePayload };

export interface AutofillResult {
  ok: boolean;
  result?: { filled: number; reason?: string };
  error?: string;
}

export interface GetDefaultsResponse {
  defaults: Settings;
}

export interface GetAuthStateResponse {
  authenticated: boolean;
  email?: string | null;
}

export interface CredentialVaultStateResponse {
  ok: boolean;
  state?: CredentialVaultState;
  error?: string;
}

export interface CredentialListResponse {
  ok: boolean;
  entries?: CredentialEntry[];
  error?: string;
}
