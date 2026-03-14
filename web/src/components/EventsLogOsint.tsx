"use client";

import type { NewsItem } from "@/lib/news";

interface EventsLogOsintProps {
  items: NewsItem[];
  /** Max lines to show (newest first). */
  maxLines?: number;
  className?: string;
}

function formatLogTime(iso: string): string {
  if (!iso) return "??:??";
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
  } catch {
    return "??:??";
  }
}

export default function EventsLogOsint({
  items,
  maxLines = 24,
  className = "",
}: EventsLogOsintProps) {
  const sorted = [...(Array.isArray(items) ? items : [])]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, maxLines);

  return (
    <div
      className={
        "overflow-hidden rounded-xl border border-neutral-200 bg-neutral-900 text-neutral-300 " +
        className
      }
    >
      <div className="border-b border-neutral-700 px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
        Events log · OSINT
      </div>
      <div className="max-h-[280px] overflow-y-auto p-2 font-mono text-[11px]">
        {sorted.map((item, i) => (
          <a
            key={`${item.source}-${i}-${item.title.slice(0, 30)}`}
            href={item.link}
            target="_blank"
            rel="noreferrer"
            className="block border-b border-neutral-800 py-1.5 last:border-0 hover:bg-neutral-800/50"
          >
            <span className="text-neutral-500">[{formatLogTime(item.publishedAt)}]</span>{" "}
            <span
              className={
                item.perspective === "left"
                  ? "text-sky-400"
                  : item.perspective === "right"
                    ? "text-amber-400"
                    : "text-neutral-400"
              }
            >
              [{item.source}]
            </span>{" "}
            <span className="text-neutral-500">[{item.regionCodes.join(",")}]</span>{" "}
            <span className="text-neutral-200">{item.title}</span>
          </a>
        ))}
        {sorted.length === 0 && (
          <div className="py-2 text-neutral-500">No events in buffer.</div>
        )}
      </div>
    </div>
  );
}
