import { createClient } from "@/lib/supabase/server";
import { dbToProfile, DEFAULT_PROFILE } from "@cygnet/shared";
import type { DbProfile, DbResume } from "@cygnet/shared";
import DashboardClient from "@/components/DashboardClient";
import { cookies, headers } from "next/headers";
import {
  LANGUAGE_COOKIE_KEY,
  detectLanguageFromAcceptLanguage,
  normalizeLanguage,
} from "@/lib/language";

export const metadata = { title: "Dashboard – Cygnet" };

const COPY = {
  en: {
    dashboard: "Dashboard",
    preview: "Preview mode",
    manage: "Manage your profile and resumes",
    login: "Log in",
    loginWithGoogle: "Sign in with Google",
  },
  ja: {
    dashboard: "ダッシュボード",
    preview: "プレビューモード",
    manage: "プロフィールと履歴書を管理",
    login: "ログイン",
    loginWithGoogle: "Googleでログイン",
  },
} as const;

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const lang =
    normalizeLanguage(cookieStore.get(LANGUAGE_COOKIE_KEY)?.value) ||
    detectLanguageFromAcceptLanguage(headerStore.get("accept-language"));
  const t = COPY[lang];

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPreview = !user;

  let profile = DEFAULT_PROFILE;
  let resumes: DbResume[] = [];

  if (user) {
    const { data: profileRow } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single<DbProfile>();
    profile = profileRow ? dbToProfile(profileRow) : DEFAULT_PROFILE;

    const { data: resumeRows } = await supabase
      .from("resumes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .returns<DbResume[]>();
    resumes = resumeRows ?? [];
  }

  return (
    <div className="min-h-screen bg-brand-bg">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-brand-ink">{t.dashboard}</h1>
          <p className="mt-1 text-sm text-brand-muted">
            {isPreview ? t.preview : t.manage}
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
          <DashboardClient
            initialProfile={profile}
            userId={user?.id ?? ""}
            initialResumes={resumes}
          />
        </div>
      </div>

      {isPreview && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-white/38 backdrop-blur-[1px] px-6">
          <div className="w-full max-w-sm rounded-2xl border border-brand-line bg-white/86 p-6 text-center shadow-xl">
            <p className="text-sm font-semibold text-brand-ink">{t.login}</p>
            <a
              href="/auth/consent?next=/dashboard"
              className="mt-4 inline-flex items-center justify-center rounded-lg bg-brand-strong px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-ink"
            >
              {t.loginWithGoogle}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
