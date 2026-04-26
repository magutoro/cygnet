import { NextResponse } from "next/server";
import { getGoogleWorkspaceIntegrationRow } from "@/lib/applications/gmail-sync";
import {
  decryptGoogleRefreshToken,
  revokeGoogleWorkspaceToken,
} from "@/lib/google-workspace";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const integration = await getGoogleWorkspaceIntegrationRow(supabase, user.id);
  let revoked = false;

  if (integration) {
    try {
      await revokeGoogleWorkspaceToken(
        decryptGoogleRefreshToken(integration.refresh_token_encrypted),
      );
      revoked = true;
    } catch (error) {
      console.error("Could not revoke Google Workspace token", error);
    }

    const { error } = await supabase
      .from("google_workspace_integrations")
      .delete()
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true, revoked });
}
