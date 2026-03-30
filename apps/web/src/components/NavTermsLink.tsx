"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";

const COPY = {
  en: "Terms",
  ja: "利用規約",
} as const;

export default function NavTermsLink() {
  const { lang } = useLanguage();

  return (
    <Link
      href="/terms"
      className="text-sm text-brand-muted transition-colors hover:text-brand-ink"
    >
      {COPY[lang]}
    </Link>
  );
}
