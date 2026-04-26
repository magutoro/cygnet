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
  title: "Demo – Cygnet",
  description: "A walkthrough of how Cygnet works from profile setup to autofill review.",
};

export default async function DemoPage() {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const lang =
    normalizeLanguage(cookieStore.get(LANGUAGE_COOKIE_KEY)?.value) ||
    detectLanguageFromAcceptLanguage(headerStore.get("accept-language"));
  const t = SITE_COPY[lang].demo;

  return (
    <main className="page-shell">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <section className="glass-panel rounded-[2rem] p-8 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">{t.badge}</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-brand-ink sm:text-5xl">
            {t.title}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-brand-muted">{t.subtitle}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/dashboard" className="primary-cta-button px-6 text-sm">
              {t.dashboardCta}
            </Link>
            <a
              href={CHROME_WEB_STORE_URL}
              target="_blank"
              rel="noreferrer"
              className="glass-button-secondary px-6 py-3 text-sm font-semibold"
            >
              {t.installCta}
            </a>
            <Link href="/help" className="glass-button-secondary px-6 py-3 text-sm font-semibold">
              {t.helpCta}
            </Link>
          </div>
        </section>

        <section className="mt-10 grid gap-6">
          <DemoStepCard
            eyebrow={t.steps[0].eyebrow}
            title={t.steps[0].title}
            description={t.steps[0].description}
            visual={<ProfileSetupMock />}
          />
          <DemoStepCard
            eyebrow={t.steps[1].eyebrow}
            title={t.steps[1].title}
            description={t.steps[1].description}
            visual={<BlankApplicationMock />}
            reverse
          />
          <DemoStepCard
            eyebrow={t.steps[2].eyebrow}
            title={t.steps[2].title}
            description={t.steps[2].description}
            visual={<AutofillActionMock />}
          />
          <DemoStepCard
            eyebrow={t.steps[3].eyebrow}
            title={t.steps[3].title}
            description={t.steps[3].description}
            visual={<ReviewMock />}
            reverse
          />
        </section>
      </div>
    </main>
  );
}

function DemoStepCard({
  eyebrow,
  title,
  description,
  visual,
  reverse = false,
}: {
  eyebrow: string;
  title: string;
  description: string;
  visual: ReactNode;
  reverse?: boolean;
}) {
  return (
    <section className="glass-panel rounded-[2rem] p-6 sm:p-8">
      <div className={`grid items-center gap-8 lg:grid-cols-2 ${reverse ? "" : ""}`}>
        <div className={reverse ? "lg:order-2" : ""}>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">{eyebrow}</p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-brand-ink sm:text-3xl">{title}</h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-brand-muted">{description}</p>
        </div>
        <div className={reverse ? "lg:order-1" : ""}>{visual}</div>
      </div>
    </section>
  );
}

function ProfileSetupMock() {
  return (
    <div className="rounded-[1.75rem] border border-white/72 bg-white/74 p-5 shadow-[0_22px_50px_rgba(77,127,181,0.12)]">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-brand-ink">Dashboard</div>
          <div className="mt-1 text-xs text-brand-muted">Profile setup</div>
        </div>
        <div className="rounded-lg bg-brand px-4 py-2 text-xs font-semibold text-white">Save</div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {["山田", "太郎", "東京都", "早稲田大学", "marketing@example.com", "2027-03"].map((value) => (
          <div key={value} className="rounded-xl border border-brand-line/70 bg-white/80 px-4 py-3 text-sm text-brand-ink">
            {value}
          </div>
        ))}
      </div>
    </div>
  );
}

function BlankApplicationMock() {
  return (
    <div className="rounded-[1.75rem] border border-white/72 bg-white/74 p-5 shadow-[0_22px_50px_rgba(77,127,181,0.12)]">
      <div className="text-sm font-semibold text-brand-ink">Entry form</div>
      <div className="mt-5 space-y-3">
        {["氏名", "フリガナ", "大学名", "都道府県"].map((label) => (
          <div key={label} className="space-y-1">
            <div className="text-[11px] font-medium tracking-wide text-brand-muted">{label}</div>
            <div className="h-11 rounded-xl border border-dashed border-brand-line bg-white/72" />
          </div>
        ))}
      </div>
    </div>
  );
}

function AutofillActionMock() {
  return (
    <div className="rounded-[1.75rem] border border-white/72 bg-[linear-gradient(160deg,rgba(255,255,255,0.82),rgba(243,229,255,0.56))] p-5 shadow-[0_22px_50px_rgba(126,97,190,0.12)] backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-brand-ink">アカウント設定</div>
          <div className="mt-1 text-xs text-brand-muted">user@example.com</div>
        </div>
        <div className="text-lg text-brand-ink/70">×</div>
      </div>
      <div className="mt-5 rounded-2xl border border-white/70 bg-white/48 p-4 shadow-[0_14px_28px_rgba(126,97,190,0.08)]">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#7d67f4,#4f8ff8)] text-white">
              ✦
            </div>
            <div className="text-sm font-medium text-brand-ink">自動入力を使用</div>
          </div>
          <div className="rounded-xl bg-[linear-gradient(135deg,#5d89ff,#4778ff)] px-4 py-2 text-sm font-semibold text-white">
            Autofill
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewMock() {
  return (
    <div className="rounded-[1.75rem] border border-white/72 bg-white/74 p-5 shadow-[0_22px_50px_rgba(77,127,181,0.12)]">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-brand-ink">Review before submit</div>
        <div className="rounded-full bg-[rgba(229,250,240,0.92)] px-3 py-1 text-xs font-semibold text-[#1e6957]">
          Ready
        </div>
      </div>
      <div className="mt-5 space-y-3">
        {[
          ["氏名", "山田 太郎"],
          ["フリガナ", "ヤマダ タロウ"],
          ["大学名", "早稲田大学"],
          ["都道府県", "東京都"],
        ].map(([label, value]) => (
          <div key={label} className="space-y-1">
            <div className="text-[11px] font-medium tracking-wide text-brand-muted">{label}</div>
            <div className="flex h-11 items-center rounded-xl border border-white/70 bg-[rgba(238,247,255,0.92)] px-4 text-sm font-medium text-brand-ink">
              {value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
