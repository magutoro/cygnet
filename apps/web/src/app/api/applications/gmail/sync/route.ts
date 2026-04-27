import { NextResponse } from "next/server";
import {
  getGoogleWorkspaceIntegrationRow,
  syncGmailForUser,
} from "@/lib/applications/gmail-sync";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  const integration = await getGoogleWorkspaceIntegrationRow(supabase, user.id);
  if (!integration) {
    return NextResponse.json({ error: "google_not_connected" }, { status: 400 });
  }

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const result = await syncGmailForUser(supabase, user.id, integration, {
      accessToken: session?.provider_token || "",
      grantedScopes: integration.scopes,
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 400 },
    );
  }
}
