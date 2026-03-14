"use client";

import dynamic from "next/dynamic";
import type { CommodityQuote, Quote } from "@/lib/markets";
import type { NewsItem } from "@/lib/news";
import type { ConflictItem } from "@/lib/conflict";
import type { FlightState } from "@/lib/flights";
import type { VesselPosition } from "@/lib/vessels";

const MapViewClient = dynamic(
  () => import("@/components/MapViewClient"),
  { ssr: false }
);

interface MapViewClientWrapperProps {
  indices: Quote[];
  fx: Quote[];
  commodities: CommodityQuote[];
  news: NewsItem[];
  conflict?: ConflictItem[];
  flightStates?: FlightState[];
  vesselPositions?: VesselPosition[];
}

export default function MapViewClientWrapper({
  indices,
  fx,
  commodities,
  news,
  conflict = [],
  flightStates = [],
  vesselPositions = [],
}: MapViewClientWrapperProps) {
  return (
    <MapViewClient
      indices={indices}
      fx={fx}
      commodities={commodities}
      news={news}
      conflict={conflict}
      flightStates={flightStates}
      vesselPositions={vesselPositions}
    />
  );
}
