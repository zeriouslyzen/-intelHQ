"use client";

import { useLocale } from "@/contexts/LocaleContext";
import BreakingHeadlinesStripLive from "@/components/BreakingHeadlinesStripLive";
import LiveStreamFlipper from "@/components/LiveStreamFlipper";
import RegionDashboard from "@/components/RegionDashboard";
import TodayEditorialBrief from "@/components/TodayEditorialBrief";
import TodayIntelSider from "@/components/TodayIntelSider";
import TodayMapEmbed from "@/components/TodayMapEmbed";
import type { Quote, CommodityQuote } from "@/lib/markets";
import type { NewsItem } from "@/lib/news";
import type { ConflictItem } from "@/lib/conflict";
import type { FlightState } from "@/lib/flights";
import type { VesselPosition } from "@/lib/vessels";

export interface HeadlineItemForStrip {
  id: string;
  title: string;
  link: string;
  source: string;
}

function symbolMarketClass(symbol: string): string {
  if (symbol.startsWith("^"))
    return "text-amber-600 dark:text-[var(--mkt-index)]";
  if (symbol.endsWith("=X"))
    return "text-cyan-700 dark:text-[var(--mkt-fx)]";
  if (symbol.endsWith("=F"))
    return "text-violet-700 dark:text-[var(--mkt-commodity)]";
  return "text-neutral-800 dark:text-zinc-300";
}

function fmtPct(n: number | undefined | null): string {
  if (n == null || Number.isNaN(n)) return "—";
  return n.toFixed(2);
}

interface TodayPageContentProps {
  indices: Quote[];
  fx: Quote[];
  commodities: CommodityQuote[];
  news: NewsItem[];
  conflict: ConflictItem[];
  headlineItems: HeadlineItemForStrip[];
  mainIndex: Quote | null;
  riskLabel: "risk-on" | "risk-off" | "mixed" | null;
  flightStates?: FlightState[];
  vesselPositions?: VesselPosition[];
}

export default function TodayPageContent({
  indices,
  fx,
  commodities,
  news,
  conflict,
  headlineItems,
  mainIndex,
  riskLabel,
  flightStates = [],
  vesselPositions = [],
}: TodayPageContentProps) {
  const { t } = useLocale();

  const mainChg = mainIndex?.changePercent;
  const mainChgOk = mainChg != null && !Number.isNaN(mainChg);

  return (
    <TodayIntelSider news={news} conflict={conflict} maxOsintLines={32}>
      <TodayEditorialBrief
        conflict={conflict}
        news={news}
        riskLabel={riskLabel}
        mainIndex={mainIndex}
      />
        <BreakingHeadlinesStripLive
          initialItems={headlineItems}
          className="min-w-0 shrink-0"
        />
        <LiveStreamFlipper
          className="min-w-0 shrink-0"
          defaultChannelId={undefined}
        />

        <section className="grid min-w-0 grid-cols-1 gap-3 md:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)]">
          <div className="min-w-0 space-y-3 rounded-xl border border-amber-200/80 bg-white p-4 shadow-[0_18px_40px_rgba(15,23,42,0.10)] dark:border-amber-500/15 dark:bg-gradient-to-br dark:from-zinc-950 dark:via-[#0c0c0e] dark:to-zinc-950 dark:shadow-[0_24px_64px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.05)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-board text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500 dark:text-zinc-500">
                  {t("today.regime")}
                </p>
                <h1 className="mt-1 text-lg font-semibold tracking-tight text-neutral-900 dark:text-zinc-50">
                  {t("today.worldOverview")}
                </h1>
              </div>
              <span className="font-mkt-mono inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-50 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-950/45 dark:text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                {t("common.live")}
              </span>
            </div>
            <p className="text-sm text-neutral-700 dark:text-zinc-400">
              {t("today.snapshot", {
                index: mainIndex ? mainIndex.name : "a major index",
              })}
            </p>
            <div className="mt-2 grid gap-3 text-xs text-neutral-700 dark:text-zinc-400 sm:grid-cols-3">
              <div className="rounded-lg border border-amber-200/90 bg-amber-50/70 p-3 dark:border-amber-500/12 dark:bg-amber-950/25">
                <div className="font-board text-[10px] uppercase tracking-[0.2em] text-neutral-500 dark:text-zinc-500">
                  {t("today.indices")}
                </div>
                {mainIndex ? (
                  <>
                    <div className="mt-1 text-sm font-semibold text-neutral-900 dark:text-zinc-100">
                      {mainIndex.name}
                    </div>
                    <div className="font-mkt-mono mt-0.5 text-[11px] text-neutral-800 dark:text-zinc-300">
                      {Number.isFinite(mainIndex.price)
                        ? mainIndex.price.toFixed(2)
                        : "—"}{" "}
                      {mainChgOk ? (
                        <span
                          className={
                            mainChg >= 0
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-red-600 dark:text-rose-400"
                          }
                        >
                          {fmtPct(mainChg)}%
                        </span>
                      ) : (
                        <span className="text-neutral-500">—</span>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="mt-2 text-[11px] text-neutral-500 dark:text-zinc-600">
                    {t("common.feedOfflineRetry")}
                  </div>
                )}
              </div>
              <div className="rounded-lg border border-sky-200/90 bg-sky-50/70 p-3 dark:border-cyan-500/15 dark:bg-cyan-950/20">
                <div className="font-board text-[10px] uppercase tracking-[0.2em] text-neutral-500 dark:text-zinc-500">
                  {t("today.fx")}
                </div>
                <ul className="font-mkt-mono mt-1 space-y-0.5 text-[11px]">
                  {fx.slice(0, 4).map((pair) => (
                    <li
                      key={pair.symbol}
                      className="flex items-center justify-between"
                    >
                      <span className={symbolMarketClass(pair.symbol)}>
                        {pair.symbol}
                      </span>
                      <span className="text-neutral-900 dark:text-cyan-100/90">
                        {Number.isFinite(pair.price)
                          ? pair.price.toFixed(4)
                          : "—"}
                      </span>
                    </li>
                  ))}
                  {fx.length === 0 && (
                    <li className="text-neutral-500 dark:text-zinc-600">
                      {t("common.feedOffline")}
                    </li>
                  )}
                </ul>
              </div>
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 dark:border-zinc-700/80 dark:bg-zinc-900/40">
                <div className="font-board text-[10px] uppercase tracking-[0.2em] text-neutral-500 dark:text-zinc-500">
                  {t("today.volatility")}
                </div>
                <div className="mt-1 text-sm font-semibold text-amber-600 dark:text-amber-400">
                  {indices.find((q) => q.symbol === "^VIX") &&
                  Number.isFinite(
                    indices.find((q) => q.symbol === "^VIX")!.price
                  )
                    ? `${indices.find((q) => q.symbol === "^VIX")!.price.toFixed(2)} VIX`
                    : t("today.vixUnavailable")}
                </div>
                <p className="mt-1 text-[11px] text-neutral-500 dark:text-zinc-600">
                  {t("today.volatilityProxy")}
                </p>
              </div>
            </div>
          </div>

          <div className="min-w-0 space-y-3 rounded-xl border border-sky-200/80 bg-white p-4 dark:border-cyan-500/12 dark:bg-zinc-950/70">
            <p className="font-board text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500 dark:text-zinc-500">
              {t("today.worldMap")}
            </p>
            <p className="text-sm text-neutral-700 dark:text-zinc-400">
              {t("today.worldMapDesc")}
            </p>
            <TodayMapEmbed
              news={news}
              conflict={conflict}
              flightStates={flightStates}
              vesselPositions={vesselPositions}
            />
          </div>
        </section>

        <section className="grid min-w-0 grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="min-w-0 rounded-xl border border-neutral-200 bg-white p-4 dark:border-zinc-800/80 dark:bg-zinc-950/50">
            <p className="font-board text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500 dark:text-zinc-500">
              {t("today.focusChina")}
            </p>
            <RegionDashboard
              regionCode="CHN"
              fx={fx}
              commodities={commodities}
              news={news}
              className="mt-2 border-0 p-0"
            />
          </div>
          <div className="min-w-0 rounded-xl border border-neutral-200 bg-white p-4 dark:border-zinc-800/80 dark:bg-zinc-950/50">
            <p className="font-board text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500 dark:text-zinc-500">
              {t("today.focusMena")}
            </p>
            <RegionDashboard
              regionCode="MENA"
              fx={fx}
              commodities={commodities}
              news={news}
              className="mt-2 border-0 p-0"
            />
          </div>
        </section>

        <section className="min-w-0 rounded-xl border border-neutral-200 bg-white p-4 dark:border-zinc-800/80 dark:bg-zinc-950/50">
          <div className="flex items-center justify-between">
            <p className="font-board text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500 dark:text-zinc-500">
              {t("today.watchlist")}
            </p>
            <span className="font-mkt-mono text-[10px] text-neutral-400 dark:text-zinc-600">
              {t("today.marketsFxIndices")}
            </span>
          </div>
          <table className="font-mkt-mono mt-2 w-full min-w-0 table-fixed border-separate border-spacing-y-1 text-xs text-neutral-800 dark:text-zinc-300">
            <thead className="font-board text-[10px] uppercase tracking-[0.18em] text-neutral-500 dark:text-zinc-500">
              <tr>
                <th className="px-2 text-left">{t("today.instrument")}</th>
                <th className="px-2 text-right">{t("today.last")}</th>
                <th className="px-2 text-right">{t("today.percentChg")}</th>
              </tr>
            </thead>
            <tbody>
              {indices.map((q) => {
                const pct = q.changePercent;
                const pctOk = pct != null && !Number.isNaN(pct);
                return (
                  <tr
                    key={q.symbol}
                    className="rounded-lg border border-neutral-200 bg-neutral-50 dark:border-zinc-800/60 dark:bg-zinc-900/35"
                  >
                    <td className="min-w-0 px-2 py-1.5">
                      <div
                        className={`truncate font-board text-[11px] font-semibold tracking-wide ${symbolMarketClass(q.symbol)}`}
                      >
                        {q.symbol}
                      </div>
                      <div className="truncate text-[11px] text-neutral-500 dark:text-zinc-600">
                        {q.name}
                      </div>
                    </td>
                    <td className="px-2 py-1.5 text-right tabular-nums">
                      {Number.isFinite(q.price) ? q.price.toFixed(2) : "—"}
                    </td>
                    <td className="px-2 py-1.5 text-right tabular-nums">
                      {pctOk ? (
                        <span
                          className={
                            pct >= 0
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-red-600 dark:text-rose-400"
                          }
                        >
                          {fmtPct(pct)}%
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                );
              })}
              {indices.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-2 py-2 text-center text-[11px] text-neutral-500 dark:text-zinc-600"
                  >
                    {t("common.refreshRetry")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
    </TodayIntelSider>
  );
}
