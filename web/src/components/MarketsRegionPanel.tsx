"use client";

import { useState } from "react";
import RegionDashboard from "@/components/RegionDashboard";
import { REGIONS, type RegionCode } from "@/lib/regions";
import type { CommodityQuote, Quote } from "@/lib/markets";

interface MarketsRegionPanelProps {
  fx: Quote[];
  commodities: CommodityQuote[];
}

export default function MarketsRegionPanel({
  fx,
  commodities,
}: MarketsRegionPanelProps) {
  const [selected, setSelected] = useState<RegionCode | null>("CHN");

  return (
    <div className="flex min-h-0 flex-col gap-3">
      <div className="rounded-xl border border-neutral-200 bg-white p-4 text-xs text-neutral-700 dark:border-zinc-800 dark:bg-zinc-950/60 dark:text-zinc-300">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500 dark:text-zinc-500">
          Region
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {REGIONS.map((r) => (
            <button
              key={r.code}
              type="button"
              onClick={() => setSelected(r.code)}
              className={
                "rounded border px-2 py-1 text-[11px] font-medium transition-colors " +
                (selected === r.code
                  ? "border-amber-400 bg-amber-50 text-amber-800 dark:border-amber-500/50 dark:bg-amber-950/40 dark:text-amber-200"
                  : "border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-400 dark:hover:bg-zinc-800")
              }
            >
              {r.code}
            </button>
          ))}
        </div>
      </div>
      <RegionDashboard
        regionCode={selected}
        fx={fx}
        commodities={commodities}
      />
      <div className="flex-1 rounded-xl border border-neutral-200 bg-white p-4 text-xs text-neutral-500 dark:border-zinc-800 dark:bg-zinc-950/60 dark:text-zinc-500">
        Instrument detail routes will anchor charts, news, and map context for
        a single symbol.
      </div>
    </div>
  );
}
