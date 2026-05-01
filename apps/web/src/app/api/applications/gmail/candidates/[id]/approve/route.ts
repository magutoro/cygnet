import { NextResponse } from "next/server";
import {
  approveGmailSyncCandidate,
  getGoogleWorkspaceIntegrationRow,
} from "@/lib/applications/gmail-sync";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const integration = await getGoogleWorkspaceIntegrationRow(supabase, user.id);

  try {
    const result = await approveGmailSyncCandidate(supabase, user.id, id, integration);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 400 },
    );
  }
}
