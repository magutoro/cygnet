"use client";

import { useLanguage } from "@/components/LanguageProvider";

const CHROME_WEB_STORE_URL =
  "https://chromewebstore.google.com/detail/cygnet/glgmodddifcigjdkpjefebdkmpgabnnp";

const COPY = {
  en: "Add to Chrome",
  ja: "Chromeに追加",
} as const;

export default function NavChromeLink() {
  const { lang } = useLanguage();

  return (
    <a
      href={CHROME_WEB_STORE_URL}
      target="_blank"
      rel="noreferrer"
      className={`hidden h-10 items-center whitespace-nowrap rounded-lg bg-brand-strong font-medium leading-none text-white transition-colors hover:bg-brand-ink sm:inline-flex ${
        lang === "ja" ? "px-3.5 text-[13px]" : "px-4 text-sm"
      }`}
    >
      {COPY[lang]}
    </a>
  );
}
