export function isGoogleWorkspaceOAuthEnabled(): boolean {
  return process.env.NEXT_PUBLIC_GOOGLE_WORKSPACE_OAUTH_ENABLED === "true";
}
