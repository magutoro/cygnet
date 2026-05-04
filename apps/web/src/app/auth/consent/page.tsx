import Link from "next/link";
import { cookies, headers } from "next/headers";
import {
  LANGUAGE_COOKIE_KEY,
  detectLanguageFromAcceptLanguage,
  normalizeLanguage,
} from "@/lib/language";
import { isGoogleWorkspaceOAuthEnabled } from "@/lib/google-workspace-enabled";

function sanitizeNextPath(value: string | null): string {
  const candidate = String(value || "").trim();
  if (!candidate.startsWith("/")) return "/dashboard";
  if (candidate.startsWith("//")) return "/dashboard";
  return candidate;
}

const COPY = {
  en: {
    back: "Back",
    title: "Continue with Google",
    intro:
      "Use Google to sign in to Cygnet. Calendar and Gmail sync are optional and can be managed later.",
    cardTitle: "What Cygnet stores",
    bullets: [
      "Profile, resumes, and applications can sync through Cygnet's secured backend.",
      "Saved login passwords stay local-only in the extension and are not uploaded to Cygnet.",
      "Human access is limited to support you request, security review, abuse investigation, or legal compliance.",
    ],
    permissionsTitle: "Optional sync",
    permissionsIntro:
      "Basic sign-in works without these. Turn them on only if you want Cygnet to connect those Google features.",
    calendarTitle: "Sync with Google Calendar",
    calendarBody: "Add or update interview and follow-up events from your applications.",
    gmailTitle: "Sync with Gmail",
    gmailBody:
      "Search recent job-related Gmail messages to detect schedule candidates for your review.",
    comingSoon: "Coming soon",
    unavailable:
      "Calendar/Gmail sync is paused for public users until Google verification is complete.",
    legalIntro: "By continuing, you agree to Cygnet's",
    privacy: "Privacy Policy",
    terms: "Terms of Service",
    and: "and",
    securityNote:
      "No method of transmission or storage is completely secure, and Cygnet cannot guarantee absolute security.",
    continue: "Continue with Google",
  },
  ja: {
    back: "戻る",
    title: "Googleで続行",
    intro:
      "Google で Cygnet にログインします。Calendar / Gmail 同期は任意で、あとから管理できます。",
    cardTitle: "Cygnet が保存するもの",
    bullets: [
      "プロフィール・履歴書・応募情報は Cygnet の保護されたバックエンドで同期できます。",
      "保存済みログインパスワードは拡張機能内のローカル保存のみで、Cygnet へアップロードされません。",
      "人による閲覧は、サポート依頼、セキュリティ確認、不正利用調査、法令対応が必要な場合に限られます。",
    ],
    permissionsTitle: "任意の同期",
    permissionsIntro:
      "通常ログインには不要です。Google 機能を連携したい場合だけオンにしてください。",
    calendarTitle: "Google Calendar と同期",
    calendarBody: "応募情報から面接・次回対応の予定を追加、更新できます。",
    gmailTitle: "Gmail と同期",
    gmailBody:
      "最近の採用関連メールを検索し、確認用の日程候補を検出します。",
    comingSoon: "準備中",
    unavailable:
      "Google の確認が完了するまで、公開環境では Calendar / Gmail 同期を停止しています。",
    legalIntro: "続行すると Cygnet の",
    privacy: "プライバシーポリシー",
    terms: "利用規約",
    and: "と",
    securityNote:
      "インターネット送信や電子保存に絶対的に安全な方法は存在せず、Cygnet は完全な安全性を保証できません。",
    continue: "Google で続行",
  },
} as const;

export default async function AuthConsentPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const lang =
    normalizeLanguage(cookieStore.get(LANGUAGE_COOKIE_KEY)?.value) ||
    detectLanguageFromAcceptLanguage(headerStore.get("accept-language"));
  const t = COPY[lang];
  const params = await searchParams;
  const next = sanitizeNextPath(params.next ?? null);
  const workspaceOAuthEnabled = isGoogleWorkspaceOAuthEnabled();

  return (
    <main className="page-shell">
      <div className="mx-auto max-w-2xl px-6 py-14">
        <Link
          href={next}
          className="glass-button-secondary mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          {t.back}
        </Link>

        <div className="glass-panel rounded-[2rem] p-6 shadow-none sm:p-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-brand-ink">{t.title}</h1>
          <p className="mt-3 leading-relaxed text-brand-muted">{t.intro}</p>

          <form action="/auth/login" method="get" className="mt-8 space-y-5">
            <input type="hidden" name="next" value={next} />
            <input type="hidden" name="confirmed" value="1" />

            <section className="rounded-[1.5rem] border border-white/70 bg-white/54 p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-brand">
                {t.permissionsTitle}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-brand-muted">
                {t.permissionsIntro}
              </p>
              {!workspaceOAuthEnabled ? (
                <p className="mt-3 rounded-2xl border border-[rgba(243,215,141,0.78)] bg-[rgba(255,247,214,0.72)] px-4 py-3 text-xs font-medium leading-relaxed text-[#8a5b12]">
                  {t.unavailable}
                </p>
              ) : null}
              <div className="mt-4 grid gap-3">
                <label
                  className={`glass-panel-soft flex items-start gap-3 rounded-2xl p-4 text-sm text-brand-ink ${
                    workspaceOAuthEnabled ? "cursor-pointer" : "cursor-not-allowed opacity-70"
                  }`}
                >
                  <input
                    type="checkbox"
                    name="workspaceCalendar"
                    value="1"
                    disabled={!workspaceOAuthEnabled}
                    className="glass-checkbox mt-1"
                  />
                  <span>
                    <span className="flex flex-wrap items-center gap-2 font-semibold">
                      {t.calendarTitle}
                      {!workspaceOAuthEnabled ? (
                        <span className="rounded-full bg-white/70 px-2.5 py-1 text-[11px] text-brand-muted">
                          {t.comingSoon}
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-1 block leading-relaxed text-brand-muted">
                      {t.calendarBody}
                    </span>
                  </span>
                </label>
                <label
                  className={`glass-panel-soft flex items-start gap-3 rounded-2xl p-4 text-sm text-brand-ink ${
                    workspaceOAuthEnabled ? "cursor-pointer" : "cursor-not-allowed opacity-70"
                  }`}
                >
                  <input
                    type="checkbox"
                    name="workspaceGmail"
                    value="1"
                    disabled={!workspaceOAuthEnabled}
                    className="glass-checkbox mt-1"
                  />
                  <span>
                    <span className="flex flex-wrap items-center gap-2 font-semibold">
                      {t.gmailTitle}
                      {!workspaceOAuthEnabled ? (
                        <span className="rounded-full bg-white/70 px-2.5 py-1 text-[11px] text-brand-muted">
                          {t.comingSoon}
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-1 block leading-relaxed text-brand-muted">
                      {t.gmailBody}
                    </span>
                  </span>
                </label>
              </div>
            </section>

            <details className="glass-panel-soft rounded-[1.5rem] p-4 text-sm text-brand-muted">
              <summary className="cursor-pointer font-semibold text-brand-ink">
                {t.cardTitle}
              </summary>
              <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed">
                {t.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
              <p className="mt-3 text-xs leading-relaxed">{t.securityNote}</p>
            </details>

            <p className="text-sm leading-relaxed text-brand-muted">
              {t.legalIntro}{" "}
              <Link href="/privacy" className="font-medium text-brand-strong hover:text-brand-ink">
                {t.privacy}
              </Link>{" "}
              {t.and}{" "}
              <Link href="/terms" className="font-medium text-brand-strong hover:text-brand-ink">
                {t.terms}
              </Link>
              .
            </p>

            <button
              type="submit"
              className={`inline-flex h-11 w-full items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-brand-strong font-medium leading-none text-white shadow-[0_10px_22px_rgba(77,127,181,0.18)] transition-colors hover:bg-brand-ink sm:w-auto ${
                lang === "ja" ? "px-4 text-[14px]" : "px-4 text-sm"
              }`}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {t.continue}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
