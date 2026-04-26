import type { Application } from "@cygnet/shared";

export const SITE_COPY = {
  en: {
    home: {
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
          desc: "Choose Auto mode or click manually, and Cygnet fills the form in the right format.",
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
          desc: "Works across major Japanese job platforms out of the box.",
        },
      ],
      modesTag: "Autofill modes",
      modesTitle: "Use Cygnet your way",
      modesIntro:
        "Some people want hands-free autofill. Others want a deliberate click before anything gets inserted. Cygnet supports both.",
      modes: [
        {
          title: "Auto mode",
          desc: "When enabled, Cygnet fills supported forms as they appear so you can move quickly through repetitive applications.",
          point1: "Best for high-volume application sessions",
          point2: "Great when your saved profile is already dialed in",
        },
        {
          title: "Manual mode",
          desc: "Keep automatic filling off and use the Autofill button only when you want it. Review first, fill second.",
          point1: "Best for careful review on unfamiliar sites",
          point2: "Perfect if you want full control on every page",
        },
      ],
      trustTitle: "Security and control by default",
      trustDesc:
        "Saved login passwords stay encrypted locally in the extension. If you sign in, your profile and resumes can sync through Cygnet's secured backend so they appear in the dashboard across devices.",
      trustPoint1: "Saved passwords remain local-only",
      trustPoint2: "Profile and resume sync is optional",
      trustPoint3: "Choose automatic filling or manual-only filling",
      faqTag: "FAQ",
      faqTitle: "What happens if something doesn’t work?",
      faqIntro: "You should always have a clear fallback path. No guessing, no dead ends.",
      faqs: [
        {
          question: "What if a form doesn’t autofill correctly?",
          answer:
            "You can switch to Manual mode, review your saved profile, and try the page again. If the site still isn’t working, use the help page to troubleshoot and send us the form URL.",
        },
        {
          question: "What’s the difference between Auto mode and Manual mode?",
          answer:
            "Auto mode fills supported forms when they appear. Manual mode keeps autofill off until you click the Autofill button yourself.",
        },
        {
          question: "What stays local and what can sync?",
          answer:
            "Saved login passwords stay local-only in the extension. If you choose to sign in, your profile and resumes can sync to Cygnet so they appear in the web dashboard across devices.",
        },
        {
          question: "Where do I go if I need help?",
          answer:
            "Start with the troubleshooting page for quick fixes, then contact us if the page still needs support.",
        },
      ],
      faqHelpCta: "Open troubleshooting guide",
      ctaTitle: "Ready to simplify shuukatsu?",
      ctaDesc: "Install Cygnet for free and never hand-type the same info again.",
      ctaButton: "Add to Chrome — it's free",
      heroStats: [
        { value: "Local Vault", label: "Saved credentials" },
        { value: "10+", label: "Sites supported" },
        { value: "1-Click", label: "Autofill" },
      ],
      privacyPolicy: "Privacy Policy",
      termsOfService: "Terms of Service",
      contact: "Contact",
      help: "Help",
      rightsReserved: "All rights reserved.",
      trustBadge: "Privacy & control",
      fullDemoCta: "View full walkthrough",
    },
    demo: {
      badge: "Guided demo",
      title: "See the real Cygnet flow before you install",
      subtitle:
        "This walkthrough shows the actual rhythm of using Cygnet: set up once, open a form, trigger autofill, then review before submitting.",
      steps: [
        {
          eyebrow: "Step 1",
          title: "Save your profile once",
          description:
            "Set up the fields you reuse most often — name, address, education, career, links, and notes — inside the dashboard.",
        },
        {
          eyebrow: "Step 2",
          title: "Open the job form you’re applying to",
          description:
            "Go to a supported Japanese application page and let Cygnet detect the form fields that can be mapped safely.",
        },
        {
          eyebrow: "Step 3",
          title: "Click Autofill when you’re ready",
          description:
            "Use the side panel or manual trigger to fill the page in one action, or keep Auto mode on when you want faster repeated applications.",
        },
        {
          eyebrow: "Step 4",
          title: "Review and adjust before submitting",
          description:
            "Cygnet speeds up the repetitive typing, but you stay in control of the final review before anything gets sent.",
        },
      ],
      dashboardCta: "Open dashboard",
      installCta: "Add to Chrome",
      helpCta: "Need troubleshooting instead?",
    },
    help: {
      title: "Troubleshooting and support",
      subtitle: "If a page doesn’t fill the way you expect, use this checklist first.",
      sections: [
        {
          title: "1. Confirm the page is one Cygnet can work with",
          body: "Some application pages are fully supported, some are partially supported, and some still need custom handling. If a page looks unusual, that may be the reason.",
        },
        {
          title: "2. Try Manual mode",
          body: "Turn Auto mode off and trigger Autofill only when you’re ready. This is often the easiest way to test a page carefully.",
        },
        {
          title: "3. Review your saved profile",
          body: "Check your dashboard data for missing or outdated values, especially kana, address formatting, university details, and graduation dates.",
        },
        {
          title: "4. Report the page if it still fails",
          body: "If the form is still not behaving, contact us with the page URL and a short description of what was expected versus what actually happened.",
        },
      ],
      faqTitle: "Common questions",
      faqs: [
        {
          question: "Does Cygnet submit forms automatically?",
          answer: "No. Cygnet fills fields for you, but final review and submission stay in your control.",
        },
        {
          question: "Can I keep autofill manual-only?",
          answer: "Yes. Leave Auto mode off and use the Autofill action only when you want it.",
        },
        {
          question: "What if I use multiple browsers or devices?",
          answer: "If you sign in, your profile and resumes can sync through the Cygnet dashboard across supported devices.",
        },
        {
          question: "How do I ask for support on a new site?",
          answer: "Send us the page URL, the company or service name, and a short note about which fields failed.",
        },
      ],
      contactCta: "Contact support",
      demoCta: "View the walkthrough",
    },
    applications: {
      pageTitle: "Applications",
      pageSubtitle: "Track where you’ve applied and what comes next.",
      previewSubtitle: "Preview mode",
      previewBody: "Sign in to save and manage your application history.",
      login: "Sign in with Google",
      summaryTitle: "Pipeline summary",
      summarySubtitle: "A lightweight history of where you’ve applied, what stage you’re in, and what to do next.",
      searchPlaceholder: "Search company, role, notes, or source",
      filterAll: "All statuses",
      listTitle: "Application history",
      emptyTitle: "No applications saved yet",
      emptyDesc: "Add your first application to start tracking statuses, interviews, and next steps.",
      createTitle: "Add application",
      editTitle: "Edit application",
      newButton: "New application",
      save: "Save application",
      saving: "Saving...",
      delete: "Delete",
      deleting: "Deleting...",
      reset: "Reset",
      created: "Application saved",
      deleted: "Application removed",
      saveError: "Could not save application",
      deleteError: "Could not delete application",
      fields: {
        companyName: "Company",
        roleTitle: "Role / title",
        sourceSite: "Source site",
        applicationUrl: "Application URL",
        status: "Status",
        appliedAt: "Applied date",
        nextStepLabel: "Next step",
        nextStepAt: "Next step date",
        contactName: "Recruiter / contact",
        contactEmail: "Contact email",
        notes: "Notes",
      },
      statuses: {
        saved: "Saved",
        applied: "Applied",
        screening: "Screening",
        interview: "Interview",
        offer: "Offer",
        rejected: "Rejected",
        withdrawn: "Withdrawn",
      },
    },
  },
  ja: {
    home: {
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
          desc: "対応している日本の求人応募フォームを開きます。",
        },
        {
          num: "3",
          title: "必要なときに自動入力",
          desc: "自動モードでも手動モードでも、選んだ方法でフォーム入力を進められます。",
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
          desc: "主要な日本の就活サイトで使えるよう対応を広げています。",
        },
      ],
      modesTag: "入力モード",
      modesTitle: "自分に合った使い方を選べます",
      modesIntro:
        "ページを開いたらすぐ埋めたい人も、毎回確認してから押したい人もいます。Cygnet はどちらにも対応します。",
      modes: [
        {
          title: "自動モード",
          desc: "有効にすると、対応フォームが表示されたタイミングで入力候補を反映し、繰り返し作業を速くします。",
          point1: "短時間で複数社に応募したいときに便利",
          point2: "プロフィールが整っている人向け",
        },
        {
          title: "手動モード",
          desc: "自動入力はオフのままにして、必要なときだけ Autofill を押します。確認してから入力したい人向けです。",
          point1: "初めてのサイトを慎重に確認したいときに便利",
          point2: "毎回自分のタイミングで使いたい人向け",
        },
      ],
      trustTitle: "セキュリティとコントロールを前提に",
      trustDesc:
        "保存済みログインパスワードは拡張機能内で暗号化されたままローカル保存されます。ログインして同期機能を使う場合のみ、プロフィールや履歴書が Cygnet の保護されたバックエンドを通じて端末間同期されます。",
      trustPoint1: "保存済みパスワードはローカル保存のみ",
      trustPoint2: "プロフィール・履歴書同期は任意",
      trustPoint3: "自動入力か手動入力かを選べる",
      faqTag: "FAQ",
      faqTitle: "うまく動かないときは？",
      faqIntro: "対応していないページでも、次にどうすればいいかが分かるようにしておきます。",
      faqs: [
        {
          question: "フォームが正しく埋まらないときは？",
          answer:
            "まずは手動モードで試し、保存済みプロフィールを確認してください。それでも難しい場合はヘルプページの手順を見て、ページURLと一緒に連絡してください。",
        },
        {
          question: "自動モードと手動モードの違いは？",
          answer:
            "自動モードは対応フォームが表示されたときに入力を行います。手動モードは Autofill を押したときだけ入力します。",
        },
        {
          question: "何がローカル保存で、何が同期されますか？",
          answer:
            "保存済みログインパスワードは拡張機能内だけに残ります。ログインして同期を使う場合のみ、プロフィールや履歴書がダッシュボードに同期されます。",
        },
        {
          question: "困ったときはどこを見ればいいですか？",
          answer:
            "まずはトラブルシューティングページを見て、それでも解決しなければお問い合わせください。",
        },
      ],
      faqHelpCta: "トラブルシューティングを見る",
      ctaTitle: "就活入力をもっと速く",
      ctaDesc: "Cygnetを無料で使い始めましょう。",
      ctaButton: "Chromeに追加（無料）",
      heroStats: [
        { value: "ローカル保管", label: "保存済み認証情報" },
        { value: "10+", label: "対応サイト" },
        { value: "1クリック", label: "自動入力" },
      ],
      privacyPolicy: "プライバシーポリシー",
      termsOfService: "利用規約",
      contact: "お問い合わせ",
      help: "ヘルプ",
      rightsReserved: "All rights reserved.",
      trustBadge: "プライバシーとコントロール",
      fullDemoCta: "詳しいデモを見る",
    },
    demo: {
      badge: "デモ",
      title: "インストール前に、Cygnet の流れを確認できます",
      subtitle:
        "このページでは、プロフィール登録からフォーム入力、確認までの実際の使い方を順番に紹介します。",
      steps: [
        {
          eyebrow: "ステップ 1",
          title: "プロフィールを一度だけ保存",
          description:
            "名前、住所、学歴、職歴、リンクなど、応募でよく使う情報をダッシュボードに保存します。",
        },
        {
          eyebrow: "ステップ 2",
          title: "応募フォームを開く",
          description:
            "対応している日本の応募フォームを開き、Cygnet が安全に対応できる入力欄を見つけます。",
        },
        {
          eyebrow: "ステップ 3",
          title: "必要なタイミングで Autofill",
          description:
            "サイドパネルや手動ボタンから自動入力を実行します。自動モードを使うこともできます。",
        },
        {
          eyebrow: "ステップ 4",
          title: "送信前に内容を確認",
          description:
            "繰り返し入力を減らしつつ、最終確認と送信は自分でコントロールできます。",
        },
      ],
      dashboardCta: "ダッシュボードを開く",
      installCta: "Chromeに追加",
      helpCta: "うまくいかないときはこちら",
    },
    help: {
      title: "トラブルシューティングとサポート",
      subtitle: "フォーム入力が期待どおりに進まないときは、まずこの順番で確認してください。",
      sections: [
        {
          title: "1. そのページが Cygnet の対応範囲か確認する",
          body: "すべての応募ページが同じではありません。完全対応のページもあれば、一部対応や個別調整が必要なページもあります。",
        },
        {
          title: "2. 手動モードで試す",
          body: "自動モードをオフにし、必要なタイミングでだけ Autofill を押してください。初めてのフォーム確認に向いています。",
        },
        {
          title: "3. 保存済みプロフィールを見直す",
          body: "ふりがな、住所形式、大学情報、卒業年月などが最新かをダッシュボードで確認してください。",
        },
        {
          title: "4. それでも難しければページを報告する",
          body: "ページURLと、どの欄で期待どおりに動かなかったかを添えてお問い合わせください。",
        },
      ],
      faqTitle: "よくある質問",
      faqs: [
        {
          question: "Cygnet はフォームを自動送信しますか？",
          answer: "いいえ。Cygnet は入力を補助しますが、送信前の確認と送信操作はユーザーが行います。",
        },
        {
          question: "常に手動入力だけにできますか？",
          answer: "はい。自動モードをオフにして、必要なときだけ Autofill を使えます。",
        },
        {
          question: "複数端末でも使えますか？",
          answer: "ログインして同期機能を使えば、プロフィールや履歴書をダッシュボード経由で共有できます。",
        },
        {
          question: "新しいサイトの対応はお願いできますか？",
          answer: "はい。ページURL、サービス名、うまくいかなかった欄を送ってください。",
        },
      ],
      contactCta: "お問い合わせ",
      demoCta: "デモを見る",
    },
    applications: {
      pageTitle: "応募履歴",
      pageSubtitle: "どこに応募したか、次に何をするかをまとめて管理します。",
      previewSubtitle: "プレビューモード",
      previewBody: "応募履歴を保存・管理するにはログインしてください。",
      login: "Googleでログイン",
      summaryTitle: "パイプライン概要",
      summarySubtitle: "応募先、進捗、次のアクションを軽く追えるようにした履歴ビューです。",
      searchPlaceholder: "会社名、職種、メモ、応募元を検索",
      filterAll: "すべてのステータス",
      listTitle: "応募一覧",
      emptyTitle: "応募履歴はまだありません",
      emptyDesc: "最初の応募を追加して、進捗や次の予定を管理しましょう。",
      createTitle: "応募を追加",
      editTitle: "応募を編集",
      newButton: "新規追加",
      save: "保存する",
      saving: "保存中...",
      delete: "削除",
      deleting: "削除中...",
      reset: "リセット",
      created: "応募履歴を保存しました",
      deleted: "応募履歴を削除しました",
      saveError: "応募履歴を保存できませんでした",
      deleteError: "応募履歴を削除できませんでした",
      fields: {
        companyName: "会社名",
        roleTitle: "職種 / ポジション",
        sourceSite: "応募元サイト",
        applicationUrl: "応募URL",
        status: "ステータス",
        appliedAt: "応募日",
        nextStepLabel: "次の予定",
        nextStepAt: "次回日程",
        contactName: "担当者名",
        contactEmail: "担当者メール",
        notes: "メモ",
      },
      statuses: {
        saved: "保存済み",
        applied: "応募済み",
        screening: "書類選考",
        interview: "面接",
        offer: "内定",
        rejected: "不合格",
        withdrawn: "辞退",
      },
    },
  },
} as const;

export const PREVIEW_APPLICATIONS: Application[] = [
  {
    id: "preview-1",
    userId: "preview",
    companyName: "Hakuhodo",
    roleTitle: "Account Planner",
    sourceSite: "MyNavi",
    applicationUrl: "https://example.com/hakuhodo",
    status: "interview",
    appliedAt: "2026-04-10",
    nextStepLabel: "Second interview",
    nextStepAt: "2026-04-30",
    contactName: "Recruiting team",
    contactEmail: "recruit@example.com",
    notes: "Prepare portfolio examples and campaign case study.",
    createdAt: "2026-04-10T00:00:00.000Z",
    updatedAt: "2026-04-22T00:00:00.000Z",
  },
  {
    id: "preview-2",
    userId: "preview",
    companyName: "CyberAgent",
    roleTitle: "Marketing Associate",
    sourceSite: "Rikunabi",
    applicationUrl: "https://example.com/cyberagent",
    status: "applied",
    appliedAt: "2026-04-21",
    nextStepLabel: "Awaiting screening result",
    nextStepAt: "",
    contactName: "",
    contactEmail: "",
    notes: "Submitted through the spring graduate track.",
    createdAt: "2026-04-21T00:00:00.000Z",
    updatedAt: "2026-04-21T00:00:00.000Z",
  },
];
