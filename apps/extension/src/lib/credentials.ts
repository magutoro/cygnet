import type {
  CredentialCapturePayload,
  CredentialEntry,
  CredentialMatchContext,
  CredentialSummary,
  CredentialUpsertInput,
  CredentialVaultMeta,
  CredentialVaultState,
  EncryptedBlob,
  EncryptedCredentialRecord
} from "@cygnet/shared";

const VAULT_META_KEY = "cygnetCredentialVaultMeta";
const VAULT_RECORDS_KEY = "cygnetCredentialVaultRecords";
const VAULT_SESSION_RAW_KEY = "cygnetCredentialVaultSessionRawKey";
const VAULT_VERIFY_PAYLOAD = "cygnet_vault_unlocked_v1";
const VAULT_VERSION = 1;
const DEFAULT_PBKDF2_ITERATIONS = 210000;

const IMPORTANT_QUERY_KEYS = [
  "company",
  "corp",
  "tenant",
  "client",
  "site",
  "brand",
  "entry",
  "job",
  "recruit",
  "mypage",
  "code",
  "id"
];

let inMemoryVaultKey: CryptoKey | null = null;

function storageLocalGet<T>(key: string): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([key], (result) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve(result[key] as T | undefined);
    });
  });
}

function storageLocalSet(values: Record<string, unknown>): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set(values, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve();
    });
  });
}

function storageSessionGet<T>(key: string): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    const area = chrome.storage.session;
    if (!area) {
      resolve(undefined);
      return;
    }
    area.get([key], (result) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve(result[key] as T | undefined);
    });
  });
}

function storageSessionSet(values: Record<string, unknown>): Promise<void> {
  return new Promise((resolve, reject) => {
    const area = chrome.storage.session;
    if (!area) {
      resolve();
      return;
    }
    area.set(values, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve();
    });
  });
}

function storageSessionRemove(key: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const area = chrome.storage.session;
    if (!area) {
      resolve();
      return;
    }
    area.remove([key], () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve();
    });
  });
}

function uint8ToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

function base64ToUint8(value: string): Uint8Array {
  const binary = atob(value || "");
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const start = bytes.byteOffset;
  const end = bytes.byteOffset + bytes.byteLength;
  return bytes.buffer.slice(start, end) as ArrayBuffer;
}

function normalizePathname(pathname: string): string {
  const raw = String(pathname || "/").trim();
  const compact = raw.replace(/\/{2,}/g, "/");
  if (!compact) return "/";
  return compact.startsWith("/") ? compact : `/${compact}`;
}

function normalizeText(value: string | null | undefined): string {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ");
}

function makeImportantQueryKey(url: URL): string {
  const params = new URLSearchParams(url.search);
  const keys = Array.from(params.keys())
    .filter((key) => IMPORTANT_QUERY_KEYS.some((token) => key.toLowerCase().includes(token)))
    .sort();

  const parts: string[] = [];
  for (const key of keys) {
    const value = normalizeText(params.get(key) || "");
    if (!value) continue;
    parts.push(`${key}=${value}`.slice(0, 96));
  }
  return parts.join("&").slice(0, 420);
}

function safeParseUrl(rawUrl: string, fallback?: string): URL | null {
  try {
    return new URL(rawUrl);
  } catch {
    try {
      if (fallback) return new URL(rawUrl, fallback);
    } catch {
      // noop
    }
    return null;
  }
}

function makeActionKey(pageUrl: URL, formAction: string | undefined): string {
  const parsed = safeParseUrl(String(formAction || "").trim(), pageUrl.toString());
  if (!parsed) return "";
  const queryKey = makeImportantQueryKey(parsed);
  const base = `${parsed.origin}${normalizePathname(parsed.pathname)}`;
  return queryKey ? `${base}?${queryKey}` : base;
}

function makeFormSignature(raw: string | undefined): string {
  return normalizeText(raw).toLowerCase().slice(0, 420);
}

function sanitizeCredentialValue(raw: string): string {
  return String(raw || "").trim().slice(0, 1000);
}

function inferLabelFromPayload(
  payload: {
    label?: string;
    labelHint?: string;
    pageTitle?: string;
  },
  parsedUrl: URL
): string {
  const explicit = normalizeText(payload.label);
  if (explicit) return explicit.slice(0, 120);

  const hint = normalizeText(payload.labelHint);
  if (hint) return hint.slice(0, 120);

  const title = normalizeText(payload.pageTitle);
  if (title) {
    const head = title.split(/[\-|｜|\/|:]/)[0]?.trim() || "";
    if (head) return head.slice(0, 120);
  }

  return parsedUrl.hostname;
}

interface CredentialContext {
  siteKey: string;
  origin: string;
  host: string;
  path: string;
  queryKey: string;
  formAction: string;
  formSignature: string;
}

function buildCredentialContext(input: {
  pageUrl: string;
  formAction?: string;
  formSignature?: string;
}): CredentialContext | null {
  const pageUrl = safeParseUrl(input.pageUrl);
  if (!pageUrl) return null;

  const path = normalizePathname(pageUrl.pathname);
  const queryKey = makeImportantQueryKey(pageUrl);
  const formAction = makeActionKey(pageUrl, input.formAction);
  const formSignature = makeFormSignature(input.formSignature);

  const siteKey = [
    pageUrl.origin,
    path,
    queryKey || "-",
    formAction || "-",
    formSignature || "-"
  ].join("|");

  return {
    siteKey,
    origin: pageUrl.origin,
    host: pageUrl.hostname,
    path,
    queryKey,
    formAction,
    formSignature
  };
}

async function deriveVaultKey(
  passphrase: string,
  salt: Uint8Array,
  iterations: number
): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey("raw", enc.encode(passphrase), "PBKDF2", false, [
    "deriveKey"
  ]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: toArrayBuffer(salt), iterations, hash: "SHA-256" },
    baseKey,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

async function importVaultKey(rawKey: Uint8Array): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", toArrayBuffer(rawKey), { name: "AES-GCM", length: 256 }, true, [
    "encrypt",
    "decrypt"
  ]);
}

async function exportVaultKey(key: CryptoKey): Promise<Uint8Array> {
  const raw = await crypto.subtle.exportKey("raw", key);
  return new Uint8Array(raw);
}

async function encryptText(text: string, key: CryptoKey): Promise<EncryptedBlob> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(text);
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded);
  return {
    iv: uint8ToBase64(iv),
    cipher: uint8ToBase64(new Uint8Array(encrypted))
  };
}

async function decryptText(blob: EncryptedBlob, key: CryptoKey): Promise<string> {
  const iv = base64ToUint8(blob.iv);
  const cipher = base64ToUint8(blob.cipher);
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: toArrayBuffer(iv) }, key, toArrayBuffer(cipher));
  return new TextDecoder().decode(decrypted);
}

async function getVaultMeta(): Promise<CredentialVaultMeta | null> {
  const meta = await storageLocalGet<CredentialVaultMeta>(VAULT_META_KEY);
  if (!meta) return null;
  if (!meta.salt || !meta.iterations || meta.version !== VAULT_VERSION) return null;
  return meta;
}

async function saveVaultMeta(meta: CredentialVaultMeta): Promise<void> {
  await storageLocalSet({ [VAULT_META_KEY]: meta });
}

async function getEncryptedRecords(): Promise<EncryptedCredentialRecord[]> {
  const value = await storageLocalGet<EncryptedCredentialRecord[]>(VAULT_RECORDS_KEY);
  if (!Array.isArray(value)) return [];
  return value;
}

async function saveEncryptedRecords(records: EncryptedCredentialRecord[]): Promise<void> {
  await storageLocalSet({ [VAULT_RECORDS_KEY]: records });
}

async function getUnlockedVaultKey(): Promise<CryptoKey | null> {
  if (inMemoryVaultKey) return inMemoryVaultKey;
  const rawB64 = await storageSessionGet<string>(VAULT_SESSION_RAW_KEY);
  if (!rawB64) return null;
  try {
    const imported = await importVaultKey(base64ToUint8(rawB64));
    inMemoryVaultKey = imported;
    return imported;
  } catch {
    await storageSessionRemove(VAULT_SESSION_RAW_KEY).catch(() => {});
    return null;
  }
}

async function setUnlockedVaultKey(key: CryptoKey): Promise<void> {
  inMemoryVaultKey = key;
  const raw = await exportVaultKey(key);
  await storageSessionSet({ [VAULT_SESSION_RAW_KEY]: uint8ToBase64(raw) });
}

function recordToSummary(
  record: EncryptedCredentialRecord,
  username: string
): CredentialSummary {
  return {
    id: record.id,
    label: record.label,
    labelManual: record.labelManual,
    siteKey: record.siteKey,
    origin: record.origin,
    host: record.host,
    path: record.path,
    queryKey: record.queryKey,
    formAction: record.formAction,
    formSignature: record.formSignature,
    username,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt
  };
}

async function getVerifiedVaultKey(
  passphrase: string,
  options: { persist?: boolean; createIfMissing?: boolean } = {}
): Promise<CryptoKey> {
  const { persist = false, createIfMissing = true } = options;
  const trimmed = String(passphrase || "");
  if (trimmed.length < 4) {
    throw new Error("passphrase_too_short");
  }

  let meta = await getVaultMeta();
  if (!meta) {
    if (!createIfMissing) {
      throw new Error("vault_not_initialized");
    }
    const salt = crypto.getRandomValues(new Uint8Array(16));
    meta = {
      version: VAULT_VERSION,
      salt: uint8ToBase64(salt),
      iterations: DEFAULT_PBKDF2_ITERATIONS
    };
  }

  const key = await deriveVaultKey(trimmed, base64ToUint8(meta.salt), meta.iterations);

  if (meta.verification) {
    let verified = false;
    try {
      const payload = await decryptText(meta.verification, key);
      verified = payload === VAULT_VERIFY_PAYLOAD;
    } catch {
      verified = false;
    }
    if (!verified) {
      throw new Error("invalid_passphrase");
    }
  } else {
    meta.verification = await encryptText(VAULT_VERIFY_PAYLOAD, key);
    await saveVaultMeta(meta);
  }

  if (persist) {
    await setUnlockedVaultKey(key);
  }

  return key;
}

async function resolveRecordUsername(
  record: EncryptedCredentialRecord,
  key?: CryptoKey | null
): Promise<string> {
  const visibleUsername = sanitizeCredentialValue(record.username);
  if (visibleUsername) return visibleUsername;
  if (!record.usernameEnc || !key) return "";
  return sanitizeCredentialValue(await decryptText(record.usernameEnc, key));
}

async function migrateLegacyRecordsForKey(
  key: CryptoKey,
  recordsInput?: EncryptedCredentialRecord[]
): Promise<EncryptedCredentialRecord[]> {
  const records = recordsInput ?? (await getEncryptedRecords());
  let changed = false;
  const next: EncryptedCredentialRecord[] = [];

  for (const record of records) {
    if (!sanitizeCredentialValue(record.username) && record.usernameEnc) {
      try {
        const username = sanitizeCredentialValue(await decryptText(record.usernameEnc, key));
        next.push({
          ...record,
          username,
          usernameEnc: undefined
        });
        changed = true;
        continue;
      } catch {
        next.push(record);
        continue;
      }
    }
    next.push(record);
  }

  if (changed) {
    await saveEncryptedRecords(next);
  }

  return next;
}

async function decryptRecord(record: EncryptedCredentialRecord, key: CryptoKey): Promise<CredentialEntry> {
  const [username, password] = await Promise.all([
    resolveRecordUsername(record, key),
    decryptText(record.passwordEnc, key)
  ]);
  return {
    ...recordToSummary(record, username),
    password,
  };
}

async function encryptRecord(
  current: EncryptedCredentialRecord | null,
  value: CredentialEntry,
  key: CryptoKey
): Promise<EncryptedCredentialRecord> {
  const passwordEnc = await encryptText(value.password, key);
  return {
    id: value.id,
    label: value.label,
    labelManual: value.labelManual,
    siteKey: value.siteKey,
    origin: value.origin,
    host: value.host,
    path: value.path,
    queryKey: value.queryKey,
    formAction: value.formAction,
    formSignature: value.formSignature,
    username: sanitizeCredentialValue(value.username),
    usernameEnc: undefined,
    passwordEnc,
    createdAt: current?.createdAt ?? value.createdAt,
    updatedAt: value.updatedAt
  };
}

export async function unlockCredentialVault(passphrase: string): Promise<CredentialVaultState> {
  const key = await getVerifiedVaultKey(passphrase, { persist: true });
  const records = await migrateLegacyRecordsForKey(key);

  return {
    unlocked: true,
    hasVault: true,
    entryCount: records.length
  };
}

export async function lockCredentialVault(): Promise<void> {
  inMemoryVaultKey = null;
  await storageSessionRemove(VAULT_SESSION_RAW_KEY);
}

export async function getCredentialVaultState(): Promise<CredentialVaultState> {
  const [meta, records, key] = await Promise.all([
    getVaultMeta(),
    getEncryptedRecords(),
    getUnlockedVaultKey()
  ]);
  return {
    unlocked: Boolean(key),
    hasVault: Boolean(meta?.verification),
    entryCount: records.length
  };
}

export async function listCredentialSummaries(): Promise<CredentialSummary[]> {
  const records = await getEncryptedRecords();
  return records
    .map((record) => recordToSummary(record, sanitizeCredentialValue(record.username)))
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function listCredentialEntries(): Promise<CredentialEntry[]> {
  const key = await getUnlockedVaultKey();
  if (!key) {
    throw new Error("vault_locked");
  }
  const records = await migrateLegacyRecordsForKey(key);
  const entries: CredentialEntry[] = [];
  for (const record of records) {
    try {
      const entry = await decryptRecord(record, key);
      entries.push(entry);
    } catch {
      // Skip corrupted records.
    }
  }
  entries.sort((a, b) => b.updatedAt - a.updatedAt);
  return entries;
}

async function upsertCredentialInternal(
  input: CredentialUpsertInput & { pageTitle?: string; labelHint?: string; labelManual?: boolean }
): Promise<CredentialSummary> {

  const context = buildCredentialContext(input);
  if (!context) {
    throw new Error("invalid_url");
  }

  const username = sanitizeCredentialValue(input.username);
  if (!username) {
    throw new Error("missing_username");
  }

  const pageUrl = safeParseUrl(input.pageUrl);
  if (!pageUrl) throw new Error("invalid_url");

  const now = Date.now();
  const records = await getEncryptedRecords();

  const existingIndex = records.findIndex((record) => {
    if (input.id && record.id === input.id) return true;
    return !input.id && record.siteKey === context.siteKey;
  });

  const existing = existingIndex >= 0 ? records[existingIndex] : null;
  const id = existing?.id || input.id || crypto.randomUUID();

  const previousLabel = existing?.label || "";
  const previousManual = Boolean(existing?.labelManual);

  const inferredLabel = inferLabelFromPayload(input, pageUrl);
  const requestedLabel = normalizeText(input.label);
  const labelManual = Boolean(input.labelManual || requestedLabel) || previousManual;
  const label =
    (requestedLabel && requestedLabel.slice(0, 120)) ||
    (previousLabel && previousLabel.slice(0, 120)) ||
    inferredLabel;

  const summary: CredentialSummary = {
    id,
    label,
    labelManual,
    siteKey: context.siteKey,
    origin: context.origin,
    host: context.host,
    path: context.path,
    queryKey: context.queryKey,
    formAction: context.formAction,
    formSignature: context.formSignature,
    username,
    createdAt: existing?.createdAt || now,
    updatedAt: now
  };

  const nextPassword = sanitizeCredentialValue(input.password);
  if (!existing && !nextPassword) {
    throw new Error("missing_credentials");
  }

  let encrypted: EncryptedCredentialRecord;
  if (!nextPassword && existing) {
    encrypted = {
      ...existing,
      ...summary,
      username,
      usernameEnc: undefined,
      updatedAt: now
    };
  } else {
    const existingKey =
      (input.passphrase && (await getVerifiedVaultKey(input.passphrase))) ||
      (await getUnlockedVaultKey());
    if (!existingKey) {
      throw new Error("vault_locked");
    }
    encrypted = await encryptRecord(
      existing,
      {
        ...summary,
        password: nextPassword
      },
      existingKey
    );
  }

  if (existingIndex >= 0) {
    records[existingIndex] = encrypted;
  } else {
    records.push(encrypted);
  }
  await saveEncryptedRecords(records);
  return summary;
}

export async function captureCredentialFromForm(payload: CredentialCapturePayload): Promise<CredentialSummary | null> {
  const username = sanitizeCredentialValue(payload.username);
  const password = sanitizeCredentialValue(payload.password);
  if (!username || !password) return null;

  try {
    return await upsertCredentialInternal({
      pageUrl: payload.pageUrl,
      pageTitle: payload.pageTitle,
      formAction: payload.formAction,
      formSignature: payload.formSignature,
      labelHint: payload.labelHint,
      username,
      password
    });
  } catch {
    return null;
  }
}

export async function upsertCredentialEntry(input: CredentialUpsertInput): Promise<CredentialSummary> {
  return upsertCredentialInternal({
    ...input,
    labelManual: true
  });
}

export async function deleteCredentialEntry(id: string): Promise<void> {
  if (!id) return;
  const records = await getEncryptedRecords();
  const next = records.filter((record) => record.id !== id);
  await saveEncryptedRecords(next);
}

function scoreCredentialMatch(entry: CredentialSummary, context: CredentialContext): number {
  let score = 0;
  if (entry.siteKey === context.siteKey) score += 120;
  if (entry.origin === context.origin) score += 26;
  if (entry.path === context.path) score += 20;
  if (entry.queryKey && entry.queryKey === context.queryKey) score += 14;
  if (entry.formAction && entry.formAction === context.formAction) score += 16;
  if (entry.formSignature && entry.formSignature === context.formSignature) score += 10;
  if (entry.host === context.host) score += 8;
  if (context.path.startsWith(entry.path) || entry.path.startsWith(context.path)) score += 4;
  return score;
}

export async function findBestCredentialSummary(
  contextInput: CredentialMatchContext
): Promise<CredentialSummary | null> {
  const context = buildCredentialContext(contextInput);
  if (!context) return null;

  const entries = await listCredentialSummaries();
  if (!entries.length) return null;

  const ranked = entries
    .map((entry) => ({ entry, score: scoreCredentialMatch(entry, context) }))
    .filter((row) => row.score >= 20)
    .sort((a, b) => b.score - a.score || b.entry.updatedAt - a.entry.updatedAt);

  return ranked[0]?.entry || null;
}

export async function revealCredentialPassword(id: string, passphrase: string): Promise<string> {
  if (!id) throw new Error("missing_id");
  const key = await getVerifiedVaultKey(passphrase, { createIfMissing: false });
  const records = await migrateLegacyRecordsForKey(key);
  const record = records.find((item) => item.id === id);
  if (!record) throw new Error("not_found");
  return decryptText(record.passwordEnc, key);
}
