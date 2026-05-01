export type { Profile, ProfileKey } from "./types/profile.js";
export { DEFAULT_PROFILE } from "./types/profile.js";

export type { Settings, OverlayDomainState } from "./types/settings.js";

export type {
  ExtensionMessage,
  AutofillResult,
  GetDefaultsResponse,
  GetAuthStateResponse,
  ExtensionBridgeResponse,
  ApplicationQuickAddResponse,
  CredentialVaultStateResponse,
  CredentialListResponse,
  CredentialSummaryListResponse,
  CredentialRevealPasswordResponse
} from "./types/messages.js";

export {
  EDUCATION_TYPE_LABELS,
  GENDER_OPTIONS,
  EDUCATION_TYPE_OPTIONS,
  HUMANITIES_SCIENCE_OPTIONS
} from "./constants/field-patterns.js";

export { hiraganaToKatakana, katakanaToHiragana, toHalfWidth, extractDigits, extractKatakanaCandidate } from "./utils/kana.js";

export { splitPostalDigits, formatPostalForDisplay, joinNonEmpty, normalizeProfileUrl } from "./utils/format.js";

export type { DbProfile, DbResume } from "./types/database.js";
export type { DbApplication, DbGmailSyncCandidate, DbGoogleWorkspaceIntegration } from "./types/database.js";

export type {
  Application,
  ApplicationInput,
  ApplicationStatus,
  ApplicationCaptureSource,
  ApplicationCalendarProvider,
  GmailSyncCandidate,
  GmailSyncCandidateReviewStatus,
} from "./types/applications.js";

export {
  APPLICATION_STATUS_ORDER,
  DEFAULT_APPLICATION_INPUT,
  dbApplicationToApplication,
  dbGmailSyncCandidateToCandidate,
  applicationInputToDb,
  gmailSyncCandidateToApplicationInput,
} from "./types/applications.js";

export type { GoogleWorkspaceIntegrationSummary } from "./types/google-workspace.js";
export {
  GOOGLE_WORKSPACE_SCOPES,
  dbGoogleWorkspaceIntegrationToSummary,
} from "./types/google-workspace.js";

export { profileToDb, dbToProfile } from "./utils/profile-convert.js";

export type {
  EncryptedBlob,
  CredentialVaultMeta,
  EncryptedCredentialRecord,
  CredentialSummary,
  CredentialEntry,
  CredentialCapturePayload,
  CredentialUpsertInput,
  CredentialMatchContext,
  CredentialVaultState
} from "./types/credentials.js";
