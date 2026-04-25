"use client";

const CHROME_EXTENSION_ID = String(
  process.env.NEXT_PUBLIC_CHROME_EXTENSION_ID || process.env.NEXT_PUBLIC_EXTENSION_ID || "",
).trim();
const SAFARI_EXTENSION_ID = String(process.env.NEXT_PUBLIC_SAFARI_EXTENSION_ID || "").trim();
const WEB_BRIDGE_REQUEST_TYPE = "CYGNET_REQUEST_EXTENSION_ID";
const WEB_BRIDGE_RESPONSE_TYPE = "CYGNET_EXTENSION_ID";
let discoveredExtensionId = "";

type ExtensionBridgeResponse = {
  ok?: boolean;
  error?: string;
  email?: string | null;
};

type RuntimeLike = {
  sendMessage: (
    extensionId: string,
    message: unknown,
    callback?: (response: unknown) => void,
  ) => void;
  lastError?: { message?: string };
};

type RuntimeHost = {
  runtime?: RuntimeLike;
};

type RuntimeKind = "chrome" | "safari" | "unknown";

function isLikelySafariUserAgent(): boolean {
  if (typeof navigator === "undefined") return false;
  const userAgent = navigator.userAgent;
  return /Safari/i.test(userAgent) && !/(Chrome|Chromium|Edg|OPR)/i.test(userAgent);
}

function getRuntimeBinding(): { runtime: RuntimeLike; kind: RuntimeKind } | null {
  const runtimeHosts = globalThis as unknown as {
    chrome?: RuntimeHost;
    browser?: RuntimeHost;
  };

  const browserRuntime = runtimeHosts.browser?.runtime;
  if (browserRuntime?.sendMessage) {
    return {
      runtime: browserRuntime,
      kind: isLikelySafariUserAgent() ? "safari" : "unknown",
    };
  }

  const chromeRuntime = runtimeHosts.chrome?.runtime;
  if (chromeRuntime?.sendMessage) {
    return {
      runtime: chromeRuntime,
      kind: "chrome",
    };
  }

  return null;
}

function getConfiguredExtensionId(kind: RuntimeKind): string {
  if (kind === "safari") {
    return SAFARI_EXTENSION_ID || CHROME_EXTENSION_ID;
  }

  if (kind === "chrome") {
    return CHROME_EXTENSION_ID || SAFARI_EXTENSION_ID;
  }

  if (isLikelySafariUserAgent()) {
    return SAFARI_EXTENSION_ID || CHROME_EXTENSION_ID;
  }

  return CHROME_EXTENSION_ID || SAFARI_EXTENSION_ID;
}

async function requestExtensionIdFromContentScript(timeoutMs = 800): Promise<string> {
  if (typeof window === "undefined") return "";
  if (discoveredExtensionId) return discoveredExtensionId;

  return new Promise((resolve) => {
    let done = false;

    const finish = (value: string) => {
      if (done) return;
      done = true;
      window.removeEventListener("message", onMessage);
      window.clearTimeout(timeoutId);
      resolve(value);
    };

    const onMessage = (event: MessageEvent) => {
      if (event.source !== window) return;
      if (event.origin !== window.location.origin) return;
      const data = event.data as { type?: string; extensionId?: string } | undefined;
      if (data?.type !== WEB_BRIDGE_RESPONSE_TYPE) return;

      const extensionId =
        typeof data.extensionId === "string" ? data.extensionId.trim() : "";
      if (!extensionId) return;

      discoveredExtensionId = extensionId;
      finish(extensionId);
    };

    const timeoutId = window.setTimeout(() => finish(""), timeoutMs);
    window.addEventListener("message", onMessage);
    window.postMessage({ type: WEB_BRIDGE_REQUEST_TYPE }, window.location.origin);
  });
}

async function resolveExtensionId(kind: RuntimeKind): Promise<string> {
  const discovered = await requestExtensionIdFromContentScript();
  return discovered || getConfiguredExtensionId(kind);
}

export type ExtensionSessionSyncResult =
  | { ok: true; email?: string | null }
  | { ok: false; error: string };

export type ExtensionProfileRefreshResult =
  | { ok: true }
  | { ok: false; error: string };

async function sendExtensionRuntimeMessage(message: unknown): Promise<ExtensionBridgeResponse> {
  const runtimeBinding = getRuntimeBinding();
  const extensionId = await resolveExtensionId(runtimeBinding?.kind || "unknown");

  if (!extensionId) {
    return {
      ok: false,
      error: "Extension ID is missing",
    };
  }

  if (!runtimeBinding) {
    return {
      ok: false,
      error: "browser runtime is unavailable (extension not installed or page not allowed)",
    };
  }

  return new Promise((resolve) => {
    runtimeBinding.runtime.sendMessage(extensionId, message, (rawResponse) => {
      const runtimeError = runtimeBinding.runtime.lastError?.message;
      if (runtimeError) {
        resolve({ ok: false, error: runtimeError });
        return;
      }

      const response = (rawResponse || {}) as ExtensionBridgeResponse;
      resolve(response.ok ? { ok: true, email: response.email ?? null } : { ok: false, error: response.error || "Unknown extension response" });
    });
  });
}

export async function syncExtensionSessionFromWeb(params: {
  accessToken: string;
  refreshToken: string;
}): Promise<ExtensionSessionSyncResult> {
  const response = await sendExtensionRuntimeMessage({
    type: "CYGNET_IMPORT_SUPABASE_SESSION",
    accessToken: params.accessToken,
    refreshToken: params.refreshToken,
  });

  return response.ok
    ? { ok: true, email: response.email ?? null }
    : { ok: false, error: response.error || "Unknown extension response" };
}

export async function refreshExtensionProfileFromWeb(): Promise<ExtensionProfileRefreshResult> {
  const response = await sendExtensionRuntimeMessage({
    type: "CYGNET_PULL_PROFILE_FROM_WEB",
  });

  return response.ok
    ? { ok: true }
    : { ok: false, error: response.error || "Unknown extension response" };
}
