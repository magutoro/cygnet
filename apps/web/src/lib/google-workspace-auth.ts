import type { SupabaseClient, User } from "@supabase/supabase-js";
import { GOOGLE_WORKSPACE_SCOPES } from "@cygnet/shared";
import {
  decryptGoogleRefreshToken,
  getGoogleWorkspaceEmail,
  hasGoogleScope,
} from "@/lib/google-workspace";
import {
  getGoogleWorkspaceIntegrationRow,
  syncGmailForUser,
  upsertGoogleWorkspaceIntegration,
} from "@/lib/applications/gmail-sync";

export async function storeGoogleWorkspaceIntegrationFromOAuth({
  supabase,
  user,
  accessToken,
  refreshToken,
  requestedScopes,
}: {
  supabase: SupabaseClient;
  user: User;
  accessToken: string;
  refreshToken: string;
  requestedScopes: string[];
}) {
  if (requestedScopes.length === 0) return null;

  const existing = await getGoogleWorkspaceIntegrationRow(supabase, user.id);
  const finalRefreshToken =
    refreshToken || (existing ? decryptGoogleRefreshToken(existing.refresh_token_encrypted) : "");

  if (!finalRefreshToken) {
    throw new Error("Google did not return a refresh token for Workspace permissions");
  }

  const hasGmail = hasGoogleScope(requestedScopes, GOOGLE_WORKSPACE_SCOPES.gmailReadonly);
  let googleEmail = existing?.google_email || user.email || "";

  if (hasGmail && accessToken) {
    try {
      googleEmail = await getGoogleWorkspaceEmail(accessToken);
    } catch (error) {
      console.error("Could not read Google Workspace email during sign-in", error);
    }
  }

  await upsertGoogleWorkspaceIntegration(supabase, user.id, {
    googleEmail,
    scopes: requestedScopes,
    labelName: existing?.label_name,
    refreshToken: finalRefreshToken,
  });

  if (hasGmail) {
    const latest = await getGoogleWorkspaceIntegrationRow(supabase, user.id);
    if (latest) {
      try {
        await syncGmailForUser(supabase, user.id, latest, {
          accessToken,
          grantedScopes: requestedScopes,
        });
      } catch (error) {
        console.error("Initial Gmail sync failed after Workspace sign-in", error);
      }
    }
  }

  return getGoogleWorkspaceIntegrationRow(supabase, user.id);
}
