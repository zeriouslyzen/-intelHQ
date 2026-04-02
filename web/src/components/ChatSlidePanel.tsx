"use client";

import { useState, useRef, useEffect } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import AimExperience from "@/components/AimExperience";

export default function ChatSlidePanel() {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) closeButtonRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-sky-300 bg-sky-50 shadow-lg hover:bg-sky-100 focus:outline-none focus:ring-2 focus:ring-sky-400"
        aria-label={t("nav.chat")}
      >
        <span className="text-sm font-semibold text-sky-800">Chat</span>
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/20 sm:bg-transparent"
          aria-modal="true"
          role="dialog"
          aria-label={t("nav.chat")}
        >
          <div
            ref={panelRef}
            className="flex h-full w-full max-w-xl flex-col border-l border-neutral-200 bg-white shadow-xl sm:rounded-l-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-neutral-200 px-4 py-3">
              <span className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
                <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
                {t("nav.chat")}
              </span>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setOpen(false)}
                className="rounded p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700"
                aria-label={t("a11y.close")}
              >
                <span className="text-lg leading-none" aria-hidden>×</span>
              </button>
            </div>
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <AimExperience />
            </div>
          </div>
          <button
            type="button"
            className="absolute inset-0 -z-10"
            aria-label={t("a11y.close")}
            onClick={() => setOpen(false)}
          />
        </div>
      )}
    </>
  );
}
