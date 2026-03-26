export function hiraganaToKatakana(value: string): string {
  return String(value || "")
    .normalize("NFKC")
    .replace(/[\u3041-\u3096]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) + 0x60));
}

export function katakanaToHiragana(value: string): string {
  return String(value || "")
    .normalize("NFKC")
    .replace(/[\u30a1-\u30f6]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0x60));
}

export function toHalfWidth(text: string): string {
  return String(text || "")
    .normalize("NFKC")
    .replace(/[\uFF01-\uFF5E]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
    .replace(/\u3000/g, " ");
}

export function extractDigits(text: string): string {
  return toHalfWidth(text).replace(/\D/g, "");
}

export function extractKatakanaCandidate(text: string): string {
  const normalized = String(text || "").normalize("NFKC").trim();
  if (!normalized) return "";
  const katakana = hiraganaToKatakana(normalized);
  if (/[一-龯々〆ヵヶ]/.test(katakana)) return "";
  const onlyKana = katakana.replace(/[^ァ-ヴー]/g, "");
  return onlyKana || "";
}
