import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import {
  LANGUAGE_COOKIE_KEY,
  detectLanguageFromAcceptLanguage,
  normalizeLanguage,
} from "@/lib/language";

export const metadata: Metadata = {
  title: "Contact – Cygnet",
  description: "Business inquiries and bug report contact page for Cygnet.",
};

const COPY = {
  en: {
    title: "Contact",
    subtitle: "Choose the topic below.",
    businessTitle: "Business",
    businessDesc: "Partnerships, media, or business questions.",
    businessAction: "Contact business",
    bugTitle: "Bugs",
    bugDesc: "Report bugs or problems you found.",
    bugAction: "Report bug",
  },
  ja: {
    title: "お問い合わせ",
    subtitle: "ご用件を選択してください。",
    businessTitle: "ビジネス",
    businessDesc: "提携・取材・法人のお問い合わせはこちら。",
    businessAction: "ビジネス連絡",
    bugTitle: "不具合",
    bugDesc: "不具合や問題の報告はこちら。",
    bugAction: "不具合を報告",
  },
} as const;

export default async function ContactPage() {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const lang =
    normalizeLanguage(cookieStore.get(LANGUAGE_COOKIE_KEY)?.value) ||
    detectLanguageFromAcceptLanguage(headerStore.get("accept-language"));
  const t = COPY[lang];

  return (
    <main className="page-shell">
      <div className="mx-auto max-w-3xl px-6 py-14">
        <div className="glass-panel mb-8 rounded-[1.75rem] p-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-brand-ink">
            {t.title}
          </h1>
          <p className="mt-2 text-sm text-brand-muted">{t.subtitle}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <section className="glass-panel rounded-[1.75rem] p-6 shadow-none">
            <h2 className="text-lg font-semibold text-brand-ink">{t.businessTitle}</h2>
            <p className="mt-2 text-sm text-brand-muted">{t.businessDesc}</p>
            <a
              href="mailto:c251771e@gmail.com?subject=Cygnet%20Business%20Inquiry"
              className="glass-button-primary mt-5 inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold"
            >
              {t.businessAction}
            </a>
          </section>

          <section className="glass-panel rounded-[1.75rem] p-6 shadow-none">
            <h2 className="text-lg font-semibold text-brand-ink">{t.bugTitle}</h2>
            <p className="mt-2 text-sm text-brand-muted">{t.bugDesc}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <a
                href="mailto:c251771e@gmail.com?subject=Cygnet%20Bug%20Report"
                className="glass-button-primary inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold"
              >
                {t.bugAction}
              </a>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
