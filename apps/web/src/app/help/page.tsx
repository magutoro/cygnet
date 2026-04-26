import type { Metadata } from "next";
import Link from "next/link";
import { cookies, headers } from "next/headers";
import { SITE_COPY } from "@/content/site-copy";
import {
  LANGUAGE_COOKIE_KEY,
  detectLanguageFromAcceptLanguage,
  normalizeLanguage,
} from "@/lib/language";

export const metadata: Metadata = {
  title: "Help – Cygnet",
  description: "Troubleshooting and support guidance for Cygnet autofill.",
};

export default async function HelpPage() {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const lang =
    normalizeLanguage(cookieStore.get(LANGUAGE_COOKIE_KEY)?.value) ||
    detectLanguageFromAcceptLanguage(headerStore.get("accept-language"));
  const t = SITE_COPY[lang].help;

  return (
    <main className="page-shell">
      <div className="mx-auto max-w-5xl px-6 py-14">
        <section className="glass-panel rounded-[2rem] p-8 sm:p-10">
          <h1 className="text-3xl font-bold tracking-tight text-brand-ink sm:text-4xl">{t.title}</h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-brand-muted">{t.subtitle}</p>
        </section>

        <section className="mt-8 grid gap-4">
          {t.sections.map((section) => (
            <div key={section.title} className="glass-panel rounded-[1.75rem] p-6">
              <h2 className="text-xl font-semibold text-brand-ink">{section.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-brand-muted">{section.body}</p>
            </div>
          ))}
        </section>

        <section className="mt-8 glass-panel rounded-[2rem] p-8">
          <h2 className="text-2xl font-bold tracking-tight text-brand-ink">{t.faqTitle}</h2>
          <div className="mt-6 space-y-3">
            {t.faqs.map((item) => (
              <details key={item.question} className="rounded-2xl border border-white/70 bg-white/48 px-5 py-4">
                <summary className="cursor-pointer list-none text-base font-semibold text-brand-ink">
                  {item.question}
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-brand-muted">{item.answer}</p>
              </details>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/contact" className="primary-cta-button px-6 text-sm">
              {t.contactCta}
            </Link>
            <Link href="/demo" className="glass-button-secondary px-6 py-3 text-sm font-semibold">
              {t.demoCta}
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
