import { useCallback, useEffect, useState } from "react";
import { getSettings, saveSettings } from "../lib/storage.js";
import { queryTabs, sendMessage } from "../lib/tabs.js";
import { startSignIn, signOut, getUser, waitForUser, onAuthStateChange } from "../lib/auth.js";
import {
  getSignInBusyLabel,
  getSignInLabel,
  getSignInOpenedStatus,
  getSignInRequiredMessage,
  isUnsupportedBrowserUrl,
} from "../lib/browser.js";
import { syncProfile } from "../lib/sync.js";
import { openWebDashboard } from "../lib/web.js";
import type { Settings, AutofillResult } from "@cygnet/shared";
import type { User } from "@supabase/supabase-js";

export function App() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [status, setStatus] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const refreshState = useCallback(async () => {
    const [nextSettings, nextUser] = await Promise.all([getSettings(), getUser()]);
    setSettings(nextSettings);
    setUser(nextUser);
  }, []);

  useEffect(() => {
    refreshState().catch(() => {});
    const unsubscribe = onAuthStateChange((nextUser) => setUser(nextUser));
    const storageListener = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string
    ) => {
      if (changes.settings && (areaName === "sync" || areaName === "local")) {
        const next = changes.settings.newValue as Settings | undefined;
        if (next) setSettings(next);
      }
      if (areaName === "local" && changes.cygnetStateVersion) {
        refreshState().catch(() => {});
      }
    };

    const runtimeListener = (msg: { type?: string }) => {
      if (msg?.type === "CYGNET_REFRESH_STATE") {
        refreshState().catch(() => {});
      }
    };

    chrome.storage.onChanged.addListener(storageListener);
    chrome.runtime.onMessage.addListener(runtimeListener);
    return () => {
      unsubscribe();
      chrome.storage.onChanged.removeListener(storageListener);
      chrome.runtime.onMessage.removeListener(runtimeListener);
    };
  }, [refreshState]);

  const showSidePanel = useCallback(async (silent = false) => {
    const [tab] = await queryTabs({ active: true, currentWindow: true });
    if (!tab?.id || isUnsupportedBrowserUrl(tab.url)) {
      if (!silent) setStatus("このページではサイドポップを開けません");
      return;
    }

    try {
      const response = (await sendMessage(tab.id, {
        type: "CYGNET_SHOW_LAUNCHER",
      })) as { ok?: boolean } | undefined;
      if (!response?.ok) {
        if (!silent) setStatus("サイドポップを開けませんでした");
        return;
      }
      if (!silent) setStatus("サイドポップを開きました");
    } catch {
      if (!silent) setStatus("サイドポップを開けませんでした");
    }
  }, []);

  const handleSignIn = useCallback(async () => {
    setAuthLoading(true);
    try {
      const signInMode = await startSignIn();
      if (signInMode === "web") {
        setStatus(getSignInOpenedStatus());
        return;
      }
      const u = await waitForUser();
      if (!u) {
        throw new Error("ログインは完了しましたが、拡張機能セッションを取得できませんでした");
      }
      setUser(u);
      await syncProfile();
      const refreshed = await getSettings();
      setSettings(refreshed);
      setStatus(getSignInOpenedStatus());
    } catch (err) {
      const message = err instanceof Error ? err.message : "ログインに失敗しました";
      setStatus(`ログイン失敗: ${message}`);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    await signOut();
    setUser(null);
    setStatus("ログアウトしました");
  }, []);

  const handleToggle = useCallback(async () => {
    if (!settings) return;
    if (!user) {
      setStatus(getSignInRequiredMessage());
      return;
    }
    const next = { ...settings, enabled: !settings.enabled };
    setSettings(next);
    await saveSettings(next);
    setStatus(next.enabled ? "Autofill ON" : "Autofill OFF");
  }, [settings, user]);

  const handleFill = useCallback(async () => {
    if (!user) {
      setStatus(getSignInRequiredMessage());
      await openWebDashboard().catch(() => {});
      return;
    }
    const [tab] = await queryTabs({ active: true, currentWindow: true });
    if (!tab?.id || isUnsupportedBrowserUrl(tab.url)) {
      setStatus("このページでは実行できません");
      return;
    }
    try {
      const response = (await sendMessage(tab.id, { type: "AUTOFILL_NOW" })) as AutofillResult | undefined;
      if (!response?.ok) {
        if (response?.error === "auth_required") {
          setStatus(getSignInRequiredMessage());
          return;
        }
        setStatus("入力に失敗しました");
        return;
      }
      setStatus(`${response.result?.filled || 0}項目を入力`);
    } catch {
      setStatus("このページでは実行できません");
    }
  }, [user]);

  const handleOpenDashboard = useCallback(async () => {
    try {
      await openWebDashboard();
      setStatus("プロフィール編集画面を開きました");
    } catch {
      setStatus("プロフィール編集画面を開けませんでした");
    }
  }, []);

  const handleOpenSidePanel = useCallback(async () => {
    await showSidePanel(false);
  }, [showSidePanel]);

  if (!settings) return null;

  return (
    <main>
      <h1>Cygnet</h1>
      <p>日本語求人フォーム向け自動入力</p>

      <div className="auth-section">
        {user ? (
          <div className="auth-user">
            {user.user_metadata?.avatar_url && (
              <img className="avatar" src={user.user_metadata.avatar_url} alt="" />
            )}
            <span className="auth-email">{user.email}</span>
            <div className="auth-actions">
              <button type="button" className="auth-btn secondary" onClick={handleSignOut}>
                ログアウト
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="google-btn"
            onClick={handleSignIn}
            disabled={authLoading}
          >
            {authLoading ? getSignInBusyLabel() : getSignInLabel()}
          </button>
        )}
      </div>

      {user ? (
        <>
          <label className="toggle">
            <span>Autofill Enabled</span>
            <input type="checkbox" checked={settings.enabled} onChange={handleToggle} />
          </label>

          <button type="button" onClick={handleFill}>
            このページを入力
          </button>
          <button type="button" className="secondary" onClick={handleOpenSidePanel}>
            サイドポップを開く
          </button>
        </>
      ) : (
        <p className="status">{`${getSignInLabel()}するとAutofillが使えます。`}</p>
      )}
      <button type="button" className="secondary" onClick={handleOpenDashboard}>
        プロフィールを編集
      </button>
      {status && (
        <p className="status" role="status">
          {status}
        </p>
      )}
    </main>
  );
}
