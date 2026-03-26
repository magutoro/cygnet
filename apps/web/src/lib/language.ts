export type SiteLanguage = "en" | "ja";

export const LANGUAGE_STORAGE_KEY = "cygnet_lang";
export const LANGUAGE_COOKIE_KEY = "cygnet_lang";

export function normalizeLanguage(value: string | null | undefined): SiteLanguage | null {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) return null;
  if (normalized === "ja" || normalized.startsWith("ja-")) return "ja";
  if (normalized === "en" || normalized.startsWith("en-")) return "en";
  return null;
}

export function detectLanguageFromAcceptLanguage(value: string | null | undefined): SiteLanguage {
  const parts = String(value || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
  for (const part of parts) {
    const token = part.split(";")[0]?.trim();
    const lang = normalizeLanguage(token);
    if (lang) return lang;
  }
  return "en";
}

export function detectLanguageFromNavigator(
  languages: readonly string[] | null | undefined,
  fallback: string | null | undefined
): SiteLanguage {
  for (const value of languages || []) {
    const lang = normalizeLanguage(value);
    if (lang) return lang;
  }
  const fallbackLang = normalizeLanguage(fallback);
  return fallbackLang || "en";
}

