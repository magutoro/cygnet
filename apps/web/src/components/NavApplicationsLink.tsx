"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";

const COPY = {
  en: "Applications",
  ja: "応募履歴",
} as const;

export default function NavApplicationsLink() {
  const { lang } = useLanguage();

  return (
    <Link
      href="/applications"
      className={`glass-nav-link inline-flex h-9 items-center whitespace-nowrap font-medium leading-none tracking-[-0.01em] ${
        lang === "ja" ? "text-[14px] lg:text-[15px]" : "text-[15px] lg:text-base"
      }`}
    >
      {COPY[lang]}
    </Link>
  );
}
