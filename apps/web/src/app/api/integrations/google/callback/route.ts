import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  decryptGoogleRefreshToken,
  exchangeGoogleWorkspaceCode,
  getGoogleWorkspaceEmail,
  GOOGLE_WORKSPACE_DEFAULT_LABEL,
  GOOGLE_WORKSPACE_STATE_COOKIE,
  splitGrantedScopes,
} from "@/lib/google-workspace";
import {
  getGoogleWorkspaceIntegrationRow,
  syncGmailForUser,
  upsertGoogleWorkspaceIntegration,
} from "@/lib/applications/gmail-sync";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = String(requestUrl.searchParams.get("code") || "").trim();
  const state = String(requestUrl.searchParams.get("state") || "").trim();
  const origin = requestUrl.origin;
  const cookieStore = await cookies();

  const stateCookie = cookieStore.get(GOOGLE_WORKSPACE_STATE_COOKIE)?.value;
  cookieStore.delete(GOOGLE_WORKSPACE_STATE_COOKIE);

  if (!code || !state || !stateCookie) {
    return NextResponse.redirect(new URL("/applications?google=error", origin));
  }

  let parsedState: { state: string; userId: string; next: string };
  try {
    parsedState = JSON.parse(stateCookie) as { state: string; userId: string; next: string };
  } catch {
    return NextResponse.redirect(new URL("/applications?google=error", origin));
  }

  if (parsedState.state !== state) {
    return NextResponse.redirect(new URL("/applications?google=error", origin));
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== parsedState.userId) {
    return NextResponse.redirect(new URL("/applications?google=error", origin));
  }

  try {
    const tokens = await exchangeGoogleWorkspaceCode(code, origin);
    const existing = await getGoogleWorkspaceIntegrationRow(supabase, user.id);
    const finalRefreshToken =
      tokens.refresh_token ||
      (existing ? decryptGoogleRefreshToken(existing.refresh_token_encrypted) : "");
    if (!finalRefreshToken) {
      throw new Error("No Google refresh token was returned");
    }

    const scopes = splitGrantedScopes(tokens.scope);
    const email = await getGoogleWorkspaceEmail(tokens.access_token);
    await upsertGoogleWorkspaceIntegration(supabase, user.id, {
      googleEmail: email,
      scopes,
      labelName: existing?.label_name || GOOGLE_WORKSPACE_DEFAULT_LABEL,
      refreshToken: finalRefreshToken,
    });

    if (scopes.some((scope) => scope.includes("gmail"))) {
      const latest = await getGoogleWorkspaceIntegrationRow(supabase, user.id);
      if (latest) {
        await syncGmailForUser(supabase, user.id, latest);
      }
    }

    return NextResponse.redirect(new URL(parsedState.next || "/applications", origin));
  } catch (error) {
    console.error("Google Workspace callback failed", error);
    return NextResponse.redirect(new URL("/applications?google=error", origin));
  }
}
