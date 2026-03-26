import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function sanitizeNextPath(value: string | null): string {
  const candidate = String(value || "").trim();
  if (!candidate.startsWith("/")) return "/dashboard";
  if (candidate.startsWith("//")) return "/dashboard";
  return candidate;
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const requestUrl = new URL(request.url);
  const next = sanitizeNextPath(requestUrl.searchParams.get("next"));
  const origin = requestUrl.origin;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error || !data.url) {
    return NextResponse.redirect(new URL("/?error=auth", origin));
  }

  return NextResponse.redirect(data.url);
}
