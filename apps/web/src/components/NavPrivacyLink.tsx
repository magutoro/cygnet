"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";

const COPY = {
  en: "Privacy",
  ja: "プライバシー",
} as const;

export default function NavPrivacyLink() {
  const { lang } = useLanguage();

  return (
    <Link
      href="/privacy"
      className={`glass-nav-link inline-flex h-9 items-center whitespace-nowrap font-medium leading-none tracking-[-0.01em] ${
        lang === "ja" ? "text-[14px] lg:text-[15px]" : "text-[15px] lg:text-base"
      }`}
    >
      {COPY[lang]}
    </Link>
  );
}
