import { NextResponse } from "next/server";
import { isGoogleWorkspaceOAuthEnabled } from "@/lib/google-workspace-enabled";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = url.origin;
  const next = "/applications";

  if (!isGoogleWorkspaceOAuthEnabled()) {
    return NextResponse.redirect(new URL(`${next}?google=disabled`, origin));
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL(`/auth/consent?next=${encodeURIComponent(next)}`, origin));
  }

  const loginUrl = new URL("/auth/login", origin);
  loginUrl.searchParams.set("next", next);
  loginUrl.searchParams.set("confirmed", "1");
  loginUrl.searchParams.set("workspaceCalendar", "1");
  loginUrl.searchParams.set("workspaceGmail", "1");

  return NextResponse.redirect(loginUrl);
}
