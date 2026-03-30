import type { Metadata } from "next";
import Link from "next/link";
import { cookies, headers } from "next/headers";
import {
  LANGUAGE_COOKIE_KEY,
  detectLanguageFromAcceptLanguage,
  normalizeLanguage,
} from "@/lib/language";

export const metadata: Metadata = {
  title: "Terms of Service – Cygnet",
  description: "Terms governing use of Cygnet's extension, dashboard, sync, and resume features.",
};

const COPY = {
  en: {
    backToWebsite: "Back to website",
    title: "Cygnet Terms of Service",
    updated: "Last updated: March 29, 2026",
    intro:
      "These Terms govern your use of Cygnet's extension, dashboard, sync, and resume features. By using Cygnet, you agree to these Terms.",
    sections: [
      {
        title: "1) Using Cygnet",
        paragraphs: [
          "You may use Cygnet only in compliance with applicable law and these Terms.",
          "You are responsible for deciding what information to store, sync, upload, or autofill through Cygnet.",
        ],
      },
      {
        title: "2) Your account and uploaded content",
        paragraphs: [
          "If you use account-backed sync features, you are responsible for maintaining control of your account and devices.",
          "You retain responsibility for the resumes, profile data, and other content you choose to upload, sync, or autofill using Cygnet.",
        ],
      },
      {
        title: "3) Third-party websites and services",
        paragraphs: [
          "Cygnet may help you fill data into third-party job application websites at your direction. Those websites and their privacy or security practices are not controlled by Cygnet.",
          "Cygnet may rely on third-party service providers, such as authentication, hosting, storage, or AI providers, to operate certain features.",
        ],
      },
      {
        title: "4) Security and service availability",
        paragraphs: [
          "We use safeguards designed to protect personal information, but no method of transmission over the Internet or electronic storage is completely secure, and we cannot guarantee absolute security.",
          "Cygnet may change, suspend, or discontinue features from time to time, including to improve security, reliability, or legal compliance.",
        ],
      },
      {
        title: "5) Disclaimer and limitation of liability",
        paragraphs: [
          "To the fullest extent permitted by law, Cygnet is provided on an \"as is\" and \"as available\" basis without warranties of any kind, whether express or implied.",
          "To the fullest extent permitted by law, Cygnet and its affiliates, officers, employees, and service providers will not be liable for indirect, incidental, special, consequential, exemplary, or punitive damages, or for loss of data, profits, goodwill, or business opportunities arising from or related to your use of the service.",
          "Nothing in these Terms limits liability that cannot legally be limited under applicable law.",
        ],
      },
      {
        title: "6) Contact",
        paragraphs: ["For questions about these Terms, contact:"],
      },
    ],
    contactNameLabel: "Name/Company",
    contactNameValue: "Cygnet",
    contactEmailLabel: "Email",
    contactWebsiteLabel: "Website",
    footer: "All rights reserved.",
  },
  ja: {
    backToWebsite: "サイトに戻る",
    title: "Cygnet 利用規約",
    updated: "最終更新日: 2026年3月29日",
    intro:
      "本規約は、Cygnet の拡張機能、ダッシュボード、同期、履歴書機能の利用条件を定めるものです。Cygnet を利用することで、本規約に同意したものとみなされます。",
    sections: [
      {
        title: "1) Cygnet の利用",
        paragraphs: [
          "Cygnet は、適用法令および本規約に従って利用してください。",
          "Cygnet に保存、同期、アップロード、または自動入力する情報を何にするかは、ユーザーご自身の判断と責任で決定してください。",
        ],
      },
      {
        title: "2) アカウントとアップロード内容",
        paragraphs: [
          "アカウント連携機能を利用する場合、アカウントおよび利用端末の管理責任はユーザーにあります。",
          "履歴書、プロフィール情報、その他アップロード・同期・自動入力に利用する内容については、ユーザーが責任を負います。",
        ],
      },
      {
        title: "3) 第三者サイトおよびサービス",
        paragraphs: [
          "Cygnet は、ユーザーの指示に基づき第三者の求人応募サイトへの入力を支援する場合がありますが、これら第三者サイトの運用、プライバシー、またはセキュリティ慣行は Cygnet が管理するものではありません。",
          "また、認証、ホスティング、ストレージ、AI などの一部機能のために第三者サービス提供者を利用する場合があります。",
        ],
      },
      {
        title: "4) セキュリティと提供継続",
        paragraphs: [
          "当社は個人情報保護のための安全管理措置を講じますが、インターネット送信や電子保存に絶対的に安全な方法は存在せず、完全な安全性を保証することはできません。",
          "Cygnet は、セキュリティ、信頼性、法令遵守等の理由により、機能を変更、一時停止、または終了することがあります。",
        ],
      },
      {
        title: "5) 免責および責任制限",
        paragraphs: [
          "適用法令で認められる最大限の範囲で、Cygnet は現状有姿かつ提供可能な範囲で提供され、明示または黙示を問わずいかなる保証も行いません。",
          "適用法令で認められる最大限の範囲で、Cygnet およびその関係者、役職員、サービス提供者は、本サービスの利用または利用不能に起因または関連して生じる、間接損害、付随損害、特別損害、結果損害、懲罰的損害、データ喪失、逸失利益、信用毀損、事業機会喪失等について責任を負いません。",
          "ただし、適用法令上制限できない責任を制限するものではありません。",
        ],
      },
      {
        title: "6) お問い合わせ",
        paragraphs: ["本規約に関するお問い合わせ先:"],
      },
    ],
    contactNameLabel: "名称 / 会社名",
    contactNameValue: "Cygnet",
    contactEmailLabel: "メールアドレス",
    contactWebsiteLabel: "Webサイト",
    footer: "All rights reserved.",
  },
} as const;

export default async function TermsPage() {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const lang =
    normalizeLanguage(cookieStore.get(LANGUAGE_COOKIE_KEY)?.value) ||
    detectLanguageFromAcceptLanguage(headerStore.get("accept-language"));
  const t = COPY[lang];

  return (
    <main className="min-h-screen bg-brand-bg">
      <div className="mx-auto max-w-3xl px-6 py-14">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-brand-strong transition-colors hover:text-brand-ink"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          {t.backToWebsite}
        </Link>

        <div className="rounded-3xl border border-brand-line bg-white p-8 shadow-sm sm:p-10">
          <h1 className="text-3xl font-extrabold tracking-tight text-brand-ink sm:text-4xl">
            {t.title}
          </h1>
          <p className="mt-3 text-sm font-medium text-brand-muted">{t.updated}</p>
          <p className="mt-6 leading-relaxed text-brand-muted">{t.intro}</p>

          <div className="mt-10 space-y-8">
            {t.sections.map((section) => (
              <section key={section.title} className="space-y-3">
                <h2 className="text-lg font-semibold text-brand-ink">{section.title}</h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="leading-relaxed text-brand-muted">
                    {paragraph}
                  </p>
                ))}
              </section>
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-brand-line bg-brand-bg/40 p-5 text-sm text-brand-muted">
            <div className="grid gap-2 sm:grid-cols-[140px_1fr]">
              <span className="font-semibold text-brand-ink">{t.contactNameLabel}</span>
              <span>{t.contactNameValue}</span>
              <span className="font-semibold text-brand-ink">{t.contactEmailLabel}</span>
              <a href="mailto:markoguro@gmail.com" className="text-brand-strong hover:text-brand-ink">
                markoguro@gmail.com
              </a>
              <span className="font-semibold text-brand-ink">{t.contactWebsiteLabel}</span>
              <a href="https://cygnet-two.vercel.app" className="text-brand-strong hover:text-brand-ink">
                cygnet-two.vercel.app
              </a>
            </div>
          </div>

          <p className="mt-8 text-xs text-brand-muted">{t.footer}</p>
        </div>
      </div>
    </main>
  );
}
