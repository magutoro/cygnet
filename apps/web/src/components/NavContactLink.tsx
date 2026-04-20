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
      className={`glass-nav-link inline-flex h-9 items-center whitespace-nowrap font-medium leading-none tracking-[-0.01em] ${
        lang === "ja" ? "text-[14px] lg:text-[15px]" : "text-[15px] lg:text-base"
      }`}
    >
      {COPY[lang]}
    </Link>
  );
}
