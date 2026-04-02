"use client";

import dynamic from "next/dynamic";
import { useEffect, useId, useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import EventsLogOsint from "@/components/EventsLogOsint";

const PredictionBriefPanel = dynamic(() => import("@/components/PredictionBriefPanel"), {
  ssr: false,
  loading: () => (
    <div
      className="min-h-[140px] animate-pulse rounded-xl border border-violet-200/30 bg-zinc-900/40 dark:border-violet-500/15"
      aria-hidden
    />
  ),
});
import type { ConflictItem } from "@/lib/conflict";
import type { NewsItem } from "@/lib/news";

export default function TodayIntelSider({
  news,
  conflict,
  maxOsintLines = 32,
  children,
}: {
  news: NewsItem[];
  conflict: ConflictItem[];
  maxOsintLines?: number;
  children: React.ReactNode;
}) {
  const { t } = useLocale();
  const isLg = useMediaQuery("(min-width: 1024px)");
  const [open, setOpen] = useState(false);
  const dialogId = useId();

  useEffect(() => {
    if (isLg) setOpen(false);
  }, [isLg]);

  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
    return undefined;
  }, [open]);

  const panels = (
    <div className="space-y-3">
      <PredictionBriefPanel conflict={conflict} news={news} />
      <EventsLogOsint
        items={news}
        maxLines={maxOsintLines}
        listMaxHeightClass={
          isLg
            ? "max-h-[min(480px,calc(100vh-14rem))]"
            : "max-h-[min(52vh,380px)]"
        }
      />
    </div>
  );

  return (
    <>
      <div className="flex min-h-0 min-w-0 flex-col gap-4 lg:flex-row lg:items-start">
        {isLg ? (
          <aside className="order-2 w-full shrink-0 space-y-3 lg:sticky lg:top-4 lg:order-1 lg:w-[min(100%,20rem)] lg:self-start xl:w-80">
            {panels}
          </aside>
        ) : null}

        <div className="order-1 flex min-w-0 flex-1 flex-col gap-4 lg:order-2">
          {children}
        </div>
      </div>

      {!isLg ? (
        <>
          <button
            type="button"
            className={
              "fixed left-3 z-50 rounded-full border border-cyan-500/35 bg-zinc-950/92 px-3 py-2.5 font-board text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-200 shadow-[0_8px_30px_rgba(0,0,0,0.45)] backdrop-blur-md " +
              "hover:border-cyan-400/50 hover:text-cyan-100 dark:bg-zinc-950/95 " +
              "bottom-[calc(4.85rem+env(safe-area-inset-bottom,0px))]"
            }
            onClick={() => setOpen(true)}
            aria-haspopup="dialog"
            {...(open ? { "aria-controls": dialogId } : {})}
          >
            {t("today.intelMenuOpen")}
          </button>

          {open ? (
            <div
              className="fixed inset-0 z-[100] lg:hidden"
              role="presentation"
            >
              <button
                type="button"
                className="absolute inset-0 bg-black/65 backdrop-blur-[2px]"
                aria-label={t("today.intelMenuClose")}
                onClick={() => setOpen(false)}
              />
              <aside
                id={dialogId}
                role="dialog"
                aria-modal="true"
                aria-labelledby={`${dialogId}-title`}
                className={
                  "absolute left-0 top-0 flex h-full w-[min(22rem,calc(100vw-1.25rem))] max-w-[90vw] flex-col " +
                  "border-r border-zinc-700/90 bg-zinc-950 shadow-[12px_0_48px_rgba(0,0,0,0.55)]"
                }
              >
                <div className="flex items-center justify-between gap-2 border-b border-zinc-800 px-3 py-2.5">
                  <span
                    id={`${dialogId}-title`}
                    className="font-board text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400"
                  >
                    {t("today.intelMenuTitle")}
                  </span>
                  <button
                    type="button"
                    className="rounded-md border border-zinc-700 px-2 py-1 font-mkt-mono text-xs text-zinc-300 hover:bg-zinc-800"
                    onClick={() => setOpen(false)}
                  >
                    {t("today.intelMenuClose")}
                  </button>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3">
                  {panels}
                </div>
              </aside>
            </div>
          ) : null}
        </>
      ) : null}
    </>
  );
}
