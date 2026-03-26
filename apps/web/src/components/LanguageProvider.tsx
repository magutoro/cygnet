"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  LANGUAGE_COOKIE_KEY,
  LANGUAGE_STORAGE_KEY,
  detectLanguageFromNavigator,
  normalizeLanguage,
  type SiteLanguage,
} from "@/lib/language";

interface LanguageContextValue {
  lang: SiteLanguage;
  setLang: (next: SiteLanguage) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({
  initialLang,
  children,
}: {
  initialLang: SiteLanguage;
  children: ReactNode;
}) {
  const [lang, setLang] = useState<SiteLanguage>(initialLang);

  useEffect(() => {
    const stored = normalizeLanguage(window.localStorage.getItem(LANGUAGE_STORAGE_KEY));
    if (stored) {
      setLang(stored);
      return;
    }
    const detected = detectLanguageFromNavigator(
      window.navigator.languages,
      window.navigator.language
    );
    setLang(detected);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    document.cookie = `${LANGUAGE_COOKIE_KEY}=${lang}; path=/; max-age=31536000; samesite=lax`;
  }, [lang]);

  const value = useMemo<LanguageContextValue>(() => ({ lang, setLang }), [lang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const value = useContext(LanguageContext);
  if (!value) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return value;
}

