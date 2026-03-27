import Link from "next/link";
import { cookies, headers } from "next/headers";
import {
  LANGUAGE_COOKIE_KEY,
  detectLanguageFromAcceptLanguage,
  normalizeLanguage,
} from "@/lib/language";

function sanitizeNextPath(value: string | null): string {
  const candidate = String(value || "").trim();
  if (!candidate.startsWith("/")) return "/dashboard";
  if (candidate.startsWith("//")) return "/dashboard";
  return candidate;
}

const COPY = {
  en: {
    back: "Back",
    title: "Before you create your Cygnet account",
    intro:
      "Please confirm that you understand how Cygnet handles account-backed data before continuing with Google sign-in.",
    cardTitle: "What you are acknowledging",
    bullets: [
      "Your synced profile and uploaded resumes may be stored in Cygnet's secured backend so they can appear in the web dashboard and sync across devices.",
      "Cygnet staff may access synced profile or resume data only when needed for user-requested support, security or abuse investigation, or legal compliance.",
      "Saved login passwords are different: they stay local in the extension, are protected with your local passphrase, and are not uploaded to Cygnet.",
    ],
    checkbox:
      "I understand that synced profile and resume data may be stored by Cygnet and accessed only for user-requested support, security or abuse investigation, or legal compliance, and that saved login passwords stay local-only in the extension.",
    continue: "Continue with Google",
  },
  ja: {
    back: "戻る",
    title: "Cygnet アカウント作成前の確認",
    intro:
      "Google ログインへ進む前に、Cygnet がアカウント連携データをどのように扱うかをご確認ください。",
    cardTitle: "確認していただく内容",
    bullets: [
      "同期したプロフィール情報やアップロードした履歴書は、Web ダッシュボード表示や端末間同期のために、Cygnet の保護されたバックエンドへ保存されることがあります。",
      "Cygnet 担当者が同期済みプロフィールまたは履歴書データへアクセスできるのは、ユーザーからのサポート依頼、セキュリティまたは不正利用の調査、法令対応が必要な場合に限られます。",
      "保存済みログインのパスワードは別扱いです。これらは拡張機能内だけに保存され、ローカルのパスフレーズで保護され、Cygnet へアップロードされません。",
    ],
    checkbox:
      "同期したプロフィール情報や履歴書は Cygnet に保存され、閲覧はユーザーからのサポート依頼、セキュリティまたは不正利用の調査、法令対応に限られること、また保存済みログインパスワードは拡張機能内のローカル保存のみであることを理解しました。",
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

  return (
    <main className="min-h-screen bg-brand-bg">
      <div className="mx-auto max-w-2xl px-6 py-14">
        <Link
          href={next}
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-strong transition-colors hover:text-brand-ink"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          {t.back}
        </Link>

        <div className="rounded-2xl border border-brand-line bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-extrabold tracking-tight text-brand-ink">{t.title}</h1>
          <p className="mt-3 leading-relaxed text-brand-muted">{t.intro}</p>

          <section className="mt-8 rounded-2xl border border-brand-line bg-brand-bg/50 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-brand">{t.cardTitle}</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-brand-muted">
              {t.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </section>

          <form action="/auth/login" method="get" className="mt-8 space-y-5">
            <input type="hidden" name="next" value={next} />
            <input type="hidden" name="confirmed" value="1" />

            <label className="flex items-start gap-3 rounded-xl border border-brand-line bg-white p-4 text-sm text-brand-ink">
              <input
                type="checkbox"
                name="acknowledged"
                required
                className="mt-0.5 h-4 w-4 rounded border-brand-line text-brand focus:ring-brand"
              />
              <span>{t.checkbox}</span>
            </label>

            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-strong px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-ink"
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
