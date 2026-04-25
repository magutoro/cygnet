export type BrowserTarget = "chrome" | "safari";

const browserTarget: BrowserTarget =
  import.meta.env.VITE_BROWSER_TARGET === "safari" ? "safari" : "chrome";

const UNSUPPORTED_PREFIXES = [
  "chrome://",
  "edge://",
  "about:",
  "chrome-extension://",
  "safari://",
  "safari-web-extension://",
  "safari-extension://",
];

export function getBrowserTarget(): BrowserTarget {
  return browserTarget;
}

export function isSafariTarget(): boolean {
  return browserTarget === "safari";
}

export function getSignInLabel(): string {
  return isSafariTarget() ? "Webでログイン" : "Googleでログイン";
}

export function getSignInBusyLabel(): string {
  return isSafariTarget() ? "Webログインを開いています..." : "ログイン中...";
}

export function getSignInRequiredMessage(): string {
  return isSafariTarget() ? "先にWebでログインしてください" : "先にGoogleでログインしてください";
}

export function getSignInOpenedStatus(): string {
  return isSafariTarget()
    ? "Webダッシュボードを開きました。ログイン後に拡張機能が接続されます"
    : "ログインしました";
}

export function isUnsupportedBrowserUrl(url: string | undefined): boolean {
  const raw = String(url || "").trim().toLowerCase();
  if (!raw) return true;
  if (raw.includes("chromewebstore.google.com")) return true;
  return UNSUPPORTED_PREFIXES.some((prefix) => raw.startsWith(prefix));
}
