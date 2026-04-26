import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { buildGoogleWorkspaceAuthorizeUrl, GOOGLE_WORKSPACE_STATE_COOKIE } from "@/lib/google-workspace";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = url.origin;
  const next = "/applications";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL(`/auth/consent?next=${encodeURIComponent(next)}`, origin));
  }

  const state = crypto.randomUUID();
  const cookieStore = await cookies();
  cookieStore.set(
    GOOGLE_WORKSPACE_STATE_COOKIE,
    JSON.stringify({
      state,
      userId: user.id,
      next,
    }),
    {
      httpOnly: true,
      secure: origin.startsWith("https://"),
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 10,
    },
  );

  return NextResponse.redirect(buildGoogleWorkspaceAuthorizeUrl(origin, state));
}
