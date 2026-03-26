import { extractDigits } from "./kana.js";

export function splitPostalDigits(value: string): [string, string] {
  const digits = extractDigits(value);
  return [digits.slice(0, 3), digits.slice(3, 7)];
}

export function formatPostalForDisplay(value: string): string {
  const [a, b] = splitPostalDigits(value);
  return b ? `${a}-${b}` : a;
}

export function joinNonEmpty(parts: string[], separator = " "): string {
  return parts
    .map((x) => String(x || "").trim())
    .filter(Boolean)
    .join(separator);
}

export function normalizeProfileUrl(value: string): string {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;

  const withoutFragment = trimmed.split("#")[0] || "";
  const head = withoutFragment.split("/")[0] || "";
  const looksLikeDomain = /^[a-z0-9][a-z0-9.-]*\.[a-z][a-z0-9.-]*$/i.test(head);
  if (looksLikeDomain) return `https://${trimmed}`;

  return trimmed;
}
