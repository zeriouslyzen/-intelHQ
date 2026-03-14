"use client";

import { useState } from "react";
import { filterAlertsByRegion } from "@/lib/alerts";
import { filterRadioByRegion } from "@/lib/radio";
import { REGIONS, type RegionCode } from "@/lib/regions";
import type { AlertItem } from "@/lib/alerts";
import type { RadioStation } from "@/lib/radio";

interface AlertsRadioViewProps {
  alerts: AlertItem[];
  radio: RadioStation[];
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    const now = new Date();
    const diff = (now.getTime() - d.getTime()) / 60000;
    if (diff < 1) return "just now";
    if (diff < 60) return `${Math.floor(diff)}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso.slice(0, 16);
  }
}

function severityClass(s: string): string {
  switch (s) {
    case "red": return "bg-red-100 text-red-800 border-red-200";
    case "orange": return "bg-amber-100 text-amber-800 border-amber-200";
    case "green": return "bg-emerald-100 text-emerald-800 border-emerald-200";
    default: return "bg-neutral-100 text-neutral-600 border-neutral-200";
  }
}

export default function AlertsRadioView({ alerts = [], radio = [] }: AlertsRadioViewProps) {
  const [regionFilter, setRegionFilter] = useState<RegionCode | "ALL">("ALL");
  const [activeTab, setActiveTab] = useState<"alerts" | "radio" | "log">("alerts");
  const safeAlerts = Array.isArray(alerts) ? alerts : [];
  const safeRadio = Array.isArray(radio) ? radio : [];
  const filteredAlerts = regionFilter === "ALL" ? safeAlerts : filterAlertsByRegion(safeAlerts, regionFilter);
  const filteredRadio = regionFilter === "ALL" ? safeRadio : filterRadioByRegion(safeRadio, regionFilter);

  const bySource = safeAlerts.reduce((acc, a) => {
    const t = a.receivedAt.slice(0, 16);
    if (!acc[a.source]) acc[a.source] = { count: 0, last: "" };
    acc[a.source].count += 1;
    if (t > acc[a.source].last) acc[a.source].last = t;
    return acc;
  }, {} as Record<string, { count: number; last: string }>);
  const logEntries = safeAlerts
    .slice(0, 30)
    .map((a) => ({ ...a, sort: new Date(a.receivedAt).getTime() }))
    .sort((a, b) => b.sort - a.sort);

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab("alerts")}
            className={`rounded border px-2.5 py-1 text-[11px] font-medium ${activeTab === "alerts" ? "border-amber-400 bg-amber-50 text-amber-800" : "border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100"}`}
          >
            Alerts
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("radio")}
            className={`rounded border px-2.5 py-1 text-[11px] font-medium ${activeTab === "radio" ? "border-amber-400 bg-amber-50 text-amber-800" : "border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100"}`}
          >
            Radio
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("log")}
            className={`rounded border px-2.5 py-1 text-[11px] font-medium ${activeTab === "log" ? "border-amber-400 bg-amber-50 text-amber-800" : "border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100"}`}
          >
            Updates log
          </button>
        </div>
        <div className="flex flex-wrap gap-1">
          <span className="text-[10px] text-neutral-400">Region:</span>
          <button
            type="button"
            onClick={() => setRegionFilter("ALL")}
            className={`rounded border px-1.5 py-0.5 text-[10px] ${regionFilter === "ALL" ? "border-amber-400 bg-amber-50" : "border-neutral-200 bg-neutral-50"}`}
          >
            All
          </button>
          {REGIONS.map((r) => (
            <button
              key={r.code}
              type="button"
              onClick={() => setRegionFilter(r.code)}
              className={`rounded border px-1.5 py-0.5 text-[10px] ${regionFilter === r.code ? "border-amber-400 bg-amber-50" : "border-neutral-200 bg-neutral-50"}`}
            >
              {r.code}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "alerts" && (
        <section className="flex-1 space-y-2 overflow-auto">
          <p className="text-[11px] text-neutral-500">
            GDACS (disasters), USGS (earthquakes), ReliefWeb (crises). Severity: red / orange / green.
          </p>
          <ul className="space-y-2">
            {filteredAlerts.map((a) => (
              <li key={a.id} className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs">
                <a href={a.link} target="_blank" rel="noreferrer" className="block">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded border border-neutral-200 bg-neutral-100 px-1.5 py-0.5 font-mono text-[10px] text-neutral-600">
                      {a.source}
                    </span>
                    <span className={`rounded border px-1.5 py-0.5 text-[10px] ${severityClass(a.severity)}`}>
                      {a.severity}
                    </span>
                    <span className="text-[10px] text-neutral-400">{a.type}</span>
                    {a.magnitude != null && (
                      <span className="font-mono text-[10px] text-neutral-500">M{a.magnitude}</span>
                    )}
                  </div>
                  <div className="mt-1 font-medium text-neutral-900">{a.title}</div>
                  <div className="mt-0.5 text-[11px] text-neutral-500">
                    {a.regionCodes.join(", ")} · {formatTime(a.publishedAt)}
                  </div>
                </a>
              </li>
            ))}
            {filteredAlerts.length === 0 && (
              <li className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-4 text-[11px] text-neutral-500">
                No alerts for this region.
              </li>
            )}
          </ul>
        </section>
      )}

      {activeTab === "radio" && (
        <section className="flex-1 space-y-2 overflow-auto">
          <p className="text-[11px] text-neutral-500">
            International and national news/talk. Streams open in a new tab.
          </p>
          <ul className="space-y-2">
            {filteredRadio.map((s) => (
              <li
                key={s.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs"
              >
                <div>
                  <div className="font-medium text-neutral-900">{s.name}</div>
                  <div className="text-[11px] text-neutral-500">
                    {s.countryCode}
                    {s.regionCode ? ` · ${s.regionCode}` : ""}
                    {s.tags.length ? ` · ${s.tags.slice(0, 3).join(", ")}` : ""}
                  </div>
                </div>
                <div className="flex gap-1.5">
                  {s.homepage && (
                    <a
                      href={s.homepage}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded border border-neutral-200 bg-neutral-50 px-2 py-1 text-[11px] hover:bg-neutral-100"
                    >
                      Site
                    </a>
                  )}
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded border border-amber-300 bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-800 hover:bg-amber-100"
                  >
                    Listen
                  </a>
                </div>
              </li>
            ))}
            {filteredRadio.length === 0 && (
              <li className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-4 text-[11px] text-neutral-500">
                No stations for this region.
              </li>
            )}
          </ul>
        </section>
      )}

      {activeTab === "log" && (
        <section className="flex-1 overflow-auto">
          <div className="mb-3 rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-[11px]">
            <div className="font-medium text-neutral-700">Last update by source</div>
            <ul className="mt-1 space-y-0.5 text-neutral-600">
              {Object.entries(bySource).map(([source, v]) => (
                <li key={source}>
                  {source}: {v.count} items · {v.last.replace("T", " ")}
                </li>
              ))}
              {Object.keys(bySource).length === 0 && <li>No data yet.</li>}
            </ul>
          </div>
          <div className="font-medium text-neutral-700 text-[11px]">Recent feed log (received time)</div>
          <ul className="mt-1 space-y-1">
            {logEntries.map((a) => (
              <li key={a.id} className="flex gap-2 text-[11px]">
                <span className="shrink-0 font-mono text-neutral-400">
                  {a.receivedAt.slice(11, 19)}
                </span>
                <span className="rounded border border-neutral-200 bg-neutral-100 px-1 font-mono text-[10px]">
                  {a.source}
                </span>
                <a href={a.link} target="_blank" rel="noreferrer" className="truncate text-neutral-700 hover:underline">
                  {a.title.slice(0, 60)}{a.title.length > 60 ? "…" : ""}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
