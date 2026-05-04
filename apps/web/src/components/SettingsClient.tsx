"use client";

import { useState } from "react";
import { GOOGLE_WORKSPACE_SCOPES, type GoogleWorkspaceIntegrationSummary } from "@cygnet/shared";
import { useLanguage } from "@/components/LanguageProvider";

const COPY = {
  en: {
    title: "Settings",
    subtitle: "Manage your account, connected Google access, and Cygnet data.",
    accountTitle: "Account",
    signedInAs: "Signed in as",
    workspaceTitle: "Google access",
    workspaceDesc:
      "Calendar and Gmail are optional and separate from basic Google sign-in. Disconnecting them keeps your Cygnet account but stops calendar actions and Gmail schedule detection.",
    connected: "Connected",
    notConnected: "Not connected",
    permissionOn: "On",
    permissionOff: "Off",
    calendar: "Google Calendar events",
    gmail: "Gmail schedule detection",
    lastSynced: "Last synced",
    neverSynced: "Not synced yet",
    manageHint:
      "If access is missing or revoked, reconnect from Calendar when you need Calendar or Gmail again.",
    disconnect: "Disconnect Google access",
    disconnecting: "Disconnecting...",
    disconnected: "Google access was disconnected.",
    disconnectError: "Could not disconnect Google access.",
    dangerTitle: "Delete account",
    dangerDesc:
      "This permanently deletes your Cygnet account, profile, resumes, applications, and Google integration data. This cannot be undone.",
    confirmLabel: "Type your email to confirm",
    deleteAccount: "Delete account",
    deleting: "Deleting...",
    deleteError: "Could not delete account.",
  },
  ja: {
    title: "設定",
    subtitle: "アカウント、Google 連携、Cygnet データを管理します。",
    accountTitle: "アカウント",
    signedInAs: "ログイン中",
    workspaceTitle: "Google 連携",
    workspaceDesc:
      "Calendar と Gmail は任意で、通常の Google ログインとは別扱いです。解除しても Cygnet アカウントは残りますが、カレンダー追加と Gmail 日程検出は停止します。",
    connected: "連携済み",
    notConnected: "未連携",
    permissionOn: "オン",
    permissionOff: "オフ",
    calendar: "Google Calendar の予定",
    gmail: "Gmail の日程検出",
    lastSynced: "最終同期",
    neverSynced: "まだ同期されていません",
    manageHint:
      "権限が不足している場合や解除後に再度使いたい場合は、カレンダーページから再連携できます。",
    disconnect: "Google 連携を解除",
    disconnecting: "解除中...",
    disconnected: "Google 連携を解除しました。",
    disconnectError: "Google 連携を解除できませんでした。",
    dangerTitle: "アカウント削除",
    dangerDesc:
      "Cygnet アカウント、プロフィール、履歴書、応募情報、Google 連携データを完全に削除します。この操作は取り消せません。",
    confirmLabel: "確認のためメールアドレスを入力",
    deleteAccount: "アカウントを削除",
    deleting: "削除中...",
    deleteError: "アカウントを削除できませんでした。",
  },
} as const;

function PermissionRow({
  label,
  enabled,
  enabledLabel,
  disabledLabel,
}: {
  label: string;
  enabled: boolean;
  enabledLabel: string;
  disabledLabel: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/60 bg-white/48 px-4 py-3">
      <span className="text-sm font-medium text-brand-ink">{label}</span>
      <span
        className={`rounded-full px-3 py-1 text-xs font-semibold ${
          enabled
            ? "bg-[rgba(220,248,238,0.9)] text-[#1e6957]"
            : "bg-white/70 text-brand-muted"
        }`}
      >
        {enabled ? enabledLabel : disabledLabel}
      </span>
    </div>
  );
}

export default function SettingsClient({
  userEmail,
  initialIntegration,
}: {
  userEmail: string;
  initialIntegration: GoogleWorkspaceIntegrationSummary;
}) {
  const { lang } = useLanguage();
  const t = COPY[lang];
  const [integration, setIntegration] =
    useState<GoogleWorkspaceIntegrationSummary>(initialIntegration);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [disconnecting, setDisconnecting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmation, setConfirmation] = useState("");

  const calendarEnabled = integration.scopes.includes(GOOGLE_WORKSPACE_SCOPES.calendarEvents);
  const gmailEnabled =
    integration.scopes.includes(GOOGLE_WORKSPACE_SCOPES.gmailReadonly) ||
    integration.scopes.includes(GOOGLE_WORKSPACE_SCOPES.gmailLabels);
  const canDelete = confirmation.trim() === userEmail || confirmation.trim() === "DELETE";

  async function handleDisconnect() {
    setDisconnecting(true);
    setNotice("");
    setError("");

    try {
      const response = await fetch("/api/integrations/google/disconnect", {
        method: "POST",
      });
      if (!response.ok) throw new Error("disconnect_failed");
      setIntegration({
        connected: false,
        googleEmail: "",
        scopes: [],
        labelName: "Cygnet",
        autoCalendarSyncEnabled: true,
        lastSyncedAt: "",
        lastSyncError: "",
      });
      setNotice(t.disconnected);
    } catch {
      setError(t.disconnectError);
    } finally {
      setDisconnecting(false);
    }
  }

  async function handleDeleteAccount() {
    if (!canDelete) return;
    setDeleting(true);
    setNotice("");
    setError("");

    try {
      const response = await fetch("/api/account/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ confirmation }),
      });
      if (!response.ok) throw new Error("delete_failed");
      window.location.assign("/");
    } catch {
      setError(t.deleteError);
      setDeleting(false);
    }
  }

  return (
    <main className="page-shell">
      <section className="mx-auto max-w-5xl px-6 py-12 sm:py-16">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">
            Cygnet
          </p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.04em] text-brand-ink">
            {t.title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-brand-muted sm:text-base">
            {t.subtitle}
          </p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,0.7fr)]">
          <section className="glass-panel rounded-[1.75rem] p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-brand-ink">{t.workspaceTitle}</h2>
            <p className="mt-2 text-sm leading-relaxed text-brand-muted">
              {t.workspaceDesc}
            </p>

            <div className="mt-5 rounded-2xl border border-white/65 bg-white/50 p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-sm font-semibold text-brand-ink">
                    {integration.connected
                      ? integration.googleEmail || userEmail
                      : t.notConnected}
                  </div>
                  <div className="mt-1 text-xs text-brand-muted">
                    {integration.connected ? t.connected : t.notConnected}
                  </div>
                </div>
                {integration.connected ? (
                  <button
                    type="button"
                    onClick={handleDisconnect}
                    disabled={disconnecting}
                    className="glass-button-secondary h-10 rounded-lg px-4 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {disconnecting ? t.disconnecting : t.disconnect}
                  </button>
                ) : null}
              </div>

              <div className="mt-5 grid gap-3">
                <PermissionRow
                  label={t.calendar}
                  enabled={calendarEnabled}
                  enabledLabel={t.permissionOn}
                  disabledLabel={t.permissionOff}
                />
                <PermissionRow
                  label={t.gmail}
                  enabled={gmailEnabled}
                  enabledLabel={t.permissionOn}
                  disabledLabel={t.permissionOff}
                />
              </div>

              <div className="mt-4 text-xs leading-relaxed text-brand-muted">
                <p>
                  {t.lastSynced}:{" "}
                  {integration.lastSyncedAt
                    ? new Intl.DateTimeFormat(lang === "ja" ? "ja-JP" : "en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      }).format(new Date(integration.lastSyncedAt))
                    : t.neverSynced}
                </p>
                <p className="mt-2">{t.manageHint}</p>
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <section className="glass-panel rounded-[1.75rem] p-6">
              <h2 className="text-xl font-semibold text-brand-ink">{t.accountTitle}</h2>
              <p className="mt-3 text-sm text-brand-muted">{t.signedInAs}</p>
              <p className="mt-1 break-all text-sm font-semibold text-brand-ink">
                {userEmail}
              </p>
            </section>

            <section className="rounded-[1.75rem] border border-[rgba(236,177,186,0.74)] bg-[rgba(255,244,246,0.68)] p-6 shadow-[0_24px_68px_rgba(169,59,78,0.08)] backdrop-blur-xl">
              <h2 className="text-xl font-semibold text-[#a93b4e]">{t.dangerTitle}</h2>
              <p className="mt-2 text-sm leading-relaxed text-brand-muted">
                {t.dangerDesc}
              </p>
              <label className="mt-5 block text-sm font-semibold text-brand-ink">
                {t.confirmLabel}
                <input
                  value={confirmation}
                  onChange={(event) => setConfirmation(event.target.value)}
                  className="glass-input mt-2 h-11 w-full rounded-xl px-4 text-sm"
                  placeholder={userEmail}
                />
              </label>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={!canDelete || deleting}
                className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-lg bg-[#a93b4e] px-4 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-45"
              >
                {deleting ? t.deleting : t.deleteAccount}
              </button>
            </section>
          </aside>
        </div>

        {notice ? (
          <div className="glass-alert-success mt-6 rounded-2xl px-4 py-3 text-sm">
            {notice}
          </div>
        ) : null}
        {error ? (
          <div className="glass-alert-error mt-6 rounded-2xl px-4 py-3 text-sm">
            {error}
          </div>
        ) : null}
      </section>
    </main>
  );
}
