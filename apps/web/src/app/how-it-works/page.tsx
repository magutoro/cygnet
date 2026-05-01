import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { cookies, headers } from "next/headers";
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
    "A visual guide to Cygnet: profile setup, autofill modes, application tracking, Gmail labels, and Google Calendar.",
};

export default async function HowItWorksPage() {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const lang =
    normalizeLanguage(cookieStore.get(LANGUAGE_COOKIE_KEY)?.value) ||
    detectLanguageFromAcceptLanguage(headerStore.get("accept-language"));
  const t = SITE_COPY[lang].howItWorks;

  return (
    <main className="page-shell overflow-hidden">
      <section className="relative py-16 sm:py-20">
        <AmbientBackground />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(360px,1fr)]">
            <div>
              <p className="inline-flex rounded-full border border-white/70 bg-white/58 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.84)] backdrop-blur-xl">
                {t.badge}
              </p>
              <h1 className="mt-6 max-w-3xl text-5xl font-bold tracking-[-0.06em] text-brand-ink sm:text-6xl lg:text-7xl">
                {t.title}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-brand-muted sm:text-lg">
                {t.subtitle}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href={CHROME_WEB_STORE_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="primary-cta-button px-7 text-sm"
                >
                  {t.primaryCta}
                </a>
                <Link href="/dashboard" className="glass-button-secondary px-7 py-3 text-sm font-semibold">
                  {t.secondaryCta}
                </Link>
              </div>
            </div>

            <ProductLoopVisual />
          </div>
        </div>
      </section>

      <section className="relative pb-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {t.steps.map((step, index) => (
              <StoryboardCard
                key={step.eyebrow}
                eyebrow={step.eyebrow}
                title={step.title}
                caption={step.caption}
                visual={STORY_VISUALS[index]}
              />
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

function StoryboardCard({
  eyebrow,
  title,
  caption,
  visual,
}: {
  eyebrow: string;
  title: string;
  caption: string;
  visual: ReactNode;
}) {
  return (
    <article className="glass-panel group flex min-h-[27rem] flex-col overflow-hidden rounded-[2rem] p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand">{eyebrow}</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-brand-ink">{title}</h2>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-brand-muted">{caption}</p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/62 text-brand shadow-[inset_0_1px_0_rgba(255,255,255,0.88)]">
          <ArrowIcon />
        </div>
      </div>
      <div className="mt-6 flex flex-1 items-center justify-center rounded-[1.6rem] border border-white/62 bg-white/42 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.68)] backdrop-blur-xl">
        {visual}
      </div>
    </article>
  );
}

const STORY_VISUALS = [
  <ProfileVisual key="profile" />,
  <ModeVisual key="mode" />,
  <FormVisual key="form" />,
  <AutofillVisual key="autofill" />,
  <TrackerVisual key="tracker" />,
  <CalendarVisual key="calendar" />,
];

function ProductLoopVisual() {
  return (
    <div className="glass-panel relative overflow-hidden rounded-[2.25rem] p-6 sm:p-8">
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.95),rgba(158,205,255,0.24)_48%,transparent_72%)] blur-2xl" />
      <div className="relative grid gap-4 sm:grid-cols-2">
        {[
          ["Profile", "Saved once"],
          ["Autofill", "One click"],
          ["Applications", "Tracked"],
          ["Calendar", "Follow-up ready"],
        ].map(([label, value], index) => (
          <div
            key={label}
            className={`rounded-[1.4rem] border border-white/70 bg-white/58 p-5 shadow-[0_18px_42px_rgba(77,127,181,0.1)] ${
              index === 3 ? "sm:-translate-y-4" : ""
            }`}
          >
            <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white">
              {index + 1}
            </div>
            <div className="text-lg font-bold text-brand-ink">{label}</div>
            <div className="mt-1 text-sm text-brand-muted">{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfileVisual() {
  return (
    <div className="w-full max-w-sm rounded-[1.4rem] border border-white/72 bg-white/78 p-4 shadow-[0_20px_46px_rgba(77,127,181,0.12)]">
      <div className="flex items-center justify-between">
        <div className="text-sm font-bold text-brand-ink">Profile</div>
        <div className="rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white">Save</div>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {["山田", "太郎", "ヤマダ", "タロウ", "東京都", "早稲田大学"].map((value) => (
          <div key={value} className="rounded-xl border border-brand-line/70 bg-[rgba(238,247,255,0.94)] px-3 py-2 text-sm font-semibold text-brand-ink">
            {value}
          </div>
        ))}
      </div>
    </div>
  );
}

function ModeVisual() {
  return (
    <div className="grid w-full max-w-sm gap-3">
      {[
        ["Auto", "Fills when forms appear", true],
        ["Manual", "Only when you click", false],
      ].map(([title, caption, active]) => (
        <div
          key={title as string}
          className={`flex items-center justify-between rounded-2xl border p-4 ${
            active
              ? "border-brand/28 bg-[rgba(218,238,255,0.9)]"
              : "border-white/70 bg-white/66"
          }`}
        >
          <div>
            <div className="text-sm font-bold text-brand-ink">{title}</div>
            <div className="mt-1 text-xs text-brand-muted">{caption}</div>
          </div>
          <div className={`h-7 w-12 rounded-full p-1 ${active ? "bg-brand" : "bg-white/80"}`}>
            <div className={`h-5 w-5 rounded-full bg-white shadow-sm ${active ? "ml-5" : ""}`} />
          </div>
        </div>
      ))}
    </div>
  );
}

function FormVisual() {
  return (
    <div className="w-full max-w-sm rounded-[1.4rem] border border-white/72 bg-white/76 p-4">
      <div className="mb-4 text-sm font-bold text-brand-ink">エントリーシート</div>
      {["氏名", "フリガナ", "大学名", "都道府県"].map((label) => (
        <div key={label} className="mb-3 last:mb-0">
          <div className="mb-1 text-[11px] font-semibold text-brand-muted">{label}</div>
          <div className="h-10 rounded-xl border border-dashed border-brand-line bg-white/74" />
        </div>
      ))}
    </div>
  );
}

function AutofillVisual() {
  return (
    <div className="w-full max-w-sm rounded-[1.4rem] border border-white/72 bg-[linear-gradient(160deg,rgba(255,255,255,0.86),rgba(239,228,255,0.58))] p-4 shadow-[0_20px_46px_rgba(126,97,190,0.12)]">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm font-bold text-brand-ink">Cygnet</div>
        <div className="rounded-xl bg-[linear-gradient(135deg,#5d89ff,#4778ff)] px-4 py-2 text-xs font-bold text-white">
          Autofill
        </div>
      </div>
      {[
        ["氏名", "山田 太郎"],
        ["フリガナ", "ヤマダ タロウ"],
        ["大学名", "早稲田大学"],
      ].map(([label, value]) => (
        <div key={label} className="mb-2 flex items-center justify-between rounded-xl bg-white/68 px-3 py-2 text-sm">
          <span className="text-brand-muted">{label}</span>
          <span className="font-semibold text-brand-ink">{value}</span>
        </div>
      ))}
    </div>
  );
}

function TrackerVisual() {
  return (
    <div className="w-full max-w-sm rounded-[1.4rem] border border-white/72 bg-white/76 p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm font-bold text-brand-ink">Applications</div>
        <div className="rounded-full bg-brand/10 px-3 py-1 text-xs font-bold text-brand">Interview</div>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: 21 }, (_, index) => (
          <div
            key={index}
            className={`flex aspect-square items-center justify-center rounded-xl text-xs font-semibold ${
              index === 15
                ? "bg-brand text-white shadow-[0_10px_24px_rgba(74,141,216,0.22)]"
                : "bg-[rgba(238,247,255,0.8)] text-brand-muted"
            }`}
          >
            {index + 1}
          </div>
        ))}
      </div>
    </div>
  );
}

function CalendarVisual() {
  return (
    <div className="w-full max-w-sm space-y-3">
      {[
        ["Gmail", "Label: Cygnet"],
        ["Cygnet", "Interview detected"],
        ["Calendar", "Apr 30, 14:00"],
      ].map(([label, caption], index) => (
        <div key={label} className="flex items-center gap-3">
          <div className="flex-1 rounded-2xl border border-white/72 bg-white/72 px-4 py-3 shadow-[0_12px_28px_rgba(77,127,181,0.08)]">
            <div className="text-sm font-bold text-brand-ink">{label}</div>
            <div className="mt-1 text-xs text-brand-muted">{caption}</div>
          </div>
          {index < 2 ? <ArrowIcon /> : null}
        </div>
      ))}
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

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth={2.2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
    </svg>
  );
}
