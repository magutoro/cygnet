import type { Metadata } from "next";
import Link from "next/link";
import { cookies, headers } from "next/headers";
import {
  LANGUAGE_COOKIE_KEY,
  detectLanguageFromAcceptLanguage,
  normalizeLanguage,
} from "@/lib/language";

export const metadata: Metadata = {
  title: "Privacy Policy – Cygnet",
  description: "How Cygnet handles profile data, synced data, local passwords, and user controls.",
};

const COPY = {
  en: {
    backToWebsite: "Back to website",
    title: "Cygnet Privacy Policy",
    updated: "Last updated: March 29, 2026",
    intro:
      "Cygnet provides a Chrome extension and web dashboard for autofilling job application forms. This page explains what is stored locally, what may be synced to Cygnet, and what we can and cannot access.",
    sections: [
      {
        title: "1) What data Cygnet may handle",
        paragraphs: [
          "Depending on which features you use, Cygnet may handle profile information such as your name, email, phone number, address, birth date, education history, work history, links, notes, resume files, parsed resume text, and extension preferences.",
          "Cygnet also reads page and form metadata such as field labels, placeholders, input names, and surrounding structure on pages where autofill is used so it can match your saved data to the correct fields.",
        ],
        bullets: [
          "Profile fields you enter in the extension or dashboard",
          "Resume files and parsed resume text if you upload resumes",
          "Extension preferences and panel state",
          "Saved login entries if you use the login-saving feature",
        ],
      },
      {
        title: "2) Where data is stored",
        paragraphs: [
          "Your profile data and extension settings are stored in local browser extension storage on the browser where you use Cygnet. Cygnet does not rely on Chrome Sync for profile PII.",
          "If you sign in to Cygnet and use sync features, your profile data and resumes are also stored in Cygnet's secured Supabase backend so they can appear on the web dashboard and sync across devices.",
          "Saved login passwords are different: they are stored locally in the extension only, protected with local encryption and your passphrase, and are not uploaded to Cygnet's servers.",
        ],
        bullets: [
          "Saved login passwords stay local to your browser extension",
          "Cygnet does not upload or read saved login passwords",
          "Profile data stays on your current browser unless you choose Cygnet account sync",
          "Profile and resume data may be stored in Supabase when you use Cygnet account sync",
        ],
      },
      {
        title: "3) What Cygnet can access",
        paragraphs: [
          "If you only use local extension storage and do not use Cygnet account sync, Cygnet as a company does not receive your extension-only profile data or your saved login passwords.",
          "If you sign in and sync your profile or resumes through Cygnet, that synced data is stored in our backend. Cygnet staff may access synced profile or resume data only when needed for user-requested support, security or abuse investigation, or legal compliance.",
          "Cygnet cannot access your saved login passwords because those passwords are kept locally in the extension and are not sent to our backend.",
        ],
      },
      {
        title: "4) How data is used and shared",
        paragraphs: [
          "We use data to provide autofill, account sync, dashboard editing, resume management, and related support and security functions.",
          "We do not sell personal data and do not share profile data with advertising networks or data brokers.",
        ],
        bullets: [
          "Google and Supabase are used for authentication and account-backed sync",
          "Supabase Storage is used for uploaded resume files",
          "If you use optional AI resume parsing, resume text may be sent to OpenAI for parsing",
          "Data is inserted into third-party job application websites only when you choose to autofill",
        ],
      },
      {
        title: "5) Retention and user controls",
        paragraphs: [
          "Local extension data remains until you edit it, delete it, clear browser storage, or uninstall the extension.",
          "Synced profile and resume data remains until you update or delete it from your account, subject to reasonable backup and operational retention.",
        ],
        bullets: [
          "You can edit or delete profile data in the extension and dashboard",
          "You can delete uploaded resumes from the dashboard",
          "You can uninstall the extension to stop local extension processing",
          "You can sign out of your Cygnet account to stop backend sync on that browser",
        ],
      },
      {
        title: "6) Chrome Web Store limited use",
        paragraphs: [
          "Cygnet uses synced profile and resume data only to provide the product features you choose, to maintain account sync and support, and to comply with legal obligations or protect against security and abuse issues. We do not use this data for advertising or sell it to data brokers.",
          "Human access to synced data is restricted to user-requested support, security or abuse investigation, and legal compliance. Local-only saved login passwords are not available to Cygnet staff because they remain encrypted inside the extension on your device.",
        ],
      },
      {
        title: "7) Security",
        paragraphs: [
          "We use administrative, technical, and organizational safeguards designed to protect personal information, including authenticated access controls and backend protections such as Row-Level Security where applicable.",
          "However, no method of transmission over the Internet or electronic storage is completely secure, and we cannot guarantee absolute security. We recommend avoiding unnecessary sensitive data such as government IDs, financial account information, or similar secrets in profile notes.",
        ],
      },
      {
        title: "8) Contact",
        paragraphs: ["For privacy questions, contact:"],
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
    title: "Cygnet プライバシーポリシー",
    updated: "最終更新日: 2026年3月29日",
    intro:
      "Cygnet は、求人応募フォームの自動入力を支援する Chrome 拡張機能と Web ダッシュボードを提供しています。このページでは、ローカルに保存される情報、Cygnet に同期される可能性がある情報、そして当社がアクセスできる情報とできない情報を説明します。",
    sections: [
      {
        title: "1) Cygnet が取り扱う可能性のある情報",
        paragraphs: [
          "ご利用機能に応じて、氏名、メールアドレス、電話番号、住所、生年月日、学歴、職歴、各種リンク、メモ、履歴書ファイル、履歴書の解析結果、拡張機能の設定などを取り扱う場合があります。",
          "また、自動入力を行うページでは、入力欄ラベル、プレースホルダー、input 名、周辺のフォーム構造などのページ・フォーム情報を読み取り、保存済みデータを適切な欄に対応付けます。",
        ],
        bullets: [
          "拡張機能またはダッシュボードで入力したプロフィール情報",
          "履歴書をアップロードした場合の履歴書ファイルと解析テキスト",
          "拡張機能の設定やパネル状態",
          "ログイン保存機能を使った場合の保存済みログイン情報",
        ],
      },
      {
        title: "2) 情報の保存場所",
        paragraphs: [
          "プロフィール情報と拡張機能設定は、Cygnet を使用しているブラウザ上のローカル拡張機能ストレージに保存されます。Cygnet はプロフィールの個人情報保存に Chrome Sync を前提としません。",
          "Cygnet にログインして同期機能を使う場合、プロフィール情報と履歴書は、Web ダッシュボード表示や端末間同期のために、Cygnet の保護された Supabase バックエンドにも保存されます。",
          "保存済みログインのパスワードは扱いが異なります。これらは拡張機能内にのみローカル保存され、ローカル暗号化とパスフレーズで保護され、Cygnet のサーバーにはアップロードされません。",
        ],
        bullets: [
          "保存済みログインのパスワードはブラウザ拡張機能内だけに保存されます",
          "Cygnet は保存済みログインのパスワードをアップロードせず、読むこともできません",
          "プロフィール情報は、Cygnet アカウント同期を選ばない限り現在のブラウザ内にのみ保存されます",
          "プロフィールと履歴書は、Cygnet アカウント同期を使う場合に Supabase に保存されることがあります",
        ],
      },
      {
        title: "3) Cygnet がアクセスできる情報",
        paragraphs: [
          "ローカル拡張機能ストレージのみを利用し、Cygnet のアカウント同期を使わない場合、会社としての Cygnet は、そのローカル専用プロフィール情報や保存済みログインパスワードを受け取りません。",
          "一方で、Cygnet にログインしてプロフィールや履歴書を同期した場合、その同期データは当社バックエンドに保存されます。Cygnet 担当者が同期済みプロフィールまたは履歴書データへアクセスできるのは、ユーザーからのサポート依頼、セキュリティまたは不正利用の調査、法令対応が必要な場合に限られます。",
          "ただし、保存済みログインのパスワードは拡張機能内にのみ保持され、当社バックエンドへ送信されないため、Cygnet はそれらのパスワードへアクセスできません。",
        ],
      },
      {
        title: "4) 情報の利用目的と共有",
        paragraphs: [
          "当社は、自動入力、アカウント同期、ダッシュボード編集、履歴書管理、関連するサポートおよびセキュリティ機能の提供のために情報を利用します。",
          "当社は個人データを販売せず、広告ネットワークやデータブローカーにプロフィール情報を提供しません。",
        ],
        bullets: [
          "認証とアカウント同期には Google と Supabase を利用します",
          "アップロードされた履歴書ファイルには Supabase Storage を利用します",
          "任意の AI 履歴書解析を使う場合、履歴書テキストが OpenAI に送信されることがあります",
          "第三者の求人応募サイトへの入力は、ユーザーが自動入力を実行したときにのみ行われます",
        ],
      },
      {
        title: "5) 保存期間とユーザーのコントロール",
        paragraphs: [
          "ローカル拡張機能データは、編集・削除、ブラウザストレージの削除、または拡張機能のアンインストールまで保持されます。",
          "同期済みのプロフィール情報と履歴書は、アカウント上で更新または削除されるまで保持されます。ただし、合理的なバックアップや運用上の保持が行われる場合があります。",
        ],
        bullets: [
          "プロフィール情報は拡張機能とダッシュボードで編集・削除できます",
          "アップロードした履歴書はダッシュボードから削除できます",
          "拡張機能をアンインストールするとローカル処理を停止できます",
          "現在のブラウザでバックエンド同期を止めたい場合は Cygnet からログアウトできます",
        ],
      },
      {
        title: "6) Chrome Web Store の限定利用",
        paragraphs: [
          "Cygnet は、選択された機能を提供し、アカウント同期とサポートを維持し、法令に対応し、セキュリティや不正利用の問題を防ぐためにのみ、同期済みプロフィール情報や履歴書データを利用します。これらのデータを広告目的で使用したり、データブローカーへ販売したりすることはありません。",
          "同期データへの人によるアクセスは、ユーザーからのサポート依頼、セキュリティまたは不正利用の調査、法令対応に限定されます。保存済みログインパスワードは拡張機能内で暗号化されたまま保持されるため、Cygnet 担当者はアクセスできません。",
        ],
      },
      {
        title: "7) セキュリティ",
        paragraphs: [
          "当社は、認証済みアクセス制御や必要に応じた Row-Level Security など、個人情報を保護するための管理的・技術的・組織的な安全管理措置を講じます。",
          "ただし、インターネット送信や電子保存に絶対的に安全な方法は存在せず、完全な安全性を保証することはできません。特に、政府発行 ID、金融口座情報、その他不要に機微な情報は、プロフィールのメモ等へ保存しないことを推奨します。",
        ],
      },
      {
        title: "8) お問い合わせ",
        paragraphs: ["プライバシーに関するお問い合わせ先:"],
      },
    ],
    contactNameLabel: "名称 / 会社名",
    contactNameValue: "Cygnet",
    contactEmailLabel: "メールアドレス",
    contactWebsiteLabel: "Webサイト",
    footer: "All rights reserved.",
  },
} as const;

export default async function PrivacyPage() {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const lang =
    normalizeLanguage(cookieStore.get(LANGUAGE_COOKIE_KEY)?.value) ||
    detectLanguageFromAcceptLanguage(headerStore.get("accept-language"));
  const t = COPY[lang];

  return (
    <>
      <main className="page-shell">
        <div className="mx-auto max-w-3xl px-6 py-14">
          <Link
            href="/"
            className="glass-button-secondary mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            {t.backToWebsite}
          </Link>

          <div className="glass-panel rounded-[2rem] p-8 shadow-none sm:p-10">
            <h1 className="text-3xl font-extrabold tracking-tight text-brand-ink sm:text-4xl">
              {t.title}
            </h1>
            <p className="mt-2 text-sm text-brand-muted">{t.updated}</p>
            <p className="mt-6 leading-relaxed text-brand-muted">{t.intro}</p>

            {t.sections.map((section) => (
              <section key={section.title} className="mt-10">
                <h2 className="text-lg font-semibold text-brand-ink">{section.title}</h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="mt-2 leading-relaxed text-brand-muted">
                    {paragraph}
                  </p>
                ))}
                {"bullets" in section && section.bullets ? (
                  <ul className="mt-3 list-disc space-y-1 pl-6 text-brand-muted">
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}

            <ul className="glass-panel-soft mt-8 list-disc space-y-2 rounded-[1.5rem] px-6 py-5 pl-10 text-brand-muted">
              <li>
                {t.contactNameLabel}: {t.contactNameValue}
              </li>
              <li>
                {t.contactEmailLabel}:{" "}
                <a
                  href="mailto:c251771e@gmail.com"
                  className="text-brand-strong underline decoration-brand/30 underline-offset-2 transition-colors hover:text-brand-ink"
                >
                  c251771e@gmail.com
                </a>
              </li>
              <li>
                {t.contactWebsiteLabel}:{" "}
                <a
                  href="https://cygnet-two.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-strong underline decoration-brand/30 underline-offset-2 transition-colors hover:text-brand-ink"
                >
                  https://cygnet-two.vercel.app
                </a>
              </li>
            </ul>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/45 bg-white/28 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 py-10 sm:flex-row">
          <div className="text-sm font-semibold text-brand-ink">Cygnet</div>
          <p className="text-xs text-brand-muted">
            &copy; {new Date().getFullYear()} Cygnet. {t.footer}
          </p>
        </div>
      </footer>
    </>
  );
}
