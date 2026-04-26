import { NextResponse } from "next/server";
import { googleWorkspaceScopesFromAliases } from "@/lib/google-workspace";
import { storeGoogleWorkspaceIntegrationFromOAuth } from "@/lib/google-workspace-auth";
import { createClient } from "@/lib/supabase/server";

function sanitizeNextPath(value: string | null): string {
  const candidate = String(value || "").trim();
  if (!candidate.startsWith("/")) return "/dashboard";
  if (candidate.startsWith("//")) return "/dashboard";
  return candidate;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = sanitizeNextPath(searchParams.get("next"));
  const requestedWorkspaceScopes = googleWorkspaceScopesFromAliases(searchParams.get("workspace"));

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.session?.user) {
      if (requestedWorkspaceScopes.length > 0) {
        try {
          await storeGoogleWorkspaceIntegrationFromOAuth({
            supabase,
            user: data.session.user,
            accessToken: data.session.provider_token || "",
            refreshToken: data.session.provider_refresh_token || "",
            requestedScopes: requestedWorkspaceScopes,
          });
        } catch (workspaceError) {
          console.error("Could not save Google Workspace permissions", workspaceError);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}?error=auth`);
}
