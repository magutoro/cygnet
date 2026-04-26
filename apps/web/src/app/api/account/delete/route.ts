import { NextResponse } from "next/server";
import type { DbGoogleWorkspaceIntegration, DbResume } from "@cygnet/shared";
import {
  decryptGoogleRefreshToken,
  revokeGoogleWorkspaceToken,
} from "@/lib/google-workspace";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

async function parseConfirmation(request: Request): Promise<string> {
  try {
    const body = (await request.json()) as { confirmation?: unknown };
    return String(body.confirmation || "").trim();
  } catch {
    return "";
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const confirmation = await parseConfirmation(request);
  if (confirmation !== user.email && confirmation !== "DELETE") {
    return NextResponse.json({ error: "confirmation_mismatch" }, { status: 400 });
  }

  try {
    const admin = createAdminClient();

    const [{ data: resumes, error: resumeError }, { data: integration }] = await Promise.all([
      admin
        .from("resumes")
        .select("storage_path")
        .eq("user_id", user.id)
        .returns<Pick<DbResume, "storage_path">[]>(),
      admin
        .from("google_workspace_integrations")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle<DbGoogleWorkspaceIntegration>(),
    ]);

    if (resumeError) throw resumeError;

    const storagePaths = (resumes ?? [])
      .map((resume) => resume.storage_path)
      .filter(Boolean);
    if (storagePaths.length > 0) {
      const { error } = await admin.storage.from("resumes").remove(storagePaths);
      if (error) throw error;
    }

    if (integration) {
      try {
        await revokeGoogleWorkspaceToken(
          decryptGoogleRefreshToken(integration.refresh_token_encrypted),
        );
      } catch (error) {
        console.error("Could not revoke Google Workspace token during account deletion", error);
      }
    }

    const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
    if (deleteError) throw deleteError;

    await supabase.auth.signOut();
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "delete_failed";
    console.error("Account deletion failed", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
