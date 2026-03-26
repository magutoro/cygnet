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
      className="text-sm text-brand-muted transition-colors hover:text-brand-ink"
    >
      {COPY[lang]}
    </Link>
  );
}

