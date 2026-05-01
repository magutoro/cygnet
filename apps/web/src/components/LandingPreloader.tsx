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
  const [phase, setPhase] = useState<"mark" | "message" | "fadeout">("mark");

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const messageTimer = window.setTimeout(() => setPhase("message"), 1200);
    const fadeTimer = window.setTimeout(() => setPhase("fadeout"), 2700);
    const doneTimer = window.setTimeout(() => onDone(), 3400);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      window.clearTimeout(messageTimer);
      window.clearTimeout(fadeTimer);
      window.clearTimeout(doneTimer);
    };
  }, [onDone]);

  return (
    <div
      className={`fixed inset-0 z-[120] flex items-center justify-center overflow-hidden bg-[#faf9f5] text-brand-ink transition-opacity duration-700 ${
        phase === "fadeout" ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <div className="preloader-paper absolute inset-0" />
      <div className="preloader-corner preloader-corner-top" aria-hidden="true">
        C
      </div>
      <div className="preloader-corner preloader-corner-bottom" aria-hidden="true">
        A
      </div>

      <div className="relative grid justify-items-center gap-7 px-6 text-center">
        <div className="preloader-circle-shell relative h-36 w-36 sm:h-44 sm:w-44" aria-hidden="true">
          <div className="preloader-circle-ring absolute inset-0 rounded-full" />
          <div className="preloader-circle-orbit absolute inset-0 rounded-full" />
          <div className="preloader-circle-glow absolute inset-4 rounded-full" />

          <div className="absolute inset-0 flex items-center justify-center">
            <span className="preloader-word flex w-24 items-end justify-center whitespace-nowrap pl-[0.22em] font-sans text-[0.74rem] font-semibold uppercase tracking-[0.22em] text-brand-ink/70 sm:text-[0.8rem]">
              {PRELOADER_WORD.map((letter, index) => (
                <span
                  key={`${letter}-${index}`}
                  className="preloader-letter inline-block"
                  style={{ animationDelay: `${0.42 + index * 0.08}s` }}
                >
                  {letter}
                </span>
              ))}
            </span>
          </div>
        </div>

        <p
          className={`w-72 max-w-[80vw] pl-[0.18em] text-center font-sans text-[0.72rem] font-medium uppercase tracking-[0.18em] text-brand-ink/55 transition-all duration-700 ${
            phase === "mark" ? "translate-y-2 opacity-0" : "translate-y-0 opacity-100"
          }`}
        >
          {lang === "ja" ? "自動入力を、もっと簡単に。" : "Autofill made easy."}
        </p>
      </div>
    </div>
  );
}
