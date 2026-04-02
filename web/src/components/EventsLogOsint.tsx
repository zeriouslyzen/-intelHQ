"use client";

import type { NewsItem } from "@/lib/news";

interface EventsLogOsintProps {
  items: NewsItem[];
  /** Max lines to show (newest first). */
  maxLines?: number;
  className?: string;
  /** Tailwind max-height class for the scrollable list (e.g. sidebar). */
  listMaxHeightClass?: string;
}

function formatLogTime(iso: string): string {
  if (!iso) return "??:??";
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  } catch {
    return "??:??";
  }
}

export default function EventsLogOsint({
  items,
  maxLines = 24,
  className = "",
  listMaxHeightClass = "max-h-[280px]",
}: EventsLogOsintProps) {
  const sorted = [...(Array.isArray(items) ? items : [])]
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
    .slice(0, maxLines);

  return (
    <div
      className={
        "overflow-hidden rounded-xl border border-neutral-200 bg-neutral-900 text-neutral-300 dark:border-zinc-700/90 dark:bg-zinc-950 " +
        className
      }
    >
      <div className="border-b border-neutral-700 px-2 py-1.5 font-board text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500 dark:border-zinc-800 dark:text-zinc-500">
        Events log · OSINT
      </div>
      <div
        className={`overflow-y-auto p-2 font-mkt-mono text-[11px] ${listMaxHeightClass}`}
      >
        {sorted.map((item, i) => (
          <a
            key={`${item.source}-${i}-${item.title.slice(0, 30)}`}
            href={item.link}
            target="_blank"
            rel="noreferrer"
            className="block border-b border-neutral-800 py-1.5 last:border-0 hover:bg-neutral-800/50 dark:border-zinc-800/80 dark:hover:bg-zinc-900/80"
          >
            <span className="text-neutral-500 dark:text-zinc-600">
              [{formatLogTime(item.publishedAt)}]
            </span>{" "}
            <span
              className={
                item.perspective === "left"
                  ? "text-sky-400 dark:text-sky-400"
                  : item.perspective === "right"
                    ? "text-amber-400 dark:text-amber-400"
                    : "text-neutral-400 dark:text-zinc-500"
              }
            >
              [{item.source}]
            </span>{" "}
            <span className="text-neutral-500 dark:text-zinc-600">
              [{item.regionCodes?.length ? item.regionCodes.join(",") : "—"}]
            </span>{" "}
            <span className="text-neutral-200 dark:text-zinc-200">
              {item.title}
            </span>
          </a>
        ))}
        {sorted.length === 0 && (
          <div className="py-2 text-neutral-500 dark:text-zinc-600">
            No events in buffer.
          </div>
        )}
      </div>
    </div>
  );
}
