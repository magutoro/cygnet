"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AuthButton from "@/components/AuthButton";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import NavApplicationsLink from "@/components/NavApplicationsLink";
import NavContactLink from "@/components/NavContactLink";
import NavDashboardLink from "@/components/NavDashboardLink";
import NavFaqLink from "@/components/NavFaqLink";
import NavHowItWorksLink from "@/components/NavHowItWorksLink";

export default function SiteHeader() {
  const [compressed, setCompressed] = useState(false);

  useEffect(() => {
    const update = () => setCompressed(window.scrollY > 32);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  const islandClass =
    "border border-white/62 bg-white/58 shadow-[inset_0_1px_0_rgba(255,255,255,0.82),0_18px_46px_rgba(77,127,181,0.08)] backdrop-blur-2xl";

  return (
    <nav className="sticky top-0 z-50 px-4 py-3 transition-all duration-500 sm:px-6">
      <div
        className={`mx-auto flex items-center justify-between transition-all duration-500 ease-out ${
          compressed
            ? "max-w-5xl rounded-full border border-white/70 bg-white/70 px-3 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.86),0_18px_48px_rgba(77,127,181,0.13)] backdrop-blur-2xl sm:px-4"
            : "max-w-7xl rounded-none border border-transparent bg-transparent px-0 py-1 shadow-none"
        }`}
      >
        <Link
          href="/"
          className={`inline-flex items-center leading-none text-brand-ink transition-all duration-500 ${
            compressed
              ? "h-9 text-[1.42rem] font-semibold tracking-[-0.05em]"
              : "h-12 text-[1.85rem] font-semibold tracking-[-0.045em]"
          }`}
        >
          Cygnet
        </Link>

        <div
          className={`hidden items-center transition-all duration-500 lg:flex ${
            compressed ? "h-9 gap-4 px-0" : `h-12 gap-5 ${islandClass} rounded-full px-9`
          }`}
        >
          <NavDashboardLink />
          <NavApplicationsLink />
          <NavHowItWorksLink />
          <NavFaqLink />
          <NavContactLink />
        </div>

        <div
          className={`flex items-center transition-all duration-500 ${
            compressed ? "h-9 gap-2 px-0" : "h-12 gap-2.5 px-0"
          }`}
        >
          <LanguageSwitcher compact={compressed} />
          <AuthButton compact={compressed} />
        </div>
      </div>
    </nav>
  );
}
