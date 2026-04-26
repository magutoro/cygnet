import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  exchangeGoogleWorkspaceCode,
  GOOGLE_WORKSPACE_ALL_SCOPES,
  GOOGLE_WORKSPACE_STATE_COOKIE,
  splitGrantedScopes,
} from "@/lib/google-workspace";
import { storeGoogleWorkspaceIntegrationFromOAuth } from "@/lib/google-workspace-auth";
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
    const scopes = splitGrantedScopes(tokens.scope);
    const workspaceScopes = scopes.filter((scope) =>
      GOOGLE_WORKSPACE_ALL_SCOPES.includes(
        scope as (typeof GOOGLE_WORKSPACE_ALL_SCOPES)[number],
      ),
    );
    await storeGoogleWorkspaceIntegrationFromOAuth({
      supabase,
      user,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token || "",
      requestedScopes: workspaceScopes.length ? workspaceScopes : GOOGLE_WORKSPACE_ALL_SCOPES,
    });

    return NextResponse.redirect(new URL(parsedState.next || "/applications", origin));
  } catch (error) {
    console.error("Google Workspace callback failed", error);
    return NextResponse.redirect(new URL("/applications?google=error", origin));
  }
}
