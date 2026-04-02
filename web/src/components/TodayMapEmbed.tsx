"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useLocale } from "@/contexts/LocaleContext";
import type { NewsItem } from "@/lib/news";
import type { ConflictItem } from "@/lib/conflict";
import type { FlightState } from "@/lib/flights";
import type { VesselPosition } from "@/lib/vessels";

const WorldMap = dynamic(() => import("@/components/WorldMap"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[280px] items-center justify-center rounded-lg border border-neutral-200 bg-neutral-100 text-sm text-neutral-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-500">
      Loading map…
    </div>
  ),
});

interface TodayMapEmbedProps {
  news: NewsItem[];
  conflict: ConflictItem[];
  flightStates?: FlightState[];
  vesselPositions?: VesselPosition[];
  className?: string;
}

export default function TodayMapEmbed({
  news,
  conflict,
  flightStates = [],
  vesselPositions = [],
  className = "",
}: TodayMapEmbedProps) {
  const { t } = useLocale();

  return (
    <div className={`flex min-w-0 flex-col gap-2 ${className}`}>
      <div className="relative min-h-[280px] w-full overflow-hidden rounded-lg border border-sky-200/80 dark:border-cyan-500/20">
        <WorldMap
          news={news}
          conflict={conflict}
          flightStates={flightStates}
          vesselPositions={vesselPositions}
          layers={{ news: true, logs: true, cargo: true, air: true }}
        />
      </div>
      <div className="flex justify-end">
        <Link
          href="/map"
          className="font-mkt-mono text-[11px] font-medium text-cyan-700 hover:underline dark:text-cyan-400"
        >
          {t("today.openFullMap")}
        </Link>
      </div>
    </div>
  );
}
