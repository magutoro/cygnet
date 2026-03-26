"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";

const COPY = {
  en: "Contact",
  ja: "お問い合わせ",
} as const;

export default function NavContactLink() {
  const { lang } = useLanguage();

  return (
    <Link
      href="/contact"
      className="text-sm text-brand-muted transition-colors hover:text-brand-ink"
    >
      {COPY[lang]}
    </Link>
  );
}

