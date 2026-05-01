import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import {
  dbGoogleWorkspaceIntegrationToSummary,
  dbApplicationToApplication,
  dbGmailSyncCandidateToCandidate,
  type DbApplication,
  type DbGmailSyncCandidate,
  type DbGoogleWorkspaceIntegration,
  type GmailSyncCandidate,
} from "@cygnet/shared";
import { createClient } from "@/lib/supabase/server";
import ApplicationsTracker from "@/components/ApplicationsTracker";
import { SITE_COPY, PREVIEW_APPLICATIONS } from "@/content/site-copy";
import {
  LANGUAGE_COOKIE_KEY,
  detectLanguageFromAcceptLanguage,
  normalizeLanguage,
} from "@/lib/language";

export const metadata: Metadata = {
  title: "Applications – Cygnet",
  description: "Track your application history and upcoming steps in Cygnet.",
};

export default async function ApplicationsPage() {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const lang =
    normalizeLanguage(cookieStore.get(LANGUAGE_COOKIE_KEY)?.value) ||
    detectLanguageFromAcceptLanguage(headerStore.get("accept-language"));
  const t = SITE_COPY[lang].applications;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPreview = !user;

  let initialApplications = PREVIEW_APPLICATIONS;
  let initialGmailCandidates: GmailSyncCandidate[] = [];
  let initialIntegration = dbGoogleWorkspaceIntegrationToSummary(null);

  if (user) {
    const [{ data: rows }, { data: candidateRows }, { data: integrationRow }] = await Promise.all([
      supabase
        .from("applications")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .returns<DbApplication[]>(),
      supabase
        .from("gmail_sync_candidates")
        .select("*")
        .eq("user_id", user.id)
        .eq("review_status", "pending")
        .order("detected_at", { ascending: false })
        .returns<DbGmailSyncCandidate[]>(),
      supabase
        .from("google_workspace_integrations")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle<DbGoogleWorkspaceIntegration>(),
    ]);

    initialApplications = (rows ?? []).map(dbApplicationToApplication);
    initialGmailCandidates = (candidateRows ?? []).map(dbGmailSyncCandidateToCandidate);
    initialIntegration = dbGoogleWorkspaceIntegrationToSummary(integrationRow);
  }

  return (
    <main className="page-shell">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-brand-ink">{t.pageTitle}</h1>
          <p className="mt-2 text-sm text-brand-muted">
            {isPreview ? t.previewSubtitle : t.pageSubtitle}
          </p>
        </div>

        <div
          className={
            isPreview
              ? "pointer-events-none select-none opacity-85 blur-[0.8px] saturate-90"
              : ""
          }
          aria-hidden={isPreview}
        >
          <ApplicationsTracker
            initialApplications={initialApplications}
            initialGmailCandidates={initialGmailCandidates}
            initialIntegration={initialIntegration}
            userId={user?.id ?? ""}
          />
        </div>
      </div>

      {isPreview ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-white/24 backdrop-blur-[2px] px-6">
          <div className="w-full max-w-sm rounded-2xl border border-white/80 bg-white/78 p-6 text-center shadow-[0_18px_48px_rgba(77,127,181,0.12)] backdrop-blur-md">
            <p className="text-sm font-semibold text-brand-ink">{t.pageTitle}</p>
            <p className="mt-2 text-sm text-brand-muted">{t.previewBody}</p>
            <a
              href="/auth/consent?next=/applications"
              className="mt-4 inline-flex items-center justify-center rounded-lg bg-brand-strong px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-ink"
            >
              {t.login}
            </a>
          </div>
        </div>
      ) : null}
    </main>
  );
}
