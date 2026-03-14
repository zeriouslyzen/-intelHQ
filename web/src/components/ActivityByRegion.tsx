"use client";

import { REGIONS } from "@/lib/regions";
import type { RegionCode } from "@/lib/regions";
import { filterNewsByRegion } from "@/lib/news";
import { filterConflictByRegion } from "@/lib/conflict";
import type { NewsItem } from "@/lib/news";
import type { ConflictItem } from "@/lib/conflict";

interface ActivityByRegionProps {
  news: NewsItem[];
  conflict: ConflictItem[];
  className?: string;
}

export default function ActivityByRegion({
  news,
  conflict,
  className = "",
}: ActivityByRegionProps) {
  const rows = REGIONS.map((r) => {
    const newsCount = filterNewsByRegion(news, r.code).length;
    const conflictCount = filterConflictByRegion(conflict, r.code).length;
    const total = newsCount + conflictCount;
    return { code: r.code, name: r.name, total, newsCount, conflictCount };
  }).filter((r) => r.total > 0);

  if (rows.length === 0) {
    return (
      <div className={`rounded-lg border border-neutral-200 bg-neutral-50/80 px-3 py-2 text-[11px] text-neutral-500 ${className}`}>
        Activity: no events by region in this snapshot.
      </div>
    );
  }

  return (
    <div className={`rounded-lg border border-neutral-200 bg-white px-3 py-2 shadow-sm ${className}`}>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
        Activity by region
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-neutral-700">
        {rows.map(({ code, name, total, newsCount, conflictCount }) => (
          <span key={code}>
            <span className="font-medium">{name}</span>
            <span className="text-neutral-500"> {total}</span>
            <span className="text-neutral-400">
              {" "}({newsCount} news, {conflictCount} conflict)
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
