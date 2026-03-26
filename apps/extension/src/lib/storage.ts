import { DEFAULT_PROFILE } from "@cygnet/shared";
import type { Settings, OverlayDomainState } from "@cygnet/shared";

const STORAGE_KEY = "settings";
const OVERLAY_DOMAIN_STATE_KEY = "overlayDomainState";

function getStorageArea(): chrome.storage.StorageArea {
  return chrome.storage.sync ?? chrome.storage.local;
}

export async function storageGet<T>(keys: string[]): Promise<Record<string, T>> {
  return new Promise((resolve, reject) => {
    getStorageArea().get(keys, (result) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve(result as Record<string, T>);
    });
  });
}

export async function storageSet(values: Record<string, unknown>): Promise<void> {
  return new Promise((resolve, reject) => {
    getStorageArea().set(values, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve();
    });
  });
}

export async function getSettings(): Promise<Settings> {
  const stored = await storageGet<Settings>([STORAGE_KEY]);
  return stored[STORAGE_KEY] || { enabled: true, profile: { ...DEFAULT_PROFILE } };
}

export async function saveSettings(settings: Settings): Promise<void> {
  await storageSet({ [STORAGE_KEY]: settings });
}

export async function ensureDefaults(): Promise<void> {
  const stored = await storageGet<Settings>([STORAGE_KEY]);
  if (!stored[STORAGE_KEY]) {
    await storageSet({ [STORAGE_KEY]: { enabled: true, profile: { ...DEFAULT_PROFILE } } });
    return;
  }
  const merged: Settings = {
    enabled: stored[STORAGE_KEY].enabled ?? true,
    profile: { ...DEFAULT_PROFILE, ...(stored[STORAGE_KEY].profile || {}) },
  };
  await storageSet({ [STORAGE_KEY]: merged });
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
