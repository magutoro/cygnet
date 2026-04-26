import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  dbGoogleWorkspaceIntegrationToSummary,
  type DbGoogleWorkspaceIntegration,
} from "@cygnet/shared";
import SettingsClient from "@/components/SettingsClient";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Settings – Cygnet",
  description: "Manage your Cygnet account and connected Google access.",
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/consent?next=/settings");
  }

  const { data: integrationRow } = await supabase
    .from("google_workspace_integrations")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle<DbGoogleWorkspaceIntegration>();

  return (
    <SettingsClient
      userEmail={user.email || ""}
      initialIntegration={dbGoogleWorkspaceIntegrationToSummary(integrationRow)}
    />
  );
}
