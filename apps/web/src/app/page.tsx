"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";

const COPY = {
  en: {
    heroBadge: "Free Chrome Extension",
    heroTitle: "Make Japanese job applications painless.",
    heroTitleEmphasis: "painless.",
    heroSubtitle:
      "Autofill shuukatsu forms with your saved profile — name, address, education, career — accurately formatted and ready in one click.",
    addToChrome: "Add to Chrome",
    howItWorksCta: "See how it works",
    howItWorksTag: "How it works",
    howItWorksTitle: "Three steps, zero hassle",
    steps: [
      {
        num: "1",
        title: "Save your profile",
        desc: "Enter your info once — name, address, education, career — and Cygnet remembers it.",
      },
      {
        num: "2",
        title: "Open a job site",
        desc: "Navigate to any supported Japanese job application form — Rikunabi, MyNavi, and more.",
      },
      {
        num: "3",
        title: "Autofill instantly",
        desc: "Click the Cygnet button and watch every field populate — correctly formatted, in seconds.",
      },
    ],
    featuresTag: "Features",
    featuresTitle: "Everything you need for shuukatsu",
    features: [
      {
        title: "Autofill forms",
        desc: "One click fills name, address, education, career — mapped to each site's specific field structure.",
      },
      {
        title: "Furigana helper",
        desc: "Automatically converts kanji names to hiragana and katakana readings — no more manual lookup.",
      },
      {
        title: "Address formatting",
        desc: "Postal code lookup, prefecture auto-selection, and proper Japanese address formatting built in.",
      },
      {
        title: "Multi-site support",
        desc: "Works across Rikunabi, MyNavi, and other major Japanese job platforms out of the box.",
      },
    ],
    trustTitle: "Your data stays yours",
    trustDesc:
      "Cygnet stores everything locally in your browser. No remote servers, no analytics, no tracking. Your profile never leaves your machine unless you choose to autofill a form.",
    trustPoint1: "100% local storage",
    trustPoint2: "No analytics or telemetry",
    trustPoint3: "Open source",
    ctaTitle: "Ready to simplify shuukatsu?",
    ctaDesc: "Install Cygnet for free and never hand-type the same info again.",
    ctaButton: "Add to Chrome — it's free",
    privacyPolicy: "Privacy Policy",
    contact: "Contact",
    rightsReserved: "All rights reserved.",
  },
  ja: {
    heroBadge: "無料のChrome拡張機能",
    heroTitle: "日本語の就活エントリーを、もっとラクに。",
    heroTitleEmphasis: "もっとラクに。",
    heroSubtitle:
      "名前・住所・学歴・職歴を保存しておけば、就活フォームへワンクリックで自動入力できます。",
    addToChrome: "Chromeに追加",
    howItWorksCta: "使い方を見る",
    howItWorksTag: "使い方",
    howItWorksTitle: "3ステップで入力完了",
    steps: [
      {
        num: "1",
        title: "プロフィールを保存",
        desc: "名前、住所、学歴、職歴を一度入力すれば、Cygnetが記憶します。",
      },
      {
        num: "2",
        title: "応募フォームを開く",
        desc: "対応している日本の求人応募フォームを開きます（リクナビ、マイナビなど）。",
      },
      {
        num: "3",
        title: "ワンクリックで自動入力",
        desc: "Cygnetをクリックすると、必要な形式に合わせて一気に入力されます。",
      },
    ],
    featuresTag: "機能",
    featuresTitle: "就活に必要な機能をひとつに",
    features: [
      {
        title: "フォーム自動入力",
        desc: "サイトごとの入力欄構造に合わせて、プロフィール情報を自動で入力します。",
      },
      {
        title: "ふりがな補助",
        desc: "漢字氏名からひらがな・カタカナを補助変換し、入力の手間を減らします。",
      },
      {
        title: "住所フォーマット対応",
        desc: "郵便番号、都道府県、住所の形式を日本の応募フォーム向けに整えます。",
      },
      {
        title: "主要サイト対応",
        desc: "リクナビ、マイナビなど主要な日本の就活サイトで利用できます。",
      },
    ],
    trustTitle: "データはあなたの手元に",
    trustDesc:
      "Cygnetのデータはブラウザ内に保存されます。不要な解析やトラッキングは行いません。",
    trustPoint1: "ローカル保存 100%",
    trustPoint2: "解析・トラッキングなし",
    trustPoint3: "オープンソース",
    ctaTitle: "就活入力をもっと速く",
    ctaDesc: "Cygnetを無料で使い始めましょう。",
    ctaButton: "Chromeに追加（無料）",
    privacyPolicy: "プライバシーポリシー",
    contact: "お問い合わせ",
    rightsReserved: "All rights reserved.",
  },
} as const;

const STEP_ICONS = [
  (
    <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  ),
  (
    <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A8.966 8.966 0 0 1 3 12c0-1.264.26-2.467.729-3.558" />
    </svg>
  ),
  (
    <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
    </svg>
  ),
];

const FEATURE_ICONS = [
  (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15a2.25 2.25 0 0 1 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
    </svg>
  ),
  (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m10.5 21 5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 0 1-3.827-5.802" />
    </svg>
  ),
  (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
  ),
  (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 0 0 2.25-2.25V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v2.25A2.25 2.25 0 0 0 6 10.5Zm0 9.75h2.25A2.25 2.25 0 0 0 10.5 18v-2.25a2.25 2.25 0 0 0-2.25-2.25H6a2.25 2.25 0 0 0-2.25 2.25V18A2.25 2.25 0 0 0 6 20.25Zm9.75-9.75H18a2.25 2.25 0 0 0 2.25-2.25V6A2.25 2.25 0 0 0 18 3.75h-2.25A2.25 2.25 0 0 0 13.5 6v2.25a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  ),
];

export default function HomePage() {
  const { lang } = useLanguage();
  const t = COPY[lang];

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(circle at 20% 0%, #cde8ff 0%, transparent 50%), radial-gradient(circle at 80% 10%, #d8f0ff 0%, transparent 40%), linear-gradient(180deg, var(--bg-soft) 0%, var(--bg) 100%)",
          }}
        />
        <div className="mx-auto max-w-4xl px-6 pb-24 pt-24 text-center sm:pt-32">
          <p className="mb-4 inline-block rounded-full border border-brand-line bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-brand-strong">
            {t.heroBadge}
          </p>
          <h1 className="mx-auto max-w-3xl text-4xl font-extrabold leading-[1.15] tracking-tight text-brand-ink sm:text-5xl lg:text-6xl">
            {t.heroTitle.replace(t.heroTitleEmphasis, "")}
            <span className="bg-gradient-to-r from-brand to-brand-strong bg-clip-text text-transparent">
              {t.heroTitleEmphasis}
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-brand-muted">
            {t.heroSubtitle}
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="#"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-strong px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand/25 transition-all hover:bg-brand-ink hover:shadow-brand/40"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              {t.addToChrome}
            </a>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 rounded-xl border border-brand-line bg-white px-8 py-3.5 text-sm font-semibold text-brand-ink transition-all hover:border-brand hover:shadow-md"
            >
              {t.howItWorksCta}
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-24">
        <div className="mx-auto max-w-5xl px-6">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-brand">
            {t.howItWorksTag}
          </p>
          <h2 className="mt-3 text-center text-3xl font-bold tracking-tight text-brand-ink sm:text-4xl">
            {t.howItWorksTitle}
          </h2>
          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {t.steps.map((s, index) => (
              <div key={s.num} className="relative text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand/20 to-brand-strong/20 text-brand-strong">
                  {STEP_ICONS[index]}
                </div>
                <div className="mb-2 text-xs font-bold uppercase tracking-widest text-brand">
                  Step {s.num}
                </div>
                <h3 className="text-lg font-semibold text-brand-ink">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-muted">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-brand-line/60 bg-white/50 py-24">
        <div className="mx-auto max-w-5xl px-6">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-brand">
            {t.featuresTag}
          </p>
          <h2 className="mt-3 text-center text-3xl font-bold tracking-tight text-brand-ink sm:text-4xl">
            {t.featuresTitle}
          </h2>
          <div className="mt-16 grid gap-6 sm:grid-cols-2">
            {t.features.map((f, index) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-brand-line bg-white p-6 shadow-sm transition-all hover:border-brand/40 hover:shadow-md"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-bg text-brand-strong transition-colors group-hover:bg-brand-strong group-hover:text-white">
                  {FEATURE_ICONS[index]}
                </div>
                <h3 className="text-base font-semibold text-brand-ink">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-muted">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand/20 to-brand-strong/20 text-brand-strong">
            <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-brand-ink sm:text-4xl">
            {t.trustTitle}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-brand-muted">
            {t.trustDesc}
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-8 text-sm text-brand-muted">
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-brand-strong" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              {t.trustPoint1}
            </div>
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-brand-strong" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              {t.trustPoint2}
            </div>
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-brand-strong" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              {t.trustPoint3}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-brand-line/60 bg-gradient-to-b from-white/50 to-brand-bg py-24">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-brand-ink sm:text-4xl">
            {t.ctaTitle}
          </h2>
          <p className="mt-4 text-lg text-brand-muted">{t.ctaDesc}</p>
          <a
            href="#"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-brand-strong px-10 py-4 text-sm font-semibold text-white shadow-lg shadow-brand/25 transition-all hover:bg-brand-ink hover:shadow-brand/40"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            {t.ctaButton}
          </a>
        </div>
      </section>

      <footer className="border-t border-brand-line/60 bg-white/40">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 py-10 sm:flex-row">
          <div className="text-sm font-semibold text-brand-ink">Cygnet</div>
          <div className="flex gap-6 text-sm text-brand-muted">
            <Link href="/privacy" className="transition-colors hover:text-brand-ink">
              {t.privacyPolicy}
            </Link>
            <Link href="/contact" className="transition-colors hover:text-brand-ink">
              {t.contact}
            </Link>
          </div>
          <p className="text-xs text-brand-muted">
            &copy; {new Date().getFullYear()} Cygnet. {t.rightsReserved}
          </p>
        </div>
      </footer>
    </div>
  );
}
