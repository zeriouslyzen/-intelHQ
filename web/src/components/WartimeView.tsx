"use client";

import { useState } from "react";
import { filterConflictByRegion } from "@/lib/conflict";
import { REGIONS, type RegionCode } from "@/lib/regions";
import type { ConflictItem } from "@/lib/conflict";

interface WartimeViewProps {
  conflict: ConflictItem[];
}

export default function WartimeView({ conflict = [] }: WartimeViewProps) {
  const [regionFilter, setRegionFilter] = useState<RegionCode | "ALL">("ALL");
  const safeConflict = Array.isArray(conflict) ? conflict : [];
  const filtered =
    regionFilter === "ALL"
      ? safeConflict
      : filterConflictByRegion(safeConflict, regionFilter);

  return (
    <div className="grid flex-1 gap-3 md:grid-cols-[minmax(0,1.7fr)_minmax(0,1.3fr)]">
      <section className="flex min-h-0 flex-col rounded-xl border border-neutral-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
          <span className="text-[11px] font-medium text-neutral-700">Region:</span>
          <button
            type="button"
            onClick={() => setRegionFilter("ALL")}
            className={
              "rounded border px-2 py-1 text-[11px] font-medium " +
              (regionFilter === "ALL"
                ? "border-amber-400 bg-amber-50 text-amber-800"
                : "border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100")
            }
          >
            All
          </button>
          {REGIONS.map((r) => (
            <button
              key={r.code}
              type="button"
              onClick={() => setRegionFilter(r.code)}
              className={
                "rounded border px-2 py-1 text-[11px] font-medium " +
                (regionFilter === r.code
                  ? "border-amber-400 bg-amber-50 text-amber-800"
                  : "border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100")
              }
            >
              {r.code}
            </button>
          ))}
        </div>
        <ul className="mt-3 flex-1 space-y-2 overflow-auto text-xs text-neutral-800">
          {filtered.map((item) => (
            <li
              key={item.id}
              className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2"
            >
              <a
                href={item.link}
                target="_blank"
                rel="noreferrer"
                className="block"
              >
                <div className="font-medium text-neutral-900">
                  {item.title}
                </div>
                <div className="mt-1 flex items-center gap-2 text-[11px]">
                  <span className="font-medium text-neutral-600">
                    {item.source}
                  </span>
                  <span
                    className={
                      item.attribution === "official"
                        ? "text-amber-600"
                        : item.attribution === "wire"
                          ? "text-emerald-600"
                          : "text-neutral-500"
                    }
                  >
                    {item.attribution}
                  </span>
                  <span className="text-neutral-400">
                    {item.regionCodes.join(", ")}
                  </span>
                </div>
              </a>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-[11px] text-neutral-500">
              No wartime updates for this region. Wire and official sources only.
            </li>
          )}
        </ul>
      </section>
      <section className="flex min-h-0 flex-col rounded-xl border border-neutral-200 bg-white p-4 text-xs text-neutral-700">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
          Source key
        </div>
        <p className="mt-1">
          Official (NATO, DoD, government), wire (Reuters, BBC), outlet (Defense News, Al Jazeera). Primary sources to reduce fakes.
        </p>
        <div className="mt-2 space-y-1 text-[11px]">
          <p><span className="text-amber-600 font-medium">Official</span> — NATO, DoD, government</p>
          <p><span className="text-emerald-600 font-medium">Wire</span> — Reuters, BBC</p>
          <p><span className="text-neutral-500">Outlet</span> — Defense News, Al Jazeera</p>
        </div>
      </section>
    </div>
  );
}
