"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { useLanguage } from "@/components/LanguageProvider";

const COPY = {
  en: {
    signIn: "Sign in with Google",
    settings: "Settings",
    signOut: "Sign out",
  },
  ja: {
    signIn: "Googleでログイン",
    settings: "設定",
    signOut: "ログアウト",
  },
} as const;

type AuthButtonProps = {
  compact?: boolean;
};

export default function AuthButton({ compact = false }: AuthButtonProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { lang } = useLanguage();
  const t = COPY[lang];

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div
        className={`animate-pulse rounded-lg bg-brand-line/50 transition-all duration-500 ${
          compact ? "h-8 w-28" : "h-10 w-40"
        }`}
      />
    );
  }

  if (!user) {
    return (
      <a
        href="/auth/consent?next=/dashboard"
        className={`inline-flex items-center whitespace-nowrap rounded-lg bg-brand-strong font-medium leading-none text-white transition-all duration-500 hover:bg-brand-ink ${
          compact
            ? "h-8 gap-1.5 px-3 text-xs"
            : lang === "ja"
              ? "h-10 gap-2 px-3.5 text-[13px]"
              : "h-10 gap-2 px-4 text-sm"
        }`}
      >
        <svg
          className={`${compact ? "h-3.5 w-3.5" : "h-4 w-4"}`}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        {t.signIn}
      </a>
    );
  }

  return (
    <div
      className={`glass-panel-soft flex items-center rounded-full transition-all duration-500 ${
        compact ? "h-8 gap-2 px-2" : "h-10 gap-3 px-3"
      }`}
    >
      <div className="flex items-center gap-2">
        {user.user_metadata?.avatar_url ? (
          <img
            src={user.user_metadata.avatar_url}
            alt=""
            className={`rounded-full ring-1 ring-white/70 transition-all duration-500 ${
              compact ? "h-7 w-7" : "h-8 w-8"
            }`}
            referrerPolicy="no-referrer"
          />
        ) : (
          <div
            className={`flex items-center justify-center rounded-full bg-brand font-bold text-white shadow-[0_8px_18px_rgba(15,124,171,0.24)] transition-all duration-500 ${
              compact ? "h-7 w-7 text-[11px]" : "h-8 w-8 text-xs"
            }`}
          >
            {(user.email?.[0] ?? "?").toUpperCase()}
          </div>
        )}
        <span
          className={`hidden text-brand-muted transition-all duration-500 sm:inline ${
            compact ? "max-w-[10rem] truncate text-xs" : "text-sm"
          }`}
        >
          {user.email}
        </span>
      </div>
      <a
        href="/settings"
        className={`glass-button-secondary font-medium leading-none transition-all duration-500 ${
          compact ? "h-7 px-2.5 text-[11px]" : "h-8 px-3 text-xs"
        }`}
      >
        {t.settings}
      </a>
      <a
        href="/auth/logout"
        className={`glass-button-secondary font-medium leading-none transition-all duration-500 ${
          compact ? "h-7 px-2.5 text-[11px]" : "h-8 px-3 text-xs"
        }`}
      >
        {t.signOut}
      </a>
    </div>
  );
}
