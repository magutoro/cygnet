"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";

export default function LandingDemo({
  lang,
  active,
}: {
  lang: "en" | "ja";
  active: boolean;
}) {
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    if (!active) {
      setCycle(0);
      return;
    }

    const timer = window.setTimeout(() => {
      setCycle((current) => current + 1);
    }, 7500);

    return () => window.clearTimeout(timer);
  }, [active, cycle]);

  return (
    <div
      key={`${active ? "active" : "idle"}-${cycle}`}
      className="space-y-4 rounded-[1.85rem] border border-white/72 bg-white/70 p-6 shadow-[0_28px_74px_rgba(15,124,171,0.16)] ring-1 ring-white/24 backdrop-blur-2xl"
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-muted">
          エントリーシート
        </span>
        <span
          className={`inline-flex items-center gap-1 rounded-full bg-[rgba(229,250,240,0.84)] px-2.5 py-1 text-xs font-medium text-[#1e6957] ${
            active ? "form-badge-appear" : "pointer-events-none scale-75 opacity-0"
          }`}
        >
          <CheckIcon className="h-3 w-3" />
          {lang === "ja" ? "入力完了" : "Ready"}
        </span>
      </div>

      <DemoField label="氏名" fillClass="form-field-fill-1" textClass="form-type-1" active={active}>
        山田 太郎
      </DemoField>

      <DemoField label="フリガナ" fillClass="form-field-fill-2" textClass="form-type-2" active={active}>
        ヤマダ タロウ
      </DemoField>

      <DemoSelect
        label="大学名"
        icon={<GraduationCapIcon className="h-4 w-4 shrink-0 text-brand-muted" />}
        value="早稲田大学"
        options={["早稲田大学", "東京大学", "慶應義塾大学"]}
        active={active}
        fillClass="form-field-fill-3"
        textClass="form-type-3"
        chevronClass="form-chevron"
        dropdownClass="form-dropdown"
        selectPulseClass="form-click-select"
        dropdownSurfaceClass="border-[#dcecfb] bg-white shadow-[0_22px_44px_rgba(77,127,181,0.16)]"
      />

      <DemoSelect
        label="都道府県"
        icon={<MapPinIcon className="h-4 w-4 shrink-0 text-brand-muted" />}
        value="東京都"
        options={["東京都", "神奈川県", "大阪府"]}
        active={active}
        fillClass="form-field-fill-4"
        textClass="form-type-4"
        chevronClass="form-chevron-2"
        dropdownClass="form-dropdown-2"
        selectPulseClass="form-click-select-2"
        dropdownSurfaceClass="border-[#dcecfb] bg-white shadow-[0_22px_44px_rgba(77,127,181,0.16)]"
      />

      <div
        className={`mt-2 inline-flex items-center gap-2 rounded-full bg-brand px-3 py-2 text-xs font-medium text-white shadow-[0_18px_60px_rgba(15,124,171,0.28)] ${
          active ? "form-autofill-pip" : "pointer-events-none translate-y-2 opacity-0"
        }`}
      >
        <SparklesIcon className="h-3.5 w-3.5" />
        {lang === "ja" ? "フォームへ反映" : "Autofilled"}
      </div>
    </div>
  );
}

function DemoField({
  label,
  fillClass,
  textClass,
  active,
  children,
}: {
  label: string;
  fillClass: string;
  textClass: string;
  active: boolean;
  children: string;
}) {
  return (
    <div className="space-y-1">
      <div className="text-[11px] font-medium tracking-wide text-brand-muted">{label}</div>
      <div
        className={`flex h-11 items-center overflow-hidden rounded-xl border border-white/70 bg-[rgba(238,247,255,0.92)] px-3 ${
          active ? fillClass : ""
        }`}
      >
        <span
          className={`inline-block overflow-hidden whitespace-nowrap text-sm font-medium text-brand-ink ${
            active ? textClass : "max-w-0 opacity-0"
          }`}
        >
          {children}
        </span>
      </div>
    </div>
  );
}

function DemoSelect({
  label,
  icon,
  value,
  options,
  active,
  fillClass,
  textClass,
  chevronClass,
  dropdownClass,
  selectPulseClass,
  dropdownSurfaceClass,
}: {
  label: string;
  icon: ReactNode;
  value: string;
  options: string[];
  active: boolean;
  fillClass: string;
  textClass: string;
  chevronClass: string;
  dropdownClass: string;
  selectPulseClass: string;
  dropdownSurfaceClass?: string;
}) {
  return (
    <div className="relative space-y-1">
      <div className="text-[11px] font-medium tracking-wide text-brand-muted">{label}</div>
      <div
        className={`flex h-11 items-center justify-between rounded-xl border border-white/70 bg-[rgba(238,247,255,0.92)] px-3 ${
          active ? fillClass : ""
        }`}
      >
        <div className="flex min-w-0 items-center gap-2 overflow-hidden">
          {icon}
          <span
            className={`inline-block overflow-hidden whitespace-nowrap text-sm font-medium text-brand-ink ${
              active ? textClass : "max-w-0 opacity-0"
            }`}
          >
            {value}
          </span>
        </div>
        <ChevronDownIcon className={`h-4 w-4 text-brand-muted ${active ? chevronClass : ""}`} />
      </div>

      <div
        className={`absolute left-0 right-0 top-full z-10 mt-1 overflow-hidden rounded-xl border border-white/72 bg-white/88 shadow-[0_18px_36px_rgba(77,127,181,0.1)] ${
          dropdownSurfaceClass ?? ""
        } ${
          active ? dropdownClass : "pointer-events-none max-h-0 -translate-y-1 opacity-0"
        }`}
      >
        <div className="space-y-1 p-1.5">
          <div
            className={`flex items-center gap-2 rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white ${
              active ? selectPulseClass : "scale-[0.97] opacity-60"
            }`}
          >
            <CheckIcon className="h-3.5 w-3.5 shrink-0" />
            {value}
          </div>
          {options
            .filter((item) => item !== value)
            .map((option) => (
              <div key={option} className="rounded-lg px-3 py-2 text-sm text-brand-muted">
                {option}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={2.4}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
    </svg>
  );
}

function GraduationCapIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 8.25 12 4.5l8.25 3.75L12 12 3.75 8.25Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 9.955V14.25c0 .61 1.79 2.25 4.5 2.25s4.5-1.64 4.5-2.25V9.955" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 9.75v4.5" />
    </svg>
  );
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3 13.9 8.1 19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z" />
    </svg>
  );
}
