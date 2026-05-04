"use client";

import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";

const COPY = {
  en: {
    badge: "How it works",
    title: "From profile to calendar",
    subtitle: "A simple loop: save your info, autofill forms, track next steps.",
    next: "Next",
    previous: "Previous",
    slides: [
      {
        eyebrow: "01",
        title: "Profile",
        short: "Saved once",
        body: "Keep reusable names, addresses, school details, links, and contact fields in one place.",
      },
      {
        eyebrow: "02",
        title: "Autofill",
        short: "One click",
        body: "Open a Japanese application form and let Cygnet prepare the matching fields for review.",
      },
      {
        eyebrow: "03",
        title: "Applications",
        short: "Tracked",
        body: "Save company names, statuses, interviews, and follow-up dates as you apply.",
      },
      {
        eyebrow: "04",
        title: "Calendar",
        short: "Follow-up ready",
        body: "Review detected Gmail schedule candidates, then add approved dates to Calendar.",
      },
    ],
  },
  ja: {
    badge: "使い方",
    title: "プロフィールからカレンダーまで",
    subtitle: "保存、入力、予定管理までをシンプルにつなげます。",
    next: "次へ",
    previous: "前へ",
    slides: [
      {
        eyebrow: "01",
        title: "プロフィール",
        short: "一度保存",
        body: "氏名、住所、学校情報、リンク、連絡先など、応募でよく使う情報をまとめます。",
      },
      {
        eyebrow: "02",
        title: "自動入力",
        short: "ワンクリック",
        body: "日本語の応募フォームを開き、Cygnet が対応できる入力欄を見つけます。",
      },
      {
        eyebrow: "03",
        title: "応募管理",
        short: "進捗を保存",
        body: "応募先、選考状況、面接、次回対応の日程をまとめて管理できます。",
      },
      {
        eyebrow: "04",
        title: "カレンダー",
        short: "予定を確認",
        body: "Gmail から検出した日程候補を確認し、承認したものだけ Calendar に追加できます。",
      },
    ],
  },
} as const;

export default function WorkflowSlideshow({ compact = false }: { compact?: boolean }) {
  const { lang } = useLanguage();
  const t = COPY[lang];
  const [activeIndex, setActiveIndex] = useState(0);
  const active = t.slides[activeIndex];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % t.slides.length);
    }, compact ? 4200 : 5200);

    return () => window.clearInterval(timer);
  }, [compact, t.slides.length]);

  const previewItems = useMemo(() => t.slides, [t.slides]);

  const go = (direction: -1 | 1) => {
    setActiveIndex((current) => (current + direction + t.slides.length) % t.slides.length);
  };

  return (
    <section className={compact ? "" : "relative"}>
      <div className={`glass-panel overflow-hidden rounded-[2.25rem] ${compact ? "p-5 sm:p-6" : "p-6 sm:p-8 lg:p-10"}`}>
        <div className="grid items-stretch gap-5 lg:grid-cols-[minmax(0,0.82fr)_minmax(420px,1.18fr)]">
          <div className="flex min-h-[22rem] flex-col justify-between rounded-[1.8rem] border border-white/70 bg-white/48 p-6 sm:p-8">
            <div>
              <p className="inline-flex rounded-full border border-white/70 bg-white/58 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-ink">
                {t.badge}
              </p>
              <div className="mt-8 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-lg font-bold text-white shadow-[0_16px_34px_rgba(77,127,181,0.2)]">
                {active.eyebrow.replace("0", "")}
              </div>
              <h2 className={`${compact ? "mt-5 text-3xl" : "mt-6 text-4xl lg:text-5xl"} font-bold tracking-[-0.04em] text-brand-ink`}>
                {active.title}
              </h2>
              <p className="mt-2 text-sm font-semibold text-brand">{active.short}</p>
              {!compact ? (
                <p className="mt-5 max-w-md text-base leading-relaxed text-brand-muted">
                  {active.body}
                </p>
              ) : null}
              {compact ? (
                <p className="mt-5 max-w-md text-sm leading-relaxed text-brand-muted">
                  {t.subtitle}
                </p>
              ) : null}
            </div>

            <div className="mt-8 flex items-center gap-3">
              <button
                type="button"
                onClick={() => go(-1)}
                className="glass-button-secondary h-11 px-4 text-sm font-semibold"
                aria-label={t.previous}
              >
                ←
              </button>
              <div className="flex gap-2">
                {t.slides.map((slide, index) => (
                  <button
                    key={slide.eyebrow}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`h-2.5 rounded-full transition-all ${
                      index === activeIndex ? "w-8 bg-brand" : "w-2.5 bg-brand-line"
                    }`}
                    aria-label={`${slide.eyebrow} ${slide.title}`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => go(1)}
                className="glass-button-secondary h-11 px-4 text-sm font-semibold"
                aria-label={t.next}
              >
                →
              </button>
            </div>
          </div>

          <div className="relative min-h-[22rem] overflow-hidden rounded-[1.8rem] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.72),rgba(226,240,255,0.52))] p-4 sm:p-6">
            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.95),rgba(148,202,255,0.24)_45%,transparent_72%)] blur-3xl" />
            <div className="relative grid h-full gap-4 sm:grid-cols-2">
              {previewItems.map((slide, index) => {
                const selected = index === activeIndex;
                return (
                  <button
                    key={slide.eyebrow}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`group rounded-[1.5rem] border p-5 text-left transition-all ${
                      selected
                        ? "border-brand/40 bg-white/88 shadow-[0_22px_50px_rgba(77,127,181,0.16)]"
                        : "border-white/70 bg-white/42 hover:bg-white/64"
                    }`}
                  >
                    <span className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-bold ${selected ? "bg-brand text-white" : "bg-white/72 text-brand"}`}>
                      {index + 1}
                    </span>
                    <div className="mt-5 text-xl font-bold text-brand-ink">{slide.title}</div>
                    <div className="mt-2 text-sm text-brand-muted">{slide.short}</div>
                    {!compact ? (
                      <div className="mt-5 h-20 rounded-2xl border border-brand-line/40 bg-[rgba(238,247,255,0.72)] p-3">
                        <SlideMiniVisual index={index} selected={selected} />
                      </div>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SlideMiniVisual({ index, selected }: { index: number; selected: boolean }) {
  if (index === 0) {
    return <div className="grid grid-cols-2 gap-2">{["Name", "Kana", "School", "Address"].map((item) => <span key={item} className="rounded-lg bg-white/80 px-2 py-1 text-[11px] font-semibold text-brand-muted">{item}</span>)}</div>;
  }

  if (index === 1) {
    return <div className="space-y-2">{[0, 1, 2].map((item) => <div key={item} className={`h-3 rounded-full ${selected ? "bg-brand/40" : "bg-brand-line/70"}`} />)}</div>;
  }

  if (index === 2) {
    return <div className="grid grid-cols-5 gap-1.5">{Array.from({ length: 10 }, (_, item) => <div key={item} className={`aspect-square rounded-md ${item === 7 ? "bg-brand" : "bg-white/78"}`} />)}</div>;
  }

  return <div className="flex items-center gap-2 text-[11px] font-semibold text-brand-muted"><span className="rounded-lg bg-white/80 px-2 py-1">Gmail</span><span>→</span><span className="rounded-lg bg-white/80 px-2 py-1">Calendar</span></div>;
}
