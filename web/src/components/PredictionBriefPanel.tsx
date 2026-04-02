"use client";

import { useEffect, useState } from "react";
import { useLivePolling } from "@/contexts/LivePollingContext";
import { useLocale } from "@/contexts/LocaleContext";
import { formatPolyAbsolute, formatPolyRelativePast } from "@/lib/formatPolyTimes";
import {
  POLY_X_URL,
  parsePolymarketApiJson,
  type PolymarketRibbonItem,
} from "@/lib/polymarket";

const POLL_MS = 90_000;

function SectionBadge({ kind }: { kind: "live" | "editorial" }) {
  const { t } = useLocale();
  const isLive = kind === "live";
  return (
    <span
      className={
        "inline-block shrink-0 rounded px-1 py-0.5 font-board text-[7px] font-semibold uppercase tracking-[0.14em] " +
        (isLive
          ? "border border-emerald-500/35 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
          : "border border-amber-500/35 bg-amber-500/5 text-amber-900/90 dark:text-amber-400/85")
      }
      title={isLive ? undefined : t("predictions.badgeEditorialHint")}
    >
      {isLive ? t("predictions.badgeLive") : t("predictions.badgeEditorial")}
    </span>
  );
}

export default function PredictionBriefPanel({ className = "" }: { className?: string }) {
  const { shouldPoll, reportFeedSuccess } = useLivePolling();
  const { t, locale } = useLocale();
  const [items, setItems] = useState<PolymarketRibbonItem[]>([]);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [relTick, setRelTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setRelTick((n) => n + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/live/polymarket", { cache: "no-store" });
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
          <SectionBadge kind="editorial" />
          <p className="font-board text-[9px] font-semibold uppercase tracking-[0.18em] text-amber-800/90 dark:text-amber-400/90">
            {t("predictions.scenarioTitle")}
          </p>
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-neutral-600 dark:text-zinc-400">
          {t("predictions.scenarioLead")}
        </p>
        <p className="mt-1.5 text-[10px] font-medium text-neutral-500 dark:text-zinc-500">
          {t("predictions.chainIntro")}
        </p>
        <ul className="mt-1 space-y-0.5 text-[11px] leading-relaxed text-neutral-600 dark:text-zinc-400">
          <li>• {t("predictions.chain1")}</li>
          <li>• {t("predictions.chain2")}</li>
          <li>• {t("predictions.chain3")}</li>
          <li>• {t("predictions.chain4")}</li>
          <li>• {t("predictions.chain5")}</li>
        </ul>
        <p className="mt-1.5 text-[10px] leading-snug text-neutral-500 dark:text-zinc-500">
          {t("predictions.chainVerify")}
        </p>
      </div>

      <div className="border-b border-neutral-200 px-2.5 py-2 dark:border-zinc-800">
        <div className="flex flex-wrap items-center gap-1.5">
          <SectionBadge kind="editorial" />
          <p className="font-board text-[9px] font-semibold uppercase tracking-[0.18em] text-neutral-600 dark:text-zinc-400">
            {t("predictions.tradeSignalsTitle")}
          </p>
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-neutral-600 dark:text-zinc-400">
          {t("predictions.tradeSignalsBody")}
        </p>
      </div>

      <div className="border-b border-neutral-200 px-2.5 py-2 dark:border-zinc-800">
        <div className="flex flex-wrap items-center gap-1.5">
          <SectionBadge kind="editorial" />
          <p className="font-board text-[9px] font-semibold uppercase tracking-[0.18em] text-neutral-600 dark:text-zinc-400">
            {t("predictions.eventsHorizonTitle")}
          </p>
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-neutral-600 dark:text-zinc-400">
          {t("predictions.eventsHorizonBody")}
        </p>
      </div>

      <div className="border-b border-neutral-200 px-2.5 py-2 dark:border-zinc-800">
        <div className="flex flex-wrap items-center gap-1.5">
          <SectionBadge kind="editorial" />
          <p className="font-board text-[9px] font-semibold uppercase tracking-[0.18em] text-neutral-600 dark:text-zinc-400">
            {t("predictions.positioningTitle")}
          </p>
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-neutral-600 dark:text-zinc-400">
          {t("predictions.positioningLead")}
        </p>
        <ul className="mt-1 space-y-1 text-[11px] leading-relaxed text-neutral-600 dark:text-zinc-400">
          <li>• {t("predictions.positioningQ1")}</li>
          <li>• {t("predictions.positioningQ2")}</li>
          <li>• {t("predictions.positioningQ3")}</li>
        </ul>
      </div>

      <div className="border-b border-neutral-200 px-2.5 py-2 dark:border-zinc-800">
        <div className="flex flex-wrap items-center gap-1.5">
          <SectionBadge kind="editorial" />
          <p className="font-board text-[9px] font-semibold uppercase tracking-[0.18em] text-neutral-600 dark:text-zinc-400">
            {t("predictions.historyLensTitle")}
          </p>
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-neutral-600 dark:text-zinc-400">
          {t("predictions.historyLensBody")}
        </p>
      </div>

      <div className="border-b border-neutral-200 px-2.5 py-2 dark:border-zinc-800">
        <div className="flex flex-wrap items-center gap-1.5">
          <SectionBadge kind="editorial" />
          <p className="font-board text-[9px] font-semibold uppercase tracking-[0.18em] text-emerald-800/90 dark:text-emerald-400/90">
            {t("predictions.directivesTitle")}
          </p>
        </div>
        <ul className="mt-1 space-y-1 text-[11px] text-neutral-600 dark:text-zinc-400">
          <li>• {t("predictions.d1")}</li>
          <li>• {t("predictions.d2")}</li>
          <li>• {t("predictions.d3")}</li>
          <li>• {t("predictions.d4")}</li>
        </ul>
      </div>

      <div className="px-2.5 py-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <SectionBadge kind="editorial" />
          <p className="font-board text-[9px] font-semibold uppercase tracking-[0.18em] text-sky-800/90 dark:text-sky-400/90">
            {t("predictions.psychTitle")}
          </p>
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-neutral-600 dark:text-zinc-400">
          {t("predictions.psychBody")}
        </p>
      </div>
    </div>
  );
}
