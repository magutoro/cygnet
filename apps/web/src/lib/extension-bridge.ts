"use client";

const EXTENSION_ID = String(process.env.NEXT_PUBLIC_EXTENSION_ID || "").trim();
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

type ChromeLike = {
  runtime?: RuntimeLike;
};

function getRuntime(): RuntimeLike | null {
  const chromeLike = (globalThis as unknown as { chrome?: ChromeLike }).chrome;
  const runtime = chromeLike?.runtime;
  if (!runtime?.sendMessage) return null;
  return runtime;
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

async function resolveExtensionId(): Promise<string> {
  const discovered = await requestExtensionIdFromContentScript();
  return discovered || EXTENSION_ID;
}

export type ExtensionSessionSyncResult =
  | { ok: true; email?: string | null }
  | { ok: false; error: string };

export type ExtensionProfileRefreshResult =
  | { ok: true }
  | { ok: false; error: string };

async function sendExtensionRuntimeMessage(message: unknown): Promise<ExtensionBridgeResponse> {
  const extensionId = await resolveExtensionId();

  if (!extensionId) {
    return {
      ok: false,
      error: "Extension ID is missing",
    };
  }

  const runtime = getRuntime();
  if (!runtime) {
    return {
      ok: false,
      error: "chrome.runtime is unavailable (extension not installed or page not allowed)",
    };
  }

  return new Promise((resolve) => {
    runtime.sendMessage(extensionId, message, (rawResponse) => {
      const runtimeError = runtime.lastError?.message;
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
