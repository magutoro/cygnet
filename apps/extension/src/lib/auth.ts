import { supabase } from "./supabase.js";
import type { User } from "@supabase/supabase-js";

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

export async function signInWithGoogle() {
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

export async function signOut() {
  await supabase.auth.signOut();
}

export async function getUser() {
  const { data: sessionData } = await supabase.auth.getSession();
  if (sessionData.session?.user) return sessionData.session.user;

  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
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
