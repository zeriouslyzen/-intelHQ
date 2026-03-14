"use client";

import { useState } from "react";
import { filterConflictByRegion } from "@/lib/conflict";
import { filterNewsByRegion } from "@/lib/news";
import { REGIONS, type RegionCode } from "@/lib/regions";
import type { ConflictItem } from "@/lib/conflict";
import type { NewsItem } from "@/lib/news";

interface EventsViewProps {
  news: NewsItem[];
  conflict?: ConflictItem[];
}

export default function EventsView({ news, conflict = [] }: EventsViewProps) {
  const [regionFilter, setRegionFilter] = useState<RegionCode | "ALL">("ALL");
  const [activePanel, setActivePanel] = useState<"news" | "conflict">("news");
  const filtered =
    regionFilter === "ALL"
      ? news
      : filterNewsByRegion(news, regionFilter);
  const filteredConflict =
    regionFilter === "ALL"
      ? conflict
      : filterConflictByRegion(conflict, regionFilter);

  return (
    <div className="grid flex-1 gap-3 md:grid-cols-[minmax(0,1.7fr)_minmax(0,1.3fr)]">
      <section className="flex min-h-0 flex-col rounded-xl border border-neutral-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-500">
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setActivePanel("news")}
              className={
                "rounded border px-2 py-1 text-[11px] font-medium " +
                (activePanel === "news"
                  ? "border-amber-400 bg-amber-50 text-amber-800"
                  : "border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100")
              }
            >
              Headlines
            </button>
            <button
              type="button"
              onClick={() => setActivePanel("conflict")}
              className={
                "rounded border px-2 py-1 text-[11px] font-medium " +
                (activePanel === "conflict"
                  ? "border-amber-400 bg-amber-50 text-amber-800"
                  : "border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100")
              }
            >
              Conflict & military
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setRegionFilter("ALL")}
              className={
                "rounded border px-2 py-1 text-[11px] font-medium " +
                (regionFilter === "ALL"
                  ? "border-sky-300 bg-sky-50 text-sky-800"
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
                    ? "border-sky-300 bg-sky-50 text-sky-800"
                    : "border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100")
                }
              >
                {r.code}
              </button>
            ))}
          </div>
        </div>
        <ul className="mt-3 flex-1 space-y-2 overflow-auto text-xs text-neutral-800">
          {activePanel === "conflict" ? (
            <>
              {filteredConflict.map((item) => (
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
              {filteredConflict.length === 0 && (
                <li className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-[11px] text-neutral-500">
                  No conflict updates for this region. Wire sources only.
                </li>
              )}
            </>
          ) : (
          <>
          {filtered.map((item, i) => (
            <li
              key={`${item.source}-${i}-${item.title.slice(0, 20)}`}
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
                  <span
                    className={
                      item.perspective === "left"
                        ? "font-medium text-sky-600"
                        : item.perspective === "right"
                          ? "font-medium text-amber-600"
                          : "text-neutral-500"
                    }
                  >
                    {item.source}
                  </span>
                  <span className="text-neutral-400">
                    {item.regionCodes.join(", ")}
                  </span>
                  <span className="text-neutral-400">{item.publishedAt}</span>
                </div>
              </a>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-[11px] text-neutral-500">
              No events for this region.
            </li>
          )}
          </>
          )}
        </ul>
      </section>
      <section className="flex min-h-0 flex-col rounded-xl border border-neutral-200 bg-white p-4 text-xs text-neutral-700">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
          Source key
        </div>
        <p className="mt-1">
          {activePanel === "conflict"
            ? "Conflict & military: official (e.g. NATO, DoD), wire (Reuters, BBC), outlet (Defense News, Al Jazeera). Primary sources only to reduce fakes."
            : "Headlines by perspective: center (Reuters, BBC), left (e.g. Al Jazeera), right (e.g. right-leaning). Region tags link to map."}
        </p>
        <div className="mt-2 space-y-1 text-[11px]">
          {activePanel === "conflict" ? (
            <>
              <p><span className="text-amber-600 font-medium">Official</span> — NATO, DoD, government</p>
              <p><span className="text-emerald-600 font-medium">Wire</span> — Reuters, BBC, AP</p>
              <p><span className="text-neutral-500">Outlet</span> — Defense News, Al Jazeera</p>
            </>
          ) : (
            <>
              <p><span className="text-sky-600 font-medium">Left / alternative</span> — one perspective</p>
              <p><span className="text-amber-600 font-medium">Right</span> — another perspective</p>
              <p><span className="text-neutral-500">Center</span> — wire / mainstream</p>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
