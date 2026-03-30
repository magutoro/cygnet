import type { Metadata } from "next";
import { Inter, Noto_Sans_JP } from "next/font/google";
import Link from "next/link";
import { cookies, headers } from "next/headers";
import AuthButton from "@/components/AuthButton";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import NavPrivacyLink from "@/components/NavPrivacyLink";
import NavTermsLink from "@/components/NavTermsLink";
import NavContactLink from "@/components/NavContactLink";
import NavDashboardLink from "@/components/NavDashboardLink";
import {
  LANGUAGE_COOKIE_KEY,
  detectLanguageFromAcceptLanguage,
  normalizeLanguage,
  type SiteLanguage,
} from "@/lib/language";
import { LanguageProvider } from "@/components/LanguageProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto-jp",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cygnet – autofill made easy",
  description:
    "Autofill Japanese job application forms with your saved profile. A free Chrome extension that makes shuukatsu painless.",
  keywords: [
    "Cygnet",
    "autofill",
    "Japanese job applications",
    "shuukatsu",
    "Chrome extension",
  ],
};

async function getInitialLanguage(): Promise<SiteLanguage> {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const fromCookie = normalizeLanguage(cookieStore.get(LANGUAGE_COOKIE_KEY)?.value);
  if (fromCookie) return fromCookie;
  return detectLanguageFromAcceptLanguage(headerStore.get("accept-language"));
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialLang = await getInitialLanguage();

  return (
    <html lang={initialLang} className={`${inter.variable} ${notoSansJP.variable}`}>
      <body className="font-sans antialiased">
        <LanguageProvider initialLang={initialLang}>
          <nav className="sticky top-0 z-50 border-b border-brand-line/60 bg-brand-bg/80 backdrop-blur-lg">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
              <div className="flex items-center gap-6">
                <Link
                  href="/"
                  className="text-xl font-bold tracking-tight text-brand-ink"
                >
                  Cygnet
                </Link>
                <NavDashboardLink />
                <NavPrivacyLink />
                <NavTermsLink />
                <NavContactLink />
              </div>
              <div className="flex items-center gap-3">
                <LanguageSwitcher />
                <AuthButton />
              </div>
            </div>
          </nav>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
