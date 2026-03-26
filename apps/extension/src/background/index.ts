import { DEFAULT_PROFILE } from "@cygnet/shared";
import { getSession } from "../lib/auth.js";
import {
  captureCredentialFromForm,
  deleteCredentialEntry,
  findBestCredentialEntry,
  getCredentialVaultState,
  listCredentialEntries,
  lockCredentialVault,
  unlockCredentialVault,
  upsertCredentialEntry
} from "../lib/credentials.js";
import { ensureDefaults } from "../lib/storage.js";
import { queryTabs, sendMessage, sendMessageIgnoringErrors } from "../lib/tabs.js";
import { openWebDashboard, openWebLogin } from "../lib/web.js";
import { supabase } from "../lib/supabase.js";
import { syncProfile } from "../lib/sync.js";

const DEFAULT_SETTINGS = {
  enabled: true,
  profile: DEFAULT_PROFILE,
};

const TRUSTED_EXTERNAL_ORIGINS = new Set(["http://localhost:3000", "http://127.0.0.1:3000"]);
const STATE_VERSION_KEY = "cygnetStateVersion";

function getSenderOrigin(url: string | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

function isUnsupportedUrl(url: string | undefined): boolean {
  const raw = String(url || "").trim().toLowerCase();
  if (!raw) return true;
  return (
    raw.startsWith("chrome://") ||
    raw.startsWith("edge://") ||
    raw.startsWith("about:") ||
    raw.startsWith("chrome-extension://") ||
    raw.includes("chromewebstore.google.com")
  );
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function tryShowLauncher(tabId: number): Promise<boolean> {
  try {
    const response = (await sendMessage(tabId, {
      type: "CYGNET_SHOW_LAUNCHER",
    })) as { ok?: boolean } | undefined;
    return Boolean(response?.ok);
  } catch {
    return false;
  }
}

async function injectContentScriptsIntoTab(tabId: number): Promise<void> {
  const manifest = chrome.runtime.getManifest();
  const files = Array.from(
    new Set(
      (manifest.content_scripts || [])
        .flatMap((item) => item.js || [])
        .filter((file): file is string => typeof file === "string" && file.length > 0),
    ),
  );
  if (!files.length) return;

  await new Promise<void>((resolve, reject) => {
    chrome.scripting.executeScript(
      {
        target: { tabId },
        files,
      },
      () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        resolve();
      },
    );
  });
}

async function openInPagePanelFromTab(tab: chrome.tabs.Tab): Promise<boolean> {
  if (!tab?.id || isUnsupportedUrl(tab.url)) return false;
  if (await tryShowLauncher(tab.id)) return true;

  // Tabs that were already open before extension update/load may not have the
  // content script yet. Inject once, then retry launcher message.
  await injectContentScriptsIntoTab(tab.id).catch(() => {});

  for (let attempt = 0; attempt < 2; attempt += 1) {
    await delay(120);
    if (await tryShowLauncher(tab.id)) return true;
  }

  return false;
}

async function setStateVersion(): Promise<void> {
  await new Promise<void>((resolve) => {
    chrome.storage.local.set({ [STATE_VERSION_KEY]: Date.now() }, () => {
      void chrome.runtime.lastError;
      resolve();
    });
  });
}

function broadcastRuntimeRefresh(): void {
  chrome.runtime.sendMessage({ type: "CYGNET_REFRESH_STATE" }, () => {
    void chrome.runtime.lastError;
  });
}

async function broadcastRefreshToTabs(): Promise<void> {
  const tabs = await queryTabs({});
  for (const tab of tabs) {
    if (!tab?.id || isUnsupportedUrl(tab.url)) continue;
    sendMessageIgnoringErrors(tab.id, { type: "CYGNET_REFRESH_STATE" });
  }
}

async function notifyStateChanged(): Promise<void> {
  await setStateVersion().catch(() => {});
  broadcastRuntimeRefresh();
  await broadcastRefreshToTabs().catch(() => {});
}

chrome.runtime.onInstalled.addListener(() => {
  ensureDefaults().catch((err) => console.error("Failed to initialize settings", err));
});

chrome.action.onClicked.addListener(async (tab) => {
  if (isUnsupportedUrl(tab?.url)) {
    await openWebDashboard().catch(() => {});
    return;
  }

  const opened = await openInPagePanelFromTab(tab);
  // Do not redirect to dashboard on normal pages if side panel launch failed.
  // This avoids unexpected navigation and keeps click behavior focused.
  if (!opened) return;
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== "run-autofill") return;
  const session = await getSession();
  if (!session?.user) {
    await openWebDashboard().catch(() => {});
    return;
  }
  const tabs = await queryTabs({ active: true, currentWindow: true });
  const tabId = tabs[0]?.id;
  if (!tabId) return;
  sendMessageIgnoringErrors(tabId, { type: "AUTOFILL_NOW" });
});

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === "GET_DEFAULTS") {
    sendResponse({ defaults: DEFAULT_SETTINGS });
    return;
  }

  if (msg?.type === "GET_AUTH_STATE") {
    getSession()
      .then((session) =>
        sendResponse({
          authenticated: Boolean(session?.user),
          email: session?.user?.email ?? null,
        }),
      )
      .catch((err) => sendResponse({ authenticated: false, error: String(err) }));
    return true;
  }

  if (msg?.type === "OPEN_WEB_LOGIN") {
    openWebLogin()
      .then(() => sendResponse({ ok: true }))
      .catch((err) => sendResponse({ ok: false, error: String(err) }));
    return true;
  }

  if (msg?.type === "OPEN_WEB_DASHBOARD" || msg?.type === "OPEN_OPTIONS_PAGE") {
    openWebDashboard()
      .then(() => sendResponse({ ok: true }))
      .catch((err) => sendResponse({ ok: false, error: String(err) }));
    return true;
  }

  if (msg?.type === "CREDENTIAL_VAULT_STATE") {
    getCredentialVaultState()
      .then((state) => sendResponse({ ok: true, state }))
      .catch((err) => sendResponse({ ok: false, error: String(err) }));
    return true;
  }

  if (msg?.type === "CREDENTIAL_UNLOCK") {
    unlockCredentialVault(String(msg.passphrase || ""))
      .then(async (state) => {
        await notifyStateChanged();
        sendResponse({ ok: true, state });
      })
      .catch((err) => {
        const message = err instanceof Error ? err.message : String(err);
        sendResponse({ ok: false, error: message });
      });
    return true;
  }

  if (msg?.type === "CREDENTIAL_LOCK") {
    lockCredentialVault()
      .then(async () => {
        await notifyStateChanged();
        sendResponse({ ok: true });
      })
      .catch((err) => sendResponse({ ok: false, error: String(err) }));
    return true;
  }

  if (msg?.type === "CREDENTIAL_LIST") {
    listCredentialEntries()
      .then((entries) => sendResponse({ ok: true, entries }))
      .catch((err) => {
        const message = err instanceof Error ? err.message : String(err);
        sendResponse({ ok: false, error: message });
      });
    return true;
  }

  if (msg?.type === "CREDENTIAL_UPSERT") {
    upsertCredentialEntry(msg.entry || {})
      .then(async (entry) => {
        await notifyStateChanged();
        sendResponse({ ok: true, entry });
      })
      .catch((err) => {
        const message = err instanceof Error ? err.message : String(err);
        sendResponse({ ok: false, error: message });
      });
    return true;
  }

  if (msg?.type === "CREDENTIAL_DELETE") {
    deleteCredentialEntry(String(msg.id || ""))
      .then(async () => {
        await notifyStateChanged();
        sendResponse({ ok: true });
      })
      .catch((err) => sendResponse({ ok: false, error: String(err) }));
    return true;
  }

  if (msg?.type === "CREDENTIAL_MATCH") {
    findBestCredentialEntry(msg.context || {})
      .then((entry) => sendResponse({ ok: true, entry }))
      .catch((err) => sendResponse({ ok: false, error: String(err) }));
    return true;
  }

  if (msg?.type === "CREDENTIAL_CAPTURE") {
    captureCredentialFromForm(msg.payload || {})
      .then(async (entry) => {
        if (entry) await notifyStateChanged();
        sendResponse({ ok: true, captured: Boolean(entry), entry });
      })
      .catch((err) => sendResponse({ ok: false, error: String(err) }));
    return true;
  }

  if (msg?.type === "SIGN_OUT") {
    supabase.auth
      .signOut()
      .then(async () => {
        await notifyStateChanged();
        sendResponse({ ok: true });
      })
      .catch((err) => sendResponse({ ok: false, error: String(err) }));
    return true;
  }
});

chrome.runtime.onMessageExternal.addListener((msg, sender, sendResponse) => {
  if (msg?.type !== "CYGNET_IMPORT_SUPABASE_SESSION") return;

  const senderOrigin = getSenderOrigin(sender.url);
  if (!senderOrigin || !TRUSTED_EXTERNAL_ORIGINS.has(senderOrigin)) {
    sendResponse({ ok: false, error: "untrusted_sender" });
    return;
  }

  const accessToken =
    typeof msg.accessToken === "string" ? msg.accessToken.trim() : "";
  const refreshToken =
    typeof msg.refreshToken === "string" ? msg.refreshToken.trim() : "";

  if (!accessToken || !refreshToken) {
    sendResponse({ ok: false, error: "missing_tokens" });
    return;
  }

  supabase.auth
    .setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    })
    .then(async ({ data, error }) => {
      if (error) {
        sendResponse({ ok: false, error: String(error.message || error) });
        return;
      }

      await syncProfile().catch(() => {});
      await notifyStateChanged().catch(() => {});
      sendResponse({
        ok: true,
        email: data.session?.user?.email ?? null,
      });
    })
    .catch((error: unknown) => {
      sendResponse({
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      });
    });

  return true;
});
