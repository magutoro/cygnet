import { NextResponse } from "next/server";
import {
  buildGoogleSignInScopes,
  googleWorkspaceAliasesFromScopes,
  googleWorkspaceScopesFromAliases,
} from "@/lib/google-workspace";
import { isGoogleWorkspaceOAuthEnabled } from "@/lib/google-workspace-enabled";
import { createClient } from "@/lib/supabase/server";

function sanitizeNextPath(value: string | null): string {
  const candidate = String(value || "").trim();
  if (!candidate.startsWith("/")) return "/dashboard";
  if (candidate.startsWith("//")) return "/dashboard";
  return candidate;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const next = sanitizeNextPath(requestUrl.searchParams.get("next"));
  const origin = requestUrl.origin;
  const confirmed = requestUrl.searchParams.get("confirmed") === "1";
  const workspaceOAuthEnabled = isGoogleWorkspaceOAuthEnabled();
  const workspaceScopes = workspaceOAuthEnabled
    ? [
        ...(requestUrl.searchParams.get("workspaceCalendar") === "1"
          ? googleWorkspaceScopesFromAliases("calendar")
          : []),
        ...(requestUrl.searchParams.get("workspaceGmail") === "1"
          ? googleWorkspaceScopesFromAliases("gmail")
          : []),
      ]
    : [];
  const uniqueWorkspaceScopes = Array.from(new Set(workspaceScopes));
  const workspace = googleWorkspaceAliasesFromScopes(uniqueWorkspaceScopes);

  if (!confirmed) {
    return NextResponse.redirect(
      new URL(`/auth/consent?next=${encodeURIComponent(next)}`, origin),
    );
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}${
        workspace ? `&workspace=${encodeURIComponent(workspace)}` : ""
      }`,
      scopes:
        uniqueWorkspaceScopes.length > 0
          ? buildGoogleSignInScopes(uniqueWorkspaceScopes)
          : undefined,
      queryParams:
        uniqueWorkspaceScopes.length > 0
          ? {
              access_type: "offline",
              include_granted_scopes: "true",
              prompt: "consent",
            }
          : undefined,
    },
  });

  if (error || !data.url) {
    return NextResponse.redirect(new URL("/?error=auth", origin));
  }

  return NextResponse.redirect(data.url);
}
