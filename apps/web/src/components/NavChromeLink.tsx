"use client";

import { useLanguage } from "@/components/LanguageProvider";

const CHROME_WEB_STORE_URL =
  "https://chromewebstore.google.com/detail/cygnet/glgmodddifcigjdkpjefebdkmpgabnnp";

const COPY = {
  en: "Add to Chrome",
  ja: "Chromeに追加",
} as const;

type NavChromeLinkProps = {
  compact?: boolean;
};

export default function NavChromeLink({ compact = false }: NavChromeLinkProps) {
  const { lang } = useLanguage();

  return (
    <a
      href={CHROME_WEB_STORE_URL}
      target="_blank"
      rel="noreferrer"
      className={`hidden items-center whitespace-nowrap rounded-lg bg-brand-strong font-medium leading-none text-white transition-all duration-500 hover:bg-brand-ink sm:inline-flex ${
        compact ? "h-8 px-3 text-xs" : lang === "ja" ? "h-10 px-3.5 text-[13px]" : "h-10 px-4 text-sm"
      }`}
    >
      {COPY[lang]}
    </a>
  );
}
