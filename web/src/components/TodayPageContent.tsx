"use client";

import { useLocale } from "@/contexts/LocaleContext";
import BreakingHeadlinesStripLive from "@/components/BreakingHeadlinesStripLive";
import LiveStreamFlipper from "@/components/LiveStreamFlipper";
import RegionDashboard from "@/components/RegionDashboard";
import TodaySummaryLine from "@/components/TodaySummaryLine";
import type { Quote, CommodityQuote } from "@/lib/markets";
import type { NewsItem } from "@/lib/news";
import type { ConflictItem } from "@/lib/conflict";

export interface HeadlineItemForStrip {
  id: string;
  title: string;
  link: string;
  source: string;
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
}: TodayPageContentProps) {
  const { t } = useLocale();

  return (
    <div className="flex min-h-0 min-w-0 flex-col gap-4">
      <TodaySummaryLine conflict={conflict} riskLabel={riskLabel} />
      <BreakingHeadlinesStripLive initialItems={headlineItems} className="min-w-0 shrink-0" />
      <LiveStreamFlipper
        className="min-w-0 shrink-0"
        defaultChannelId={undefined}
      />
      <section className="grid min-w-0 grid-cols-1 gap-3 md:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)]">
        <div className="min-w-0 space-y-3 rounded-xl border border-amber-100 bg-white p-4 shadow-[0_18px_40px_rgba(15,23,42,0.10)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
                {t("today.regime")}
              </p>
              <h1 className="mt-1 text-lg font-semibold text-neutral-900">
                {t("today.worldOverview")}
              </h1>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/70 bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
              {t("common.live")}
            </span>
          </div>
          <p className="text-sm text-neutral-700">
            {t("today.snapshot", { index: mainIndex ? mainIndex.name : "a major index" })}
          </p>
          <div className="mt-2 grid gap-3 text-xs text-neutral-700 sm:grid-cols-3">
            <div className="rounded-lg border border-amber-100 bg-amber-50/70 p-3">
              <div className="text-[10px] uppercase tracking-[0.18em] text-neutral-500">
                {t("today.indices")}
              </div>
              {mainIndex ? (
                <>
                  <div className="mt-1 text-sm font-semibold text-neutral-900">
                    {mainIndex.name}
                  </div>
                  <div className="mt-0.5 font-mono text-[11px] text-neutral-800">
                    {mainIndex.price.toFixed(2)}{" "}
                    <span
                      className={
                        mainIndex.changePercent >= 0
                          ? "text-emerald-600"
                          : "text-red-600"
                      }
                    >
                      {mainIndex.changePercent.toFixed(2)}%
                    </span>
                  </div>
                </>
              ) : (
                <div className="mt-2 text-[11px] text-neutral-500">
                  {t("common.feedOfflineRetry")}
                </div>
              )}
            </div>
            <div className="rounded-lg border border-sky-100 bg-sky-50/70 p-3">
              <div className="text-[10px] uppercase tracking-[0.18em] text-neutral-500">
                {t("today.fx")}
              </div>
              <ul className="mt-1 space-y-0.5 text-[11px]">
                {fx.slice(0, 4).map((pair) => (
                  <li
                    key={pair.symbol}
                    className="flex items-center justify-between"
                  >
                    <span className="text-neutral-700">{pair.symbol}</span>
                    <span className="font-mono text-neutral-900">
                      {pair.price.toFixed(4)}
                    </span>
                  </li>
                ))}
                {fx.length === 0 && (
                  <li className="text-neutral-500">{t("common.feedOffline")}</li>
                )}
              </ul>
            </div>
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
              <div className="text-[10px] uppercase tracking-[0.18em] text-neutral-500">
                {t("today.volatility")}
              </div>
              <div className="mt-1 text-sm font-semibold text-amber-600">
                {indices.find((q) => q.symbol === "^VIX")
                  ? `${indices.find((q) => q.symbol === "^VIX")!.price.toFixed(2)} VIX`
                  : t("today.vixUnavailable")}
              </div>
              <p className="mt-1 text-[11px] text-neutral-500">
                {t("today.volatilityProxy")}
              </p>
            </div>
          </div>
        </div>
        <div className="min-w-0 space-y-3 rounded-xl border border-sky-100 bg-white p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
            {t("today.worldMap")}
          </p>
          <p className="text-sm text-neutral-700">
            {t("today.worldMapDesc")}
          </p>
          <div className="mt-2 h-36 rounded-lg border border-sky-100 bg-[radial-gradient(circle_at_10%_0%,rgba(59,130,246,0.16),transparent_55%),radial-gradient(circle_at_90%_100%,rgba(52,211,153,0.16),transparent_55%),linear-gradient(to_bottom,#eff6ff,#e0f2fe)]" />
        </div>
      </section>
      <section className="grid min-w-0 grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="min-w-0 rounded-xl border border-neutral-200 bg-white p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
            {t("today.focusChina")}
          </p>
          <RegionDashboard
            regionCode="CHN"
            fx={fx}
            commodities={commodities}
            className="mt-2 border-0 p-0"
          />
        </div>
        <div className="min-w-0 rounded-xl border border-neutral-200 bg-white p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
            {t("today.focusMena")}
          </p>
          <RegionDashboard
            regionCode="MENA"
            fx={fx}
            commodities={commodities}
            className="mt-2 border-0 p-0"
          />
        </div>
      </section>
      <section className="grid min-w-0 grid-cols-1 gap-3 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1.4fr)]">
        <div className="min-w-0 space-y-2 rounded-xl border border-neutral-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
              {t("today.watchlist")}
            </p>
            <span className="text-[10px] text-neutral-400">
              {t("today.marketsFxIndices")}
            </span>
          </div>
          <table className="mt-2 w-full min-w-0 table-fixed border-separate border-spacing-y-1 text-xs text-neutral-800">
            <thead className="text-[10px] uppercase tracking-[0.16em] text-neutral-500">
              <tr>
                <th className="px-2 text-left">{t("today.instrument")}</th>
                <th className="px-2 text-right">{t("today.last")}</th>
                <th className="px-2 text-right">{t("today.percentChg")}</th>
              </tr>
            </thead>
            <tbody>
              {indices.map((q) => (
                <tr
                  key={q.symbol}
                  className="rounded-lg border border-neutral-200 bg-neutral-50"
                >
                  <td className="px-2 py-1.5 min-w-0">
                    <div className="truncate font-medium text-neutral-900">
                      {q.symbol}
                    </div>
                    <div className="truncate text-[11px] text-neutral-500">
                      {q.name}
                    </div>
                  </td>
                  <td className="px-2 py-1.5 text-right font-mono">
                    {q.price.toFixed(2)}
                  </td>
                  <td className="px-2 py-1.5 text-right font-mono">
                    <span
                      className={
                        q.changePercent >= 0
                          ? "text-emerald-600"
                          : "text-red-600"
                      }
                    >
                      {q.changePercent.toFixed(2)}%
                    </span>
                  </td>
                </tr>
              ))}
              {indices.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-2 py-2 text-center text-[11px] text-neutral-500"
                  >
                    {t("common.refreshRetry")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="min-w-0 space-y-2 rounded-xl border border-neutral-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
              {t("today.activityFeed")}
            </p>
            <span className="text-[10px] text-neutral-400">
              {t("today.eventsHeadlines")}
            </span>
          </div>
          <ul className="mt-1 space-y-2 text-xs text-neutral-800">
            {news.map((item, i) => (
              <li
                key={`news-${i}-${item.title.slice(0, 30)}`}
                className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2"
              >
                <a
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                  className="block min-w-0"
                >
                  <div className="truncate font-medium text-neutral-900">
                    {item.title}
                  </div>
                  <div className="mt-0.5 text-[11px] text-neutral-500">
                    {item.source}
                  </div>
                </a>
              </li>
            ))}
            {news.length === 0 && (
              <li className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-[11px] text-neutral-500">
                {t("common.newsFeedOffline")}
              </li>
            )}
          </ul>
        </div>
      </section>
    </div>
  );
}
