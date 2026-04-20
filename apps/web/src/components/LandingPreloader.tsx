"use client";

import { useEffect, useState } from "react";

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
      className={`fixed inset-0 z-[120] flex items-center justify-center bg-[#07131a] transition-opacity duration-700 ${
        phase === "fadeout" ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.9) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.9) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative flex flex-col items-center gap-5 px-6 text-center">
        <div className="relative overflow-hidden rounded-2xl border border-white/25 bg-white/5 px-8 py-5 shadow-[0_24px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl">
          <div className="flex items-center justify-center">
            <span className="preloader-text inline-block overflow-hidden whitespace-nowrap font-mono text-2xl font-light tracking-[0.24em] text-white">
              CYGNET
            </span>
            <span className="preloader-cursor ml-1 inline-block h-6 w-[2px] bg-white" />
          </div>
          <div className="preloader-scan absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        <p
          className={`text-sm tracking-[0.16em] text-white/60 transition-all duration-700 ${
            phase === "typing" ? "translate-y-3 opacity-0" : "translate-y-0 opacity-100"
          }`}
        >
          {lang === "ja" ? "就活入力をもっとラクに。" : "autofill made easy."}
        </p>
      </div>
    </div>
  );
}
