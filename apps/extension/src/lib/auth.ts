import { supabase } from "./supabase.js";
import type { User } from "@supabase/supabase-js";
import type { Session } from "@supabase/supabase-js";
import { isSafariTarget } from "./browser.js";
import { openWebLogin } from "./web.js";

function parseAuthFragment(fragment: string): URLSearchParams {
  const raw = fragment.startsWith("#") ? fragment.slice(1) : fragment;
  return new URLSearchParams(raw);
}

function parseResponseUrl(responseUrl: string): {
  code: string;
  accessToken: string;
  refreshToken: string;
  idToken: string;
  oauthError: string;
} {
  const url = new URL(responseUrl);
  const query = url.searchParams;
  const hash = parseAuthFragment(url.hash);

  return {
    code: (query.get("code") || "").trim(),
    accessToken: (hash.get("access_token") || query.get("access_token") || "").trim(),
    refreshToken: (hash.get("refresh_token") || query.get("refresh_token") || "").trim(),
    idToken: (hash.get("id_token") || query.get("id_token") || "").trim(),
    oauthError: (
      hash.get("error_description") ||
      query.get("error_description") ||
      hash.get("error") ||
      query.get("error") ||
      ""
    ).trim(),
  };
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return String(error || "");
}

export function isInvalidRefreshTokenError(error: unknown): boolean {
  const message = getErrorMessage(error).toLowerCase();
  return message.includes("invalid refresh token") || message.includes("already used");
}

async function clearLocalSession(): Promise<void> {
  try {
    await supabase.auth.signOut({ scope: "local" });
    return;
  } catch {}

  try {
    await supabase.auth.signOut();
  } catch {}
}

async function finalizeExtensionSession(responseUrl: string): Promise<void> {
  const parsed = parseResponseUrl(responseUrl);

  if (parsed.oauthError) {
    throw new Error(parsed.oauthError);
  }

  if (parsed.code) {
    const { error } = await supabase.auth.exchangeCodeForSession(parsed.code);
    if (error) throw error;
    return;
  }

  if (parsed.accessToken && parsed.refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token: parsed.accessToken,
      refresh_token: parsed.refreshToken,
    });
    if (error) throw error;
    return;
  }

  if (parsed.idToken) {
    const { error } = await supabase.auth.signInWithIdToken({
      provider: "google",
      token: parsed.idToken,
    });
    if (error) throw error;
    return;
  }

  const redirectUrl = chrome.identity.getRedirectURL();
  throw new Error(`No auth tokens found in callback. Expected redirect to: ${redirectUrl}`);
}

async function signInWithGoogle() {
  const redirectUrl = chrome.identity.getRedirectURL();
  console.log("[Cygnet] Extension redirect URL:", redirectUrl);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: redirectUrl,
      skipBrowserRedirect: true,
      queryParams: {
        prompt: "consent",
      },
    },
  });

  if (error || !data?.url) {
    throw new Error(error?.message || "Failed to create Supabase OAuth URL");
  }

  let responseUrl: string | undefined;
  try {
    responseUrl = await chrome.identity.launchWebAuthFlow({
      url: data.url,
      interactive: true,
    });
  } catch (err) {
    console.error("[Cygnet] launchWebAuthFlow error:", err);
    throw new Error(`Google sign-in failed for extension redirect URI: ${redirectUrl}`);
  }

  if (!responseUrl) throw new Error("Auth flow was cancelled");
  await finalizeExtensionSession(responseUrl);
}

export async function startSignIn(): Promise<"extension" | "web"> {
  if (isSafariTarget()) {
    await openWebLogin();
    return "web";
  }

  await signInWithGoogle();
  return "extension";
}

export async function signOut() {
  await clearLocalSession();
}

export async function getUser() {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData.session?.user) return sessionData.session.user;

    const { data } = await supabase.auth.getUser();
    return data.user ?? null;
  } catch (error) {
    if (isInvalidRefreshTokenError(error)) {
      await clearLocalSession();
      return null;
    }
    throw error;
  }
}

export async function getSession() {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session;
  } catch (error) {
    if (isInvalidRefreshTokenError(error)) {
      await clearLocalSession();
      return null;
    }
    throw error;
  }
}

export async function importSessionTokens(
  accessToken: string,
  refreshToken: string
): Promise<Session | null> {
  try {
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (error) throw error;
    return data.session ?? null;
  } catch (error) {
    if (!isInvalidRefreshTokenError(error)) {
      throw error;
    }

    const existingSession = await getSession();
    if (existingSession?.user) {
      return existingSession;
    }

    await clearLocalSession();
    return null;
  }
}

export async function waitForUser(timeoutMs = 5000, intervalMs = 200): Promise<User | null> {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    const user = await getUser();
    if (user) return user;
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  return null;
}

export function onAuthStateChange(callback: (user: User | null) => void): () => void {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });

  return () => subscription.unsubscribe();
}
