"use client";

import { useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import WorldMap, { type MapLayersState } from "@/components/WorldMap";
import RegionDashboard from "@/components/RegionDashboard";
import EventsLogOsint from "@/components/EventsLogOsint";
import ActivityByRegion from "@/components/ActivityByRegion";
import type { RegionCode } from "@/lib/regions";
import type { CommodityQuote, Quote } from "@/lib/markets";
import type { NewsItem } from "@/lib/news";
import type { ConflictItem } from "@/lib/conflict";
import type { FlightState } from "@/lib/flights";
import type { VesselPosition } from "@/lib/vessels";

interface MapViewClientProps {
  indices: Quote[];
  fx: Quote[];
  commodities: CommodityQuote[];
  news: NewsItem[];
  conflict?: ConflictItem[];
  flightStates?: FlightState[];
  vesselPositions?: VesselPosition[];
}

const LAYER_KEYS: (keyof MapLayersState)[] = ["news", "logs", "cargo", "air"];

export default function MapViewClient({
  indices,
  fx,
  commodities,
  news,
  conflict = [],
  flightStates = [],
  vesselPositions = [],
}: MapViewClientProps) {
  const { t } = useLocale();
  const [selectedRegion, setSelectedRegion] = useState<RegionCode | null>(null);
  const [layers, setLayers] = useState<MapLayersState>({
    news: true,
    logs: true,
    cargo: true,
    air: true,
  });

  const toggleLayer = (key: keyof MapLayersState) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="grid flex-1 gap-3 md:grid-cols-[minmax(0,2.1fr)_minmax(0,1.2fr)]">
      <section className="flex min-h-0 flex-col rounded-xl border border-neutral-200 bg-white p-4">
        <ActivityByRegion news={news} conflict={conflict} className="mb-3" />
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-500">
          <span>{t("map.radarOverlays")}</span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
              {t("map.layers")}
            </span>
            {LAYER_KEYS.map((key) => (
              <label
                key={key}
                className="flex cursor-pointer items-center gap-1.5 rounded border border-neutral-200 bg-neutral-50 px-2 py-1 hover:bg-neutral-100"
              >
                <input
                  type="checkbox"
                  checked={layers[key]}
                  onChange={() => toggleLayer(key)}
                  className="h-3 w-3 rounded border-neutral-300"
                />
                <span className="text-[11px] font-medium text-neutral-700">
                  {t(`map.${key}`)}
                </span>
              </label>
            ))}
          </div>
        </div>
        <div className="relative mt-3 flex-1 min-h-[400px]">
          <WorldMap
            onRegionSelect={setSelectedRegion}
            news={news}
            conflict={conflict}
            flightStates={flightStates}
            vesselPositions={vesselPositions}
            layers={layers}
          />
        </div>
      </section>
      <section className="flex min-h-0 flex-col gap-3">
        <RegionDashboard
          regionCode={selectedRegion}
          fx={fx}
          commodities={commodities}
          news={news}
        />
        <div className="rounded-xl border border-neutral-200 bg-white p-4 text-xs text-neutral-500">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
            {t("map.globalSnapshot")}
          </div>
          <div className="mt-2 space-y-1.5">
            {indices.slice(0, 3).map((q) => (
              <div
                key={q.symbol}
                className="flex justify-between rounded border border-neutral-100 bg-neutral-50 px-2 py-1.5"
              >
                <span className="font-medium text-neutral-800">{q.symbol}</span>
                <span className="font-mono text-[11px]">
                  {q.price.toFixed(2)}{" "}
                  <span
                    className={
                      q.changePercent >= 0 ? "text-emerald-600" : "text-red-600"
                    }
                  >
                    {q.changePercent >= 0 ? "+" : ""}
                    {q.changePercent.toFixed(2)}%
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
        <EventsLogOsint items={news} maxLines={20} className="mt-3" />
      </section>
    </div>
  );
}
