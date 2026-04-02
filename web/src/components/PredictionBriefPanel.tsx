"use client";

import { useEffect, useMemo, useState } from "react";
import { useLivePolling } from "@/contexts/LivePollingContext";
import { useLocale } from "@/contexts/LocaleContext";
import type { ConflictItem } from "@/lib/conflict";
import { formatPolyAbsolute, formatPolyRelativePast } from "@/lib/formatPolyTimes";
import {
  POLY_X_URL,
  parsePolymarketApiJson,
  type PolymarketRibbonItem,
} from "@/lib/polymarket";
import type { NewsItem } from "@/lib/news";
import { getThemeKeywordsFromTitles } from "@/lib/todaySummary";

const POLL_MS = 90_000;
const WIRE_LIMIT = 12;

type WireRow = {
  title: string;
  link: string;
  source: string;
  at: number;
};

function mergeConflictNewsWires(
  conflict: ConflictItem[],
  news: NewsItem[],
  limit: number
): WireRow[] {
  const seen = new Set<string>();
  const rows: WireRow[] = [];
  for (const c of conflict) {
    if (seen.has(c.link)) continue;
    seen.add(c.link);
    rows.push({
      title: c.title,
      link: c.link,
      source: c.source,
      at: Date.parse(c.publishedAt) || 0,
    });
  }
  for (const n of news) {
    if (seen.has(n.link)) continue;
    seen.add(n.link);
    rows.push({
      title: n.title,
      link: n.link,
      source: n.source,
      at: Date.parse(n.publishedAt) || 0,
    });
  }
  return rows.sort((a, b) => b.at - a.at).slice(0, limit);
}

function SectionBadge({ kind }: { kind: "live" | "feed" | "derived" }) {
  const { t } = useLocale();
  const style =
    kind === "live"
      ? "border-emerald-500/35 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
      : kind === "feed"
        ? "border-sky-500/35 bg-sky-500/10 text-sky-800 dark:text-sky-400"
        : "border-neutral-400/40 bg-neutral-500/5 text-neutral-700 dark:text-zinc-400";
  const label =
    kind === "live"
      ? t("predictions.badgeLive")
      : kind === "feed"
        ? t("predictions.badgeFeed")
        : t("predictions.badgeDerived");
  const title =
    kind === "feed"
      ? t("predictions.badgeFeedHint")
      : kind === "derived"
        ? t("predictions.badgeDerivedHint")
        : undefined;
  return (
    <span
      className={
        "inline-block shrink-0 rounded px-1 py-0.5 font-board text-[7px] font-semibold uppercase tracking-[0.14em] border " +
        style
      }
      title={title}
    >
      {label}
    </span>
  );
}

export default function PredictionBriefPanel({
  className = "",
  conflict,
  news,
}: {
  className?: string;
  conflict: ConflictItem[];
  news: NewsItem[];
}) {
  const { shouldPoll, reportFeedSuccess } = useLivePolling();
  const { t, locale } = useLocale();
  const [items, setItems] = useState<PolymarketRibbonItem[]>([]);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [relTick, setRelTick] = useState(0);

  const wires = useMemo(
    () => mergeConflictNewsWires(conflict, news, WIRE_LIMIT),
    [conflict, news]
  );

  const terms = useMemo(() => {
    const titles: string[] = [
      ...conflict.map((c) => c.title),
      ...news.slice(0, 40).map((n) => n.title),
      ...items.map((m) => m.question),
    ];
    return getThemeKeywordsFromTitles(titles, 10);
  }, [conflict, news, items]);

  useEffect(() => {
    const id = setInterval(() => setRelTick((n) => n + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/live/polymarket");
        if (cancelled) return;
        if (res.ok) {
          const raw = await res.json();
          const payload = parsePolymarketApiJson(raw);
          if (payload) {
            setItems(payload.markets);
            setFetchedAt(payload.fetchedAt);
            reportFeedSuccess();
          } else {
            setItems([]);
            setFetchedAt(null);
          }
        }
      } catch {
        if (!cancelled) {
          setItems([]);
          setFetchedAt(null);
        }
      } finally {
        if (!cancelled) setLoaded(true);
      }
    };
    load();
    if (!shouldPoll) {
      return () => {
        cancelled = true;
      };
    }
    const id = setInterval(load, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [shouldPoll, reportFeedSuccess]);

  return (
    <div
      className={
        "overflow-hidden rounded-xl border border-violet-200/80 bg-white dark:border-violet-500/20 dark:bg-zinc-950/80 " +
        className
      }
    >
      <div className="border-b border-violet-200/80 px-2.5 py-1.5 dark:border-violet-500/15">
        <p className="font-board text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-800 dark:text-violet-300">
          {t("predictions.title")}
        </p>
        <p className="mt-0.5 text-[10px] leading-snug text-neutral-500 dark:text-zinc-500">
          {t("predictions.subtitle")}
        </p>
        <p className="mt-1 text-[9px] leading-snug text-neutral-400 dark:text-zinc-600">
          {t("predictions.panelDisclaimer")}
        </p>
      </div>

      <div className="border-b border-neutral-200 px-2.5 py-2 dark:border-zinc-800">
        <div className="flex flex-wrap items-center gap-1.5">
          <SectionBadge kind="live" />
          <p className="font-board text-[9px] font-semibold uppercase tracking-[0.18em] text-neutral-600 dark:text-zinc-400">
            {t("predictions.polyTitle")}
          </p>
        </div>
        <p className="mt-1 text-[9px] leading-snug text-neutral-500 dark:text-zinc-500">
          {t("predictions.polySource")}
        </p>
        {fetchedAt && (
          <p className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 font-mkt-mono text-[9px] text-neutral-500 dark:text-zinc-500">
            <span>
              {t("predictions.polyFeedAsOf", {
                time: formatPolyAbsolute(fetchedAt, locale),
              })}
            </span>
            <span className="text-neutral-300 dark:text-zinc-700">·</span>
            <a
              href={POLY_X_URL}
              target="_blank"
              rel="noreferrer"
              className="text-violet-600 underline-offset-2 hover:text-violet-500 hover:underline dark:text-violet-400 dark:hover:text-violet-300"
            >
              {t("predictions.polyByX")}
            </a>
          </p>
        )}
        <ul
          className="mt-1.5 max-h-[200px] space-y-1.5 overflow-y-auto text-[11px]"
          data-rel-tick={relTick}
        >
          {!loaded && (
            <li className="text-neutral-400 dark:text-zinc-600">{t("common.loading")}…</li>
          )}
          {loaded && items.length === 0 && (
            <li className="text-neutral-500 dark:text-zinc-600">{t("predictions.polyEmpty")}</li>
          )}
          {items.map((m) => (
            <li key={m.slug}>
              <a
                href={m.url}
                target="_blank"
                rel="noreferrer"
                className="block rounded border border-transparent px-1 py-0.5 hover:border-violet-300/40 hover:bg-violet-50/50 dark:hover:border-violet-500/20 dark:hover:bg-violet-950/20"
              >
                <span className="font-mkt-mono text-violet-600 dark:text-violet-400">
                  {t("predictions.prob", {
                    p: Math.round(m.primaryProb * 1000) / 10,
                  })}{" "}
                  <span className="text-neutral-400 dark:text-zinc-600">
                    ({m.primaryLabel})
                  </span>
                </span>
                <span className="mt-0.5 block font-medium leading-snug text-neutral-800 dark:text-zinc-200">
                  {m.question.length > 96 ? `${m.question.slice(0, 94)}…` : m.question}
                </span>
                {m.updatedAt && (
                  <span className="mt-0.5 block font-mkt-mono text-[9px] text-neutral-400 dark:text-zinc-600">
                    {t("predictions.polyOddsUpdated", {
                      time: formatPolyRelativePast(m.updatedAt, locale),
                    })}
                  </span>
                )}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-b border-neutral-200 px-2.5 py-2 dark:border-zinc-800">
        <div className="flex flex-wrap items-center gap-1.5">
          <SectionBadge kind="derived" />
          <p className="font-board text-[9px] font-semibold uppercase tracking-[0.18em] text-neutral-600 dark:text-zinc-400">
            {t("predictions.derivedTermsTitle")}
          </p>
        </div>
        <p className="mt-1 text-[9px] leading-snug text-neutral-500 dark:text-zinc-500">
          {t("predictions.derivedTermsLead")}
        </p>
        {terms.length === 0 ? (
          <p className="mt-1.5 text-[11px] text-neutral-500 dark:text-zinc-600">
            {t("predictions.derivedTermsEmpty")}
          </p>
        ) : (
          <p className="mt-1.5 font-mkt-mono text-[11px] leading-relaxed text-neutral-700 dark:text-zinc-300">
            {terms.join(" · ")}
          </p>
        )}
      </div>

      <div className="px-2.5 py-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <SectionBadge kind="feed" />
          <p className="font-board text-[9px] font-semibold uppercase tracking-[0.18em] text-neutral-600 dark:text-zinc-400">
            {t("predictions.feedsTitle")}
          </p>
        </div>
        <p className="mt-1 text-[9px] leading-snug text-neutral-500 dark:text-zinc-500">
          {t("predictions.feedsLead")}
        </p>
        {wires.length === 0 ? (
          <p className="mt-1.5 text-[11px] text-neutral-500 dark:text-zinc-600">
            {t("predictions.feedsEmpty")}
          </p>
        ) : (
          <ul className="mt-1.5 max-h-[220px] space-y-1.5 overflow-y-auto text-[11px]">
            {wires.map((w) => (
              <li key={w.link}>
                <a
                  href={w.link}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded border border-transparent px-1 py-0.5 hover:border-sky-300/40 hover:bg-sky-50/40 dark:hover:border-sky-500/20 dark:hover:bg-sky-950/20"
                >
                  <span className="font-mkt-mono text-[9px] text-neutral-500 dark:text-zinc-500">
                    {w.source}
                  </span>
                  <span className="mt-0.5 block font-medium leading-snug text-neutral-800 dark:text-zinc-200">
                    {w.title.length > 120 ? `${w.title.slice(0, 118)}…` : w.title}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
