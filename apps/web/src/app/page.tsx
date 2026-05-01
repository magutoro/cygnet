"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import LandingDemo from "@/components/LandingDemo";
import LandingPreloader from "@/components/LandingPreloader";
import { useLanguage } from "@/components/LanguageProvider";
import { SITE_COPY } from "@/content/site-copy";

const CHROME_WEB_STORE_URL =
  "https://chromewebstore.google.com/detail/cygnet/glgmodddifcigjdkpjefebdkmpgabnnp";

const STEP_ICONS = [
  (
    <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  ),
  (
    <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A8.966 8.966 0 0 1 3 12c0-1.264.26-2.467.729-3.558" />
    </svg>
  ),
  (
    <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
    </svg>
  ),
];

const FEATURE_ICONS = [
  (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15a2.25 2.25 0 0 1 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
    </svg>
  ),
  (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m10.5 21 5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 0 1-3.827-5.802" />
    </svg>
  ),
  (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
  ),
  (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 0 0 2.25-2.25V6A2.25 2.25 0 0 0 8.25 3.75H6A2.25 2.25 0 0 0 3.75 6v2.25A2.25 2.25 0 0 0 6 10.5Zm0 9.75h2.25A2.25 2.25 0 0 0 10.5 18v-2.25a2.25 2.25 0 0 0-2.25-2.25H6a2.25 2.25 0 0 0-2.25 2.25V18A2.25 2.25 0 0 0 6 20.25Zm9.75-9.75H18a2.25 2.25 0 0 0 2.25-2.25V6A2.25 2.25 0 0 0 18 3.75h-2.25A2.25 2.25 0 0 0 13.5 6v2.25a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  ),
];

const PRELOADER_KEY = "cygnet:b4-home-preloader-seen";
type BootState = "bootPending" | "preloader" | "ready";

export default function HomePage() {
  const { lang } = useLanguage();
  const t = SITE_COPY[lang].home;
  const isJapanese = lang === "ja";
  const [bootState, setBootState] = useState<BootState>("bootPending");
  const [demoReady, setDemoReady] = useState(false);
  const scrollRestorationRef = useRef<History["scrollRestoration"] | null>(null);
  const forcePreloaderRef = useRef(false);
  const homeReady = bootState === "ready";
  const showPreloader = bootState === "preloader";

  const restoreScrollRestoration = useCallback(() => {
    if (!("scrollRestoration" in window.history)) {
      return;
    }

    if (scrollRestorationRef.current !== null) {
      window.history.scrollRestoration = scrollRestorationRef.current;
      scrollRestorationRef.current = null;
    }
  }, []);

  const resetScrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  const scrollToHashTarget = useCallback(() => {
    const hash = window.location.hash;
    if (!hash) {
      return;
    }

    const targetId = decodeURIComponent(hash.slice(1));
    if (!targetId) {
      return;
    }

    document.getElementById(targetId)?.scrollIntoView();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const forcePreloader = params.get("preloader") === "1";
    const seen = !forcePreloader && window.sessionStorage.getItem(PRELOADER_KEY) === "1";
    const hasHash = window.location.hash.length > 1;
    forcePreloaderRef.current = forcePreloader;

    if (seen) {
      setBootState("ready");
      return;
    }

    if (!hasHash) {
      if ("scrollRestoration" in window.history) {
        scrollRestorationRef.current = window.history.scrollRestoration;
        window.history.scrollRestoration = "manual";
      }
      resetScrollToTop();
    }

    setBootState("preloader");

    return () => {
      restoreScrollRestoration();
    };
  }, [resetScrollToTop, restoreScrollRestoration]);

  useEffect(() => {
    if (!homeReady) {
      setDemoReady(false);
      return;
    }

    const demoTimer = window.setTimeout(() => setDemoReady(true), 450);
    const scrollTimer = window.setTimeout(() => {
      scrollToHashTarget();
      restoreScrollRestoration();
    }, 80);

    return () => {
      window.clearTimeout(demoTimer);
      window.clearTimeout(scrollTimer);
    };
  }, [homeReady, restoreScrollRestoration, scrollToHashTarget]);

  const finishPreloader = () => {
    window.sessionStorage.setItem(PRELOADER_KEY, "1");
    if (forcePreloaderRef.current) {
      const url = new URL(window.location.href);
      url.searchParams.delete("preloader");
      window.history.replaceState(window.history.state, "", url.toString());
      forcePreloaderRef.current = false;
    }
    setBootState("ready");
  };

  const revealClass = homeReady ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0";

  const heroTitleClass = isJapanese
    ? "max-w-[34rem] text-[2.95rem] font-bold leading-[1.14] tracking-[-0.05em] sm:text-[3.7rem] lg:text-[4.3rem]"
    : "max-w-[38rem] text-5xl font-bold leading-[1.1] tracking-tight md:text-6xl";
  const heroSubtitleClass = isJapanese
    ? "mt-6 max-w-[29rem] text-[0.99rem] leading-[1.95] text-brand-muted sm:text-[1.05rem]"
    : "mt-6 max-w-lg text-lg leading-relaxed text-brand-muted";
  const heroPrimaryButtonClass = isJapanese ? "primary-cta-button" : "primary-cta-button px-8 text-base";
  const heroSecondaryButtonClass = isJapanese
    ? "inline-flex h-14 items-center gap-2 px-0 text-[0.98rem] font-semibold leading-none text-brand-ink transition-colors hover:text-brand"
    : "inline-flex h-14 items-center gap-2 px-0 text-base font-semibold leading-none text-brand-ink transition-colors hover:text-brand";
  if (bootState === "bootPending") {
    return <div aria-hidden="true" className="page-shell" />;
  }

  return (
    <div className="page-shell">
      {showPreloader ? <LandingPreloader lang={lang} onDone={finishPreloader} /> : null}

      <div className={`relative transition-opacity duration-500 ${homeReady ? "opacity-100" : "opacity-0"}`}>
        <section className="relative overflow-hidden pb-24 pt-20 sm:pb-28 sm:pt-24 lg:pt-32">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="liquid-drift-slow absolute -top-20 -left-12 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.98),rgba(211,232,253,0.44)_30%,rgba(160,197,240,0.12)_56%,transparent_76%)] blur-3xl" />
            <div className="liquid-drift-medium absolute top-10 -right-16 h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.92),rgba(196,221,248,0.42)_30%,rgba(138,185,235,0.12)_58%,transparent_78%)] blur-3xl" />
            <div className="liquid-drift-fast absolute bottom-[-8rem] left-1/3 h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.9),rgba(218,236,255,0.26)_30%,rgba(150,196,241,0.08)_56%,transparent_74%)] blur-3xl" />
            <div className="liquid-shimmer absolute top-20 left-1/4 h-64 w-[26rem] rounded-full bg-[linear-gradient(120deg,rgba(255,255,255,0),rgba(255,255,255,0.78),rgba(255,255,255,0))] opacity-30 blur-3xl" />
          </div>

          <div className="mx-auto max-w-7xl px-6">
            <div className={`grid items-center gap-16 transition-all duration-700 lg:grid-cols-2 ${revealClass}`}>
              <div className={isJapanese ? "max-w-[36rem]" : ""}>
                <p className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-white/70 bg-white/60 px-4 py-2 text-[0.74rem] font-semibold uppercase leading-none tracking-[0.16em] text-brand-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.84)] backdrop-blur-xl">
                  <ChromeMarkIcon className="h-3.5 w-3.5 shrink-0 text-brand" />
                  {t.heroBadge}
                </p>

                <h1 className={`text-brand-ink ${heroTitleClass}`}>
                  {renderHeroTitle(lang, t.heroTitle, t.heroTitleEmphasis)}
                </h1>

                <p className={heroSubtitleClass}>{t.heroSubtitle}</p>

                <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                  <a
                    href={CHROME_WEB_STORE_URL}
                    target="_blank"
                    rel="noreferrer"
                    className={heroPrimaryButtonClass}
                  >
                    <ChromeMarkIcon className="h-5 w-5 shrink-0 text-white" />
                    {t.ctaButton}
                  </a>
                  <Link href="/how-it-works" className={heroSecondaryButtonClass}>
                    {t.howItWorksCta}
                    <ArrowRightIcon />
                  </Link>
                </div>

              </div>

              <div className="relative lg:pl-3">
                <div className="relative aspect-[4/3] overflow-visible rounded-3xl border border-white/58 bg-white/36 p-8 shadow-[0_24px_68px_rgba(15,124,171,0.14)] backdrop-blur-2xl">
                  <div className="liquid-shimmer pointer-events-none absolute inset-0 rounded-[inherit] bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.92),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.5),rgba(255,255,255,0.08)_56%,transparent_78%)] opacity-80" />
                  <div className="liquid-drift-medium pointer-events-none absolute top-10 -right-8 h-36 w-36 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.86),rgba(161,232,255,0.3)_42%,transparent_72%)] blur-2xl" />
                  <div className="relative z-20 mx-auto max-w-[28.5rem]">
                    <LandingDemo lang={lang} active={demoReady} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-24 sm:py-28">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-16 max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">{t.howItWorksTag}</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-brand-ink sm:text-4xl lg:text-5xl">
                {t.howItWorksTitle}
              </h2>
            </div>

            <div className="glass-panel overflow-hidden rounded-[2rem] md:grid md:grid-cols-3">
              {t.steps.map((step, index) => (
                <div
                  key={step.num}
                  className={`relative p-8 sm:p-10 ${
                    index < t.steps.length - 1 ? "border-b border-white/45 md:border-b-0 md:border-r" : ""
                  } border-white/45`}
                >
                  <div className="absolute right-6 top-6 text-6xl font-semibold text-white/45">{step.num}</div>
                  <div className="relative">
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-white shadow-[0_14px_30px_rgba(15,124,171,0.2)]">
                      {STEP_ICONS[index]}
                    </div>
                    <h3 className="text-xl font-semibold text-brand-ink">{step.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-brand-muted">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-start">
              <Link href="/how-it-works" className="glass-button-secondary px-6 py-3 text-sm font-semibold">
                {t.fullDemoCta}
              </Link>
            </div>
          </div>
        </section>

        <section className="py-24 sm:py-28">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-16 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">{t.featuresTag}</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-brand-ink sm:text-4xl lg:text-5xl">
                {renderFeaturesTitle(lang, t.featuresTitle)}
              </h2>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="glass-panel rounded-[2rem] p-8 sm:p-10 lg:col-span-2">
                <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.9fr)]">
                  <div>
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/46 text-brand shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                      {FEATURE_ICONS[0]}
                    </div>
                    <h3 className="text-2xl font-bold text-brand-ink">{t.features[0].title}</h3>
                    <p className="mt-3 max-w-2xl leading-relaxed text-brand-muted">{t.features[0].desc}</p>
                  </div>
                  <div className="glass-panel-soft rounded-[1.5rem] p-6">
                    <div className="space-y-3">
                      {(lang === "ja"
                        ? ["氏名", "フリガナ", "住所", "学歴"]
                        : ["Name", "Furigana", "Address", "Education"]
                      ).map((item) => (
                        <div key={item} className="flex items-center gap-3">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[rgba(72,182,152,0.92)] text-white">
                            <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3" stroke="currentColor" strokeWidth={2.4}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                            </svg>
                          </div>
                          <span className="text-sm text-brand-ink/80">{item}</span>
                          <div className="h-2 flex-1 rounded-full bg-[rgba(150,220,255,0.7)]" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {t.features.slice(1).map((feature, index) => (
                <div key={feature.title} className="glass-panel rounded-[1.75rem] p-8">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/48 text-brand shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                    {FEATURE_ICONS[index + 1]}
                  </div>
                  <h3 className="text-lg font-semibold text-brand-ink">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-brand-muted">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 sm:py-28">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-16 max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">{t.modesTag}</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-brand-ink sm:text-4xl lg:text-5xl">
                {t.modesTitle}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-brand-muted">{t.modesIntro}</p>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              {t.modes.map((mode, index) => (
                <div key={mode.title} className="glass-panel rounded-[2rem] p-8">
                  <div className="mb-5 inline-flex rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-brand">
                    {index === 0 ? "Auto" : "Manual"}
                  </div>
                  <h3 className="text-2xl font-bold text-brand-ink">{mode.title}</h3>
                  <p className="mt-4 text-sm leading-relaxed text-brand-muted">{mode.desc}</p>
                  <div className="mt-6 grid gap-3">
                    {[mode.point1, mode.point2].map((point) => (
                      <div key={point} className="glass-panel-soft flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-brand-ink">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white">
                          <CheckIcon />
                        </div>
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 sm:py-28">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
              <div className="glass-panel rounded-[2rem] p-8 sm:p-10">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">{t.trustBadge}</p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-brand-ink sm:text-4xl">{t.trustTitle}</h2>
                <p className="mt-5 max-w-3xl text-lg leading-relaxed text-brand-muted">{t.trustDesc}</p>
                <div className="mt-8 grid gap-3">
                  {[t.trustPoint1, t.trustPoint2, t.trustPoint3].map((item) => (
                    <div key={item} className="glass-panel-soft flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-brand-ink">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white">
                        <CheckIcon />
                      </div>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-panel-strong flex aspect-square items-center justify-center rounded-[2rem]">
                <div className="glass-panel flex h-36 w-36 items-center justify-center rounded-[2rem]">
                  <ShieldIcon />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 sm:py-28">
          <div className="mx-auto max-w-6xl px-6">
            <div className="glass-panel rounded-[2rem] p-8 sm:p-10">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">{t.faqTag}</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-brand-ink sm:text-4xl">{t.faqTitle}</h2>
              <p className="mt-4 max-w-3xl text-base leading-relaxed text-brand-muted">{t.faqIntro}</p>
              <div className="mt-8 space-y-3">
                {t.faqs.map((item) => (
                  <details key={item.question} className="rounded-2xl border border-white/70 bg-white/46 px-5 py-4">
                    <summary className="cursor-pointer list-none text-base font-semibold text-brand-ink">
                      {item.question}
                    </summary>
                    <p className="mt-3 text-sm leading-relaxed text-brand-muted">{item.answer}</p>
                  </details>
                ))}
              </div>
              <div className="mt-8">
                <Link href="/help" className="glass-button-secondary px-6 py-3 text-sm font-semibold">
                  {t.faqHelpCta}
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 sm:py-28">
          <div className="mx-auto max-w-6xl px-6">
            <div className="glass-panel-dark relative overflow-hidden rounded-[2rem] p-8 text-center sm:p-12">
              <div className="liquid-shimmer pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.28),rgba(255,255,255,0.02)_46%,transparent_72%)]" />
              <div className="liquid-drift-slow pointer-events-none absolute -top-10 right-10 h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.7),rgba(255,255,255,0)_68%)] blur-2xl" />
              <div className="relative">
                <h2 className="text-3xl font-bold tracking-tight text-[rgba(245,253,255,0.98)] sm:text-4xl">
                  {t.ctaTitle}
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-lg text-[rgba(245,253,255,0.82)]">{t.ctaDesc}</p>
                <a
                  href={CHROME_WEB_STORE_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="glass-button-secondary mt-8 px-10 py-4 text-sm font-semibold"
                >
                  <DownloadIcon />
                  {t.ctaButton}
                </a>
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-white/45 bg-white/28 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 py-10 sm:flex-row">
            <div className="text-sm font-semibold text-brand-ink">Cygnet</div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-brand-muted">
              <Link href="/privacy" className="glass-nav-link">
                {t.privacyPolicy}
              </Link>
              <Link href="/terms" className="glass-nav-link">
                {t.termsOfService}
              </Link>
              <Link href="/help" className="glass-nav-link">
                {t.help}
              </Link>
              <Link href="/how-it-works" className="glass-nav-link">
                {t.howItWorksFooter}
              </Link>
              <Link href="/contact" className="glass-nav-link">
                {t.contact}
              </Link>
            </div>
            <p className="text-xs text-brand-muted">
              &copy; {new Date().getFullYear()} Cygnet. {t.rightsReserved}
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth={2.4}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-20 w-20 text-brand" stroke="currentColor" strokeWidth={1.4}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
    </svg>
  );
}

function renderFeaturesTitle(lang: "en" | "ja", title: string) {
  if (lang !== "en") {
    return title;
  }

  return (
    <>
      Everything you need for <span className="font-serif italic text-brand">shuukatsu</span>
    </>
  );
}

function renderHeroTitle(lang: "en" | "ja", title: string, emphasis: string) {
  if (!emphasis) {
    if (lang === "ja" && title.includes("、")) {
      const [firstLine, ...rest] = title.split("、");

      return (
        <>
          <span className="block">{firstLine}、</span>
          <span className="block">{rest.join("、")}</span>
        </>
      );
    }

    return title;
  }

  const leading = title.replace(emphasis, "").trim();

  if (lang === "en") {
    return (
      <>
        <span className="block">{leading}</span>
        <span className="mt-1 block font-serif italic text-brand-ink">{emphasis}</span>
      </>
    );
  }

  return (
    <>
      <span className="block">{leading}</span>
      <span className="mt-4 block text-[0.72em] leading-[1.16] tracking-[-0.02em] text-brand">{emphasis}</span>
    </>
  );
}

function ChromeMarkIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10.88 21.94 15.46 14" />
      <path d="M21.17 8H12" />
      <path d="M3.95 6.06 8.54 14" />
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-5-5 5 5-5 5" />
    </svg>
  );
}
