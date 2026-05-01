"use client";

import { useEffect, useState } from "react";

const PRELOADER_WORD = "Cygnet".split("");

export default function LandingPreloader({
  lang,
  onDone,
}: {
  lang: "en" | "ja";
  onDone: () => void;
}) {
  const [phase, setPhase] = useState<"typing" | "subtitle" | "fadeout">("typing");

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const subtitleTimer = window.setTimeout(() => setPhase("subtitle"), 1400);
    const fadeTimer = window.setTimeout(() => setPhase("fadeout"), 2800);
    const doneTimer = window.setTimeout(() => onDone(), 3500);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      window.clearTimeout(subtitleTimer);
      window.clearTimeout(fadeTimer);
      window.clearTimeout(doneTimer);
    };
  }, [onDone]);

  return (
    <div
      className={`fixed inset-0 z-[120] flex items-center justify-center bg-black transition-opacity duration-700 ${
        phase === "fadeout" ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <div className="relative flex flex-col items-center gap-5 px-6 text-center">
        <div className="relative overflow-hidden rounded-[1.15rem] border border-white/10 bg-white/[0.02] px-6 py-4 shadow-[0_14px_38px_rgba(0,0,0,0.28)] backdrop-blur-lg">
          <div className="flex items-center justify-center">
            <span className="preloader-word inline-flex items-end whitespace-nowrap font-sans text-[1.65rem] font-semibold tracking-[-0.045em] text-white/95 sm:text-[1.85rem]">
              {PRELOADER_WORD.map((letter, index) => (
                <span
                  key={`${letter}-${index}`}
                  className="preloader-letter inline-block"
                  style={{ animationDelay: `${0.22 + index * 0.11}s` }}
                >
                  {letter}
                </span>
              ))}
            </span>
            <span className="preloader-cursor ml-1 inline-block h-7 w-[1.5px] bg-white/90" />
          </div>
          <div className="preloader-scan absolute inset-0 bg-gradient-to-r from-transparent via-white/6 to-transparent" />
        </div>

        <p
          className={`font-sans text-[0.98rem] font-medium tracking-[0.08em] text-white opacity-95 transition-all duration-700 ${
            phase === "typing" ? "translate-y-3 opacity-0" : "translate-y-0 opacity-100"
          }`}
        >
          {lang === "ja" ? "自動入力を、もっと簡単に。" : "Autofill made easy."}
        </p>
      </div>
    </div>
  );
}
