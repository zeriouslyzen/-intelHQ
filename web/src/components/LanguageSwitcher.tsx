"use client";

import { useState, useRef, useEffect } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import type { Locale } from "@/contexts/LocaleContext";

const LOCALES: Locale[] = ["en", "tr", "es", "ja"];

function FlagUS({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 30" className={className} aria-hidden>
      <clipPath id="us-stars">
        <path d="M0,0 v30 h60 v-30 z" />
      </clipPath>
      <clipPath id="us-stripes">
        <path d="M0,0 h60 v30 h-60 z" />
      </clipPath>
      <g fill="none" stroke="#B22234" strokeWidth="2">
        {[...Array(13)].map((_, i) => (
          <line key={i} y1={i * 2.31} y2={i * 2.31} x1="0" x2="60" />
        ))}
      </g>
      <path fill="#3C3B6E" d="M0,0 h24 v30 h-24 z" />
      <g fill="#fff">
        {[0, 1, 2, 3, 4].map((row) =>
          [0, 1, 2, 3, 4].map((col) => {
            const x = 2.4 + col * 4.8 + (row % 2) * 2.4;
            const y = 2.3 + row * 2.6;
            return (
              <circle key={`${row}-${col}`} r="1.2" cx={x} cy={y} />
            );
          })
        )}
      </g>
    </svg>
  );
}

function FlagTR({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 40" className={className} aria-hidden>
      <rect width="60" height="40" fill="#E30A17" />
      <path
        fill="#fff"
        d="M24 20c0-4.4 2.9-8.2 7-9.5-1.3-.5-2.7-.8-4.2-.8-5.5 0-10 4.5-10 10s4.5 10 10 10c1.5 0 2.9-.3 4.2-.8-4.1-1.3-7-5.1-7-9.5z"
      />
      <path
        fill="#E30A17"
        d="M28 20l-3.5 2.2 1.3-3.8-3.5-2.3 4.3 0 1.4-3.8 1.4 3.8 4.3 0-3.5 2.3 1.3 3.8z"
      />
    </svg>
  );
}

function FlagES({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 40" className={className} aria-hidden>
      <rect width="60" height="13.33" y="0" fill="#C60B1E" />
      <rect width="60" height="13.33" y="13.33" fill="#FFC400" />
      <rect width="60" height="13.34" y="26.66" fill="#C60B1E" />
    </svg>
  );
}

function FlagJP({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 40" className={className} aria-hidden>
      <rect width="60" height="40" fill="#fff" />
      <circle cx="30" cy="20" r="12" fill="#BC002D" />
    </svg>
  );
}

const FLAG_MAP = {
  en: FlagUS,
  tr: FlagTR,
  es: FlagES,
  ja: FlagJP,
};

export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useLocale();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const handleClick = (e: MouseEvent) => {
      if (
        triggerRef.current &&
        menuRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        !menuRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handleKey);
    window.addEventListener("click", handleClick, true);
    return () => {
      window.removeEventListener("keydown", handleKey);
      window.removeEventListener("click", handleClick, true);
    };
  }, [open]);

  const CurrentFlag = FLAG_MAP[locale];

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-8 w-8 items-center justify-center rounded border border-neutral-200 bg-white shadow-sm hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-amber-400 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
        aria-label={t("a11y.changeLanguage")}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="block h-4 w-6 overflow-hidden rounded-sm">
          <CurrentFlag className="h-full w-full object-cover" />
        </span>
      </button>
      {open && (
        <div
          ref={menuRef}
          role="menu"
          className="absolute right-0 top-full z-50 mt-1 min-w-[140px] rounded-lg border border-neutral-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-950"
          aria-orientation="vertical"
        >
          {LOCALES.map((loc) => {
            const Flag = FLAG_MAP[loc];
            return (
              <button
                key={loc}
                type="button"
                role="menuitem"
                onClick={() => {
                  setLocale(loc);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-neutral-800 hover:bg-amber-50 focus:bg-amber-50 focus:outline-none dark:text-zinc-200 dark:hover:bg-zinc-800 dark:focus:bg-zinc-800"
              >
                <span className="block h-4 w-5 shrink-0 overflow-hidden rounded-sm">
                  <Flag className="h-full w-full object-cover" />
                </span>
                <span>{t(`lang.${loc}`)}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
