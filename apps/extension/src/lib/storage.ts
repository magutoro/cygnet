import { DEFAULT_PROFILE } from "@cygnet/shared";
import type { Settings, OverlayDomainState, Profile } from "@cygnet/shared";

const STORAGE_KEY = "settings";
const OVERLAY_DOMAIN_STATE_KEY = "overlayDomainState";

let migrationPromise: Promise<void> | null = null;

function getLocalStorageArea(): chrome.storage.StorageArea {
  return chrome.storage.local;
}

function getLegacySyncArea(): chrome.storage.StorageArea | null {
  return chrome.storage.sync ?? null;
}

function areaGet<T>(
  area: chrome.storage.StorageArea,
  keys: string[],
): Promise<Record<string, T>> {
  return new Promise((resolve, reject) => {
    area.get(keys, (result) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve(result as Record<string, T>);
    });
  });
}

function areaSet(
  area: chrome.storage.StorageArea,
  values: Record<string, unknown>,
): Promise<void> {
  return new Promise((resolve, reject) => {
    area.set(values, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve();
    });
  });
}

function areaRemove(
  area: chrome.storage.StorageArea,
  keys: string[],
): Promise<void> {
  return new Promise((resolve, reject) => {
    area.remove(keys, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve();
    });
  });
}

function sanitizeProfile(profile?: Partial<Profile> | null): Profile {
  return {
    ...DEFAULT_PROFILE,
    ...(profile || {}),
    // Legacy plain-password storage is deprecated. Passwords must stay in the local vault only.
    password: "",
  };
}

function sanitizeSettings(settings?: Partial<Settings> | null): Settings {
  return {
    enabled: settings?.enabled ?? true,
    profile: sanitizeProfile(settings?.profile),
  };
}

async function migrateLegacySyncStorageIfNeeded(): Promise<void> {
  if (migrationPromise) {
    await migrationPromise;
    return;
  }

  migrationPromise = (async () => {
    const localArea = getLocalStorageArea();
    const syncArea = getLegacySyncArea();
    if (!syncArea) return;

    const [localStored, syncStored] = await Promise.all([
      areaGet<Settings | Record<string, OverlayDomainState>>(localArea, [STORAGE_KEY, OVERLAY_DOMAIN_STATE_KEY]),
      areaGet<Settings | Record<string, OverlayDomainState>>(syncArea, [STORAGE_KEY, OVERLAY_DOMAIN_STATE_KEY]),
    ]);

    const localSettings = localStored[STORAGE_KEY] as Settings | undefined;
    const syncSettings = syncStored[STORAGE_KEY] as Settings | undefined;
    const localOverlay = localStored[OVERLAY_DOMAIN_STATE_KEY] as Record<string, OverlayDomainState> | undefined;
    const syncOverlay = syncStored[OVERLAY_DOMAIN_STATE_KEY] as Record<string, OverlayDomainState> | undefined;

    const nextLocalSettings = sanitizeSettings(localSettings || syncSettings || null);
    const shouldWriteSettings =
      !localSettings || JSON.stringify(localSettings) !== JSON.stringify(nextLocalSettings);

    const nextLocalOverlay = localOverlay || syncOverlay || {};
    const shouldWriteOverlay =
      !localOverlay && Boolean(syncOverlay && Object.keys(syncOverlay).length);

    const nextValues: Record<string, unknown> = {};
    if (shouldWriteSettings) nextValues[STORAGE_KEY] = nextLocalSettings;
    if (shouldWriteOverlay) nextValues[OVERLAY_DOMAIN_STATE_KEY] = nextLocalOverlay;

    if (Object.keys(nextValues).length) {
      await areaSet(localArea, nextValues);
    }

    if (syncSettings || syncOverlay) {
      await areaRemove(syncArea, [STORAGE_KEY, OVERLAY_DOMAIN_STATE_KEY]);
    }
  })();

  try {
    await migrationPromise;
  } finally {
    migrationPromise = null;
  }
}

export async function storageGet<T>(keys: string[]): Promise<Record<string, T>> {
  await migrateLegacySyncStorageIfNeeded();
  return areaGet<T>(getLocalStorageArea(), keys);
}

export async function storageSet(values: Record<string, unknown>): Promise<void> {
  await migrateLegacySyncStorageIfNeeded();
  await areaSet(getLocalStorageArea(), values);
}

export async function getSettings(): Promise<Settings> {
  const stored = await storageGet<Settings>([STORAGE_KEY]);
  return sanitizeSettings(stored[STORAGE_KEY] || null);
}

export async function saveSettings(settings: Settings): Promise<void> {
  await storageSet({ [STORAGE_KEY]: sanitizeSettings(settings) });
}

export async function ensureDefaults(): Promise<void> {
  const next = await getSettings();
  await storageSet({ [STORAGE_KEY]: next });
}

export async function getOverlayDomainStateMap(): Promise<Record<string, OverlayDomainState>> {
  const stored = await storageGet<Record<string, OverlayDomainState>>([OVERLAY_DOMAIN_STATE_KEY]);
  return stored[OVERLAY_DOMAIN_STATE_KEY] || {};
}

export async function updateOverlayDomainState(domain: string, patch: Partial<OverlayDomainState>): Promise<void> {
  if (!domain) return;
  const map = await getOverlayDomainStateMap();
  map[domain] = { ...(map[domain] || { visible: false }), ...patch };
  await storageSet({ [OVERLAY_DOMAIN_STATE_KEY]: map });
}
