"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import type { Profile } from "@cygnet/shared";
import type { DbResume } from "@cygnet/shared";
import ProfileEditor, { type ProfileEditorHandle } from "./ProfileEditor";
import ResumeManager from "./ResumeManager";
import { createClient } from "@/lib/supabase/client";
import { syncExtensionSessionFromWeb } from "@/lib/extension-bridge";
import { useLanguage } from "@/components/LanguageProvider";

interface Props {
  initialProfile: Profile;
  userId: string;
  initialResumes: DbResume[];
}

const DASHBOARD_COPY = {
  ja: {
    bridgeTitle: "拡張機能との接続",
    bridgeDesc: "拡張機能が接続されていれば、プロフィール保存後に自動同期されます。うまくいかないときだけ再接続してください。",
    syncing: "接続中...",
    syncNow: "再接続する",
    noSession: "Webログインセッションを取得できませんでした",
    syncFailed: "拡張機能の接続に失敗",
    synced: "拡張機能を接続しました",
  },
  en: {
    bridgeTitle: "Extension connection",
    bridgeDesc: "When the extension is connected, profile saves sync automatically. Use this only if you need to reconnect or repair sync.",
    syncing: "Connecting...",
    syncNow: "Reconnect extension",
    noSession: "Could not get web login session",
    syncFailed: "Failed to connect extension",
    synced: "Extension connected",
  },
} as const;

export default function DashboardClient({
  initialProfile,
  userId,
  initialResumes,
}: Props) {
  const { lang } = useLanguage();
  const t = DASHBOARD_COPY[lang];
  const profileRef = useRef<ProfileEditorHandle>(null);
  const [bridgeStatus, setBridgeStatus] = useState("");
  const [bridgeBusy, setBridgeBusy] = useState(false);

  const handleParsed = useCallback((partial: Partial<Profile>) => {
    profileRef.current?.applyPartial(partial);
    document
      .getElementById("profile-editor-section")
      ?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const syncSessionToExtension = useCallback(async (silent = false) => {
    if (!silent) setBridgeBusy(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) {
        if (!silent) setBridgeStatus(t.noSession);
        return;
      }

      const result = await syncExtensionSessionFromWeb({
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
      });

      if (!result.ok) {
        if (!silent) {
          setBridgeStatus(`${t.syncFailed}: ${result.error}`);
        }
        return;
      }

      setBridgeStatus(
        result.email
          ? `${t.synced} (${result.email})`
          : t.synced,
      );
    } finally {
      if (!silent) setBridgeBusy(false);
    }
  }, [t.noSession, t.syncFailed, t.synced]);

  useEffect(() => {
    const run = () => syncSessionToExtension(true).catch(() => {});
    run();
    const timerId = window.setTimeout(run, 1200);
    return () => window.clearTimeout(timerId);
  }, [syncSessionToExtension]);

  return (
    <div className="space-y-4">
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div id="profile-editor-section">
          <ProfileEditor
            ref={profileRef}
            initialProfile={initialProfile}
            userId={userId}
          />
        </div>
        <ResumeManager
          userId={userId}
          initialResumes={initialResumes}
          onProfileParsed={handleParsed}
        />
      </div>

      <div className="rounded-2xl border border-brand-line bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-brand-ink">{t.bridgeTitle}</p>
            <p className="text-xs text-brand-muted">
              {t.bridgeDesc}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              syncSessionToExtension(false).catch(() => {});
            }}
            disabled={bridgeBusy}
            className="rounded-lg border border-brand-line px-3 py-2 text-xs font-medium text-brand-muted transition-colors hover:border-brand hover:text-brand-ink disabled:cursor-not-allowed disabled:opacity-60"
          >
            {bridgeBusy ? t.syncing : t.syncNow}
          </button>
        </div>
        {bridgeStatus && <p className="mt-2 text-xs text-brand-muted">{bridgeStatus}</p>}
      </div>
    </div>
  );
}
