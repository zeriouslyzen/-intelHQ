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
      className={`min-w-0 overflow-hidden rounded-lg border border-amber-200 bg-amber-50/80 ${className}`}
      aria-label={t("common.breaking")}
    >
      <div className="flex items-center gap-2 border-b border-amber-200/80 px-3 py-1.5">
        <span className="inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
        <span className="truncate text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-800">
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
              className="flex shrink-0 items-center gap-2 whitespace-nowrap text-sm text-neutral-800 hover:text-amber-800 hover:underline"
            >
              <span className="font-medium">{item.title}</span>
              <span className="text-[11px] text-neutral-500">{item.source}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
