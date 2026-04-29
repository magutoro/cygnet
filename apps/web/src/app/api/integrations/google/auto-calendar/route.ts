import { NextResponse } from "next/server";
import {
  dbGoogleWorkspaceIntegrationToSummary,
  type DbGoogleWorkspaceIntegration,
} from "@cygnet/shared";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { enabled?: unknown } | null;
  if (typeof body?.enabled !== "boolean") {
    return NextResponse.json({ error: "invalid_enabled" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("google_workspace_integrations")
    .update({ auto_calendar_sync_enabled: body.enabled })
    .eq("user_id", user.id)
    .select("*")
    .maybeSingle<DbGoogleWorkspaceIntegration>();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (!data) {
    return NextResponse.json({ error: "google_not_connected" }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    integration: dbGoogleWorkspaceIntegrationToSummary(data),
  });
}
