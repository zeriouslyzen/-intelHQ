"use client";

import { useLocale } from "@/contexts/LocaleContext";

export interface HeadlineItem {
  id: string;
  title: string;
  link: string;
  source: string;
}

interface BreakingHeadlinesStripProps {
  items: HeadlineItem[];
  className?: string;
}

export default function BreakingHeadlinesStrip({
  items,
  className = "",
}: BreakingHeadlinesStripProps) {
  const { t } = useLocale();
  if (items.length === 0) return null;
  const duplicated = [...items, ...items];

  return (
    <div
      className={`min-w-0 overflow-hidden rounded-lg border border-amber-200/90 bg-amber-50/80 dark:border-amber-500/25 dark:bg-gradient-to-r dark:from-amber-950/40 dark:via-zinc-950/60 dark:to-amber-950/30 ${className}`}
      aria-label={t("common.breaking")}
    >
      <div className="flex items-center gap-2 border-b border-amber-200/80 px-3 py-1.5 dark:border-amber-500/20">
        <span className="inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
        <span className="font-board truncate text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-900 dark:text-amber-200/90">
          {t("common.breaking")}
        </span>
      </div>
      <div className="relative flex w-full min-w-0 overflow-hidden py-2">
        <div className="flex w-max gap-8 px-3 animate-scroll-news">
          {duplicated.map((item, idx) => (
            <a
              key={`strip-${idx}-${item.id}`}
              href={item.link}
              target="_blank"
              rel="noreferrer"
              className="font-mkt-mono flex shrink-0 items-center gap-2 whitespace-nowrap text-sm text-neutral-800 hover:text-amber-800 hover:underline dark:text-zinc-200 dark:hover:text-amber-300"
            >
              <span className="font-medium">{item.title}</span>
              <span className="text-[11px] text-neutral-500 dark:text-zinc-500">{item.source}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
