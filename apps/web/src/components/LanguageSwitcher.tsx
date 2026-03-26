"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import type { SiteLanguage } from "@/lib/language";

const LABELS: Record<SiteLanguage, string> = {
  en: "EN",
  ja: "JP",
};

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDown = (event: MouseEvent) => {
      if (!rootRef.current) return;
      if (rootRef.current.contains(event.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const apply = (next: SiteLanguage) => {
    setLang(next);
    setOpen(false);
  };

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-lg border border-brand-line bg-white px-3 py-2 text-xs font-semibold text-brand-muted transition-colors hover:border-brand hover:text-brand-ink"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-4 w-4"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3c4.97 0 9 4.03 9 9s-4.03 9-9 9-9-4.03-9-9 4.03-9 9-9Zm0 0c2.3 2.32 3.75 5.45 3.75 9S14.3 18.68 12 21m0-18c-2.3 2.32-3.75 5.45-3.75 9S9.7 18.68 12 21M3.75 12h16.5"
          />
        </svg>
        {LABELS[lang]}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-3.5 w-3.5"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-32 rounded-xl border border-brand-line bg-white p-1.5 shadow-lg"
        >
          <button
            type="button"
            role="menuitemradio"
            aria-checked={lang === "en"}
            onClick={() => apply("en")}
            className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${
              lang === "en"
                ? "bg-brand-bg font-semibold text-brand-ink"
                : "text-brand-muted hover:bg-brand-bg/60"
            }`}
          >
            <span>EN</span>
            {lang === "en" ? <span>✓</span> : null}
          </button>
          <button
            type="button"
            role="menuitemradio"
            aria-checked={lang === "ja"}
            onClick={() => apply("ja")}
            className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${
              lang === "ja"
                ? "bg-brand-bg font-semibold text-brand-ink"
                : "text-brand-muted hover:bg-brand-bg/60"
            }`}
          >
            <span>JP</span>
            {lang === "ja" ? <span>✓</span> : null}
          </button>
        </div>
      )}
    </div>
  );
}

