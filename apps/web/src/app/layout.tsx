import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_JP, Playfair_Display } from "next/font/google";
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

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
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
    <html
      lang={initialLang}
      className={`${geist.variable} ${geistMono.variable} ${playfair.variable} ${notoSansJP.variable}`}
    >
      <body className="font-sans antialiased text-brand-ink">
        <LanguageProvider initialLang={initialLang}>
          <nav className="glass-nav sticky top-0 z-50">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
              <div className="flex min-w-0 items-center gap-7 lg:gap-10">
                <Link
                  href="/"
                  className="inline-flex h-10 items-center text-[1.85rem] font-semibold leading-none tracking-[-0.045em] text-brand-ink"
                >
                  Cygnet
                </Link>
                <div className="flex h-10 items-center gap-5 lg:gap-7">
                  <NavDashboardLink />
                  <NavPrivacyLink />
                  <NavTermsLink />
                  <NavContactLink />
                </div>
              </div>
              <div className="flex h-10 items-center gap-3">
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
