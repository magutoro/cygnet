import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import WorkflowSlideshow from "@/components/WorkflowSlideshow";
import { SITE_COPY } from "@/content/site-copy";
import {
  LANGUAGE_COOKIE_KEY,
  detectLanguageFromAcceptLanguage,
  normalizeLanguage,
} from "@/lib/language";

const CHROME_WEB_STORE_URL =
  "https://chromewebstore.google.com/detail/cygnet/glgmodddifcigjdkpjefebdkmpgabnnp";

export const metadata: Metadata = {
  title: "How It Works – Cygnet",
  description:
    "A step-by-step guide to Cygnet: profile setup, autofill, application tracking, Gmail schedule detection, and Google Calendar.",
};

const DETAIL_COPY = {
  en: {
    eyebrow: "How it works",
    title: "A calmer way to move through job applications.",
    subtitle:
      "Cygnet is built around one simple idea: keep the reusable parts in your profile, then review before anything important is submitted or added to your calendar.",
    cta: "Add to Chrome",
    stepsTitle: "Detailed step by step",
    steps: [
      {
        title: "Create your profile",
        body: "Save the details that Japanese application forms ask for again and again: name, kana, address, school, graduation date, links, and contact information.",
      },
      {
        title: "Open an application form",
        body: "When you visit a supported form, Cygnet checks the page structure and prepares safe matches for the fields it understands.",
      },
      {
        title: "Autofill when ready",
        body: "Use Auto mode for speed or Manual mode when you want to click first. Either way, you still review the page before submitting.",
      },
      {
        title: "Track next steps",
        body: "Save applications, statuses, interview dates, follow-ups, and notes so your next action is easier to see.",
      },
      {
        title: "Review Gmail detections",
        body: "If you connect Gmail, Cygnet searches recent job-related messages and shows schedule candidates for approval instead of adding everything automatically.",
      },
      {
        title: "Send approved dates to Calendar",
        body: "Once a candidate looks right, approve it and Cygnet can create the Google Calendar event for you.",
      },
    ],
  },
  ja: {
    eyebrow: "使い方",
    title: "応募作業を、落ち着いて進めるための流れ。",
    subtitle:
      "Cygnet は、何度も使う情報をプロフィールにまとめ、重要な入力や予定追加は確認してから進める設計です。",
    cta: "Chromeに追加",
    stepsTitle: "詳しいステップ",
    steps: [
      {
        title: "プロフィールを作成",
        body: "氏名、フリガナ、住所、学校、卒業年月、リンク、連絡先など、応募フォームで何度も使う情報を保存します。",
      },
      {
        title: "応募フォームを開く",
        body: "対応しているフォームを開くと、Cygnet がページ構造を確認し、安全に対応できる入力欄を準備します。",
      },
      {
        title: "必要なタイミングで自動入力",
        body: "速く進めたいときは自動モード、確認してから押したいときは手動モードを使えます。送信前の確認は常にユーザー側です。",
      },
      {
        title: "次の予定を管理",
        body: "応募先、ステータス、面接日、フォローアップ、メモを保存して、次にやることを見やすくします。",
      },
      {
        title: "Gmailの日程候補を確認",
        body: "Gmail 連携を使う場合、最近の採用関連メールから候補を検出し、勝手に追加せず確認画面に表示します。",
      },
      {
        title: "承認した日程をCalendarへ",
        body: "候補の内容が正しければ承認し、Cygnet が Google Calendar に予定を作成できます。",
      },
    ],
  },
} as const;

export default async function HowItWorksPage() {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const lang =
    normalizeLanguage(cookieStore.get(LANGUAGE_COOKIE_KEY)?.value) ||
    detectLanguageFromAcceptLanguage(headerStore.get("accept-language"));
  const t = SITE_COPY[lang].howItWorks;
  const detail = DETAIL_COPY[lang];

  return (
    <main className="page-shell overflow-hidden">
      <section className="relative pb-16 pt-12 sm:pb-20 sm:pt-16">
        <AmbientBackground />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-3xl">
              <p className="inline-flex rounded-full border border-white/70 bg-white/58 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.84)] backdrop-blur-xl">
                {detail.eyebrow}
              </p>
              <h1 className="mt-6 text-4xl font-bold tracking-[-0.055em] text-brand-ink sm:text-5xl lg:text-6xl">
                {detail.title}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-brand-muted sm:text-lg">
                {detail.subtitle}
              </p>
            </div>
            <a
              href={CHROME_WEB_STORE_URL}
              target="_blank"
              rel="noreferrer"
              className="primary-cta-button mt-1 shrink-0 px-7 text-sm"
            >
              {detail.cta}
            </a>
          </div>

          <WorkflowSlideshow />
        </div>
      </section>

      <section className="relative pb-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">Cygnet</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-brand-ink sm:text-4xl">
                {detail.stepsTitle}
              </h2>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {detail.steps.map((step, index) => (
              <article
                key={step.title}
                className="glass-panel group rounded-[2rem] p-6 transition-transform duration-300 hover:-translate-y-1 sm:p-7"
              >
                <div className="flex gap-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand text-base font-bold text-white shadow-[0_14px_30px_rgba(15,124,171,0.2)]">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-brand-ink">{step.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-brand-muted">{step.body}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-4">
            {t.trustCues.map((cue) => (
              <div
                key={cue}
                className="glass-panel-soft flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-brand-ink"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-brand text-white">
                  <CheckIcon />
                </span>
                {cue}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function AmbientBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="liquid-drift-slow absolute -top-24 -left-16 h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.98),rgba(211,232,253,0.44)_30%,rgba(160,197,240,0.12)_56%,transparent_76%)] blur-3xl" />
      <div className="liquid-drift-medium absolute top-10 -right-16 h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.92),rgba(196,221,248,0.42)_30%,rgba(138,185,235,0.12)_58%,transparent_78%)] blur-3xl" />
      <div className="liquid-shimmer absolute top-28 left-1/3 h-64 w-[28rem] rounded-full bg-[linear-gradient(120deg,rgba(255,255,255,0),rgba(255,255,255,0.8),rgba(255,255,255,0))] opacity-30 blur-3xl" />
    </div>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth={2.4}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}
