"use client";

import { useState, useEffect } from "react";
import HeadlineDecodeCard from "@/components/HeadlineDecodeCard";

const SAMPLE_HEADLINES = [
  {
    title:
      "Iran warns of response after Kharg Island strike; oil markets jittery",
    source: "Reuters",
    link: "#",
  },
  {
    title: "China sanctions US firms over Taiwan arms sale",
    source: "BBC",
    link: "#",
  },
  {
    title: "NATO holds emergency meeting on escalation in Eastern Europe",
    source: "Al Jazeera",
    link: "#",
  },
  {
    title: "Oil prices rise on supply fears after limited strike in Middle East",
    source: "Reuters",
    link: "#",
  },
  {
    title: "Off the record briefing suggests new sanctions next week",
    source: "Wire",
    link: "#",
  },
  {
    title: "Experts say 33 nations to attend summit; fact checked by official sources",
    source: "Wire",
    link: "#",
  },
];

interface ConflictItem {
  id: string;
  title: string;
  link: string;
  source: string;
  publishedAt?: string;
}

export default function DecodeTestPanel() {
  const [mode, setMode] = useState<"sample" | "live">("sample");
  const [liveItems, setLiveItems] = useState<ConflictItem[]>([]);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);

  useEffect(() => {
    if (mode !== "live") return;
    setLiveLoading(true);
    setLiveError(null);
    fetch("/api/live/conflict", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Fetch failed"))))
      .then((data: Array<{ id: string; title: string; link: string; source: string; publishedAt?: string }>) => {
        setLiveItems(
          data.slice(0, 10).map((c) => ({
            id: c.id,
            title: c.title,
            link: c.link,
            source: c.source,
            publishedAt: c.publishedAt,
          }))
        );
      })
      .catch((e) => setLiveError(e?.message ?? "Failed to load"))
      .finally(() => setLiveLoading(false));
  }, [mode]);

  const items = mode === "sample" ? SAMPLE_HEADLINES : liveItems;
  const showItems = mode === "sample" || liveItems.length > 0 || liveError;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-medium text-neutral-500">
          Headlines:
        </span>
        <button
          type="button"
          onClick={() => setMode("sample")}
          className={`rounded border px-2 py-1 text-[11px] font-medium ${
            mode === "sample"
              ? "border-amber-300 bg-amber-50 text-amber-800"
              : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
          }`}
        >
          Sample
        </button>
        <button
          type="button"
          onClick={() => setMode("live")}
          disabled={liveLoading}
          className={`rounded border px-2 py-1 text-[11px] font-medium ${
            mode === "live"
              ? "border-sky-300 bg-sky-50 text-sky-800"
              : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 disabled:opacity-50"
          }`}
        >
          {liveLoading ? "Loading…" : "Live"}
        </button>
      </div>
      {liveError && (
        <p className="text-xs text-red-600">
          Live fetch failed: {liveError}. Using sample or try again.
        </p>
      )}
      {showItems && (
        <div className="space-y-3">
          {items.map((h, i) => (
            <HeadlineDecodeCard
              key={mode === "live" ? (h as ConflictItem).id : `sample-${i}`}
              title={h.title}
              source={h.source}
              link={h.link}
              publishedAt={"publishedAt" in h ? (h as ConflictItem).publishedAt : undefined}
            />
          ))}
        </div>
      )}
      {mode === "live" && !liveLoading && liveItems.length === 0 && !liveError && (
        <p className="text-xs text-neutral-500">No live headlines returned.</p>
      )}
    </div>
  );
}
