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
      className="text-sm text-brand-muted transition-colors hover:text-brand-ink"
    >
      {COPY[lang]}
    </Link>
  );
}

