import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_JP, Playfair_Display } from "next/font/google";
import { cookies, headers } from "next/headers";
import SiteHeader from "@/components/SiteHeader";
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
          <SiteHeader />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
