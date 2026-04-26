import { NextResponse } from "next/server";
import { type DbGoogleWorkspaceIntegration, GOOGLE_WORKSPACE_SCOPES } from "@cygnet/shared";
import { syncGmailForUser } from "@/lib/applications/gmail-sync";
import { createAdminClient } from "@/lib/supabase/admin";

function isAuthorized(request: Request): boolean {
  const secret = String(process.env.CRON_SECRET || "").trim();
  if (!secret) return false;
  const header = request.headers.get("authorization") || "";
  return header === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("google_workspace_integrations")
    .select("*")
    .returns<DbGoogleWorkspaceIntegration[]>();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let syncedUsers = 0;
  let failedUsers = 0;

  for (const integration of data ?? []) {
    if (!integration.scopes.includes(GOOGLE_WORKSPACE_SCOPES.gmailReadonly)) {
      continue;
    }

    try {
      await syncGmailForUser(supabase, integration.user_id, integration);
      syncedUsers += 1;
    } catch (syncError) {
      console.error("Cron Gmail sync failed", integration.user_id, syncError);
      failedUsers += 1;
    }
  }

  return NextResponse.json({
    ok: true,
    syncedUsers,
    failedUsers,
  });
}
