"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";

const COPY = {
  en: "Dashboard",
  ja: "ダッシュボード",
} as const;

export default function NavDashboardLink() {
  const { lang } = useLanguage();

  return (
    <Link
      href="/dashboard"
      className={`glass-nav-link inline-flex h-9 items-center whitespace-nowrap font-medium leading-none tracking-[-0.01em] ${
        lang === "ja" ? "text-[14px] lg:text-[15px]" : "text-[15px] lg:text-base"
      }`}
    >
      {COPY[lang]}
    </Link>
  );
}
