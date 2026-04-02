"use client";

import { useLivePolling } from "@/contexts/LivePollingContext";
import { useLocale } from "@/contexts/LocaleContext";

const LOCALE_TAG: Record<string, string> = {
  en: "en-US",
  es: "es-ES",
  ja: "ja-JP",
  tr: "tr-TR",
};

export default function LiveFeedToggle() {
  const { pollEnabled, setPollEnabled, tabVisible, shouldPoll, lastRefreshAt } =
    useLivePolling();
  const { t, locale } = useLocale();

  const timeStr =
    lastRefreshAt != null
      ? lastRefreshAt.toLocaleTimeString(LOCALE_TAG[locale] ?? "en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      : null;

  return (
    <div className="flex max-w-[min(100vw,14rem)] flex-col items-end gap-0.5 sm:max-w-none sm:flex-row sm:items-center sm:gap-2">
      <button
        type="button"
        role="switch"
        aria-checked={pollEnabled}
        aria-label={
          pollEnabled ? t("header.liveMetricsAriaOn") : t("header.liveMetricsAriaOff")
        }
        title={t("header.liveMetricsHint")}
        onClick={() => setPollEnabled(!pollEnabled)}
        className={
          "font-mkt-mono shrink-0 rounded-md border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] transition " +
          (pollEnabled
            ? "border-emerald-500/40 bg-emerald-50 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-950/50 dark:text-emerald-200"
            : "border-neutral-200 bg-neutral-100 text-neutral-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400")
        }
      >
        {pollEnabled ? t("header.liveMetricsOn") : t("header.liveMetricsOff")}
        {shouldPoll ? (
          <span className="ml-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500 align-middle" />
        ) : null}
      </button>
      <span className="max-w-[10rem] truncate text-right font-mkt-mono text-[9px] leading-tight text-neutral-500 dark:text-zinc-500 sm:max-w-none sm:text-left">
        {!pollEnabled ? (
          <span>{t("header.snapshotMode")}</span>
        ) : !tabVisible ? (
          <span>{t("header.tabInBackground")}</span>
        ) : timeStr ? (
          <span>{t("header.lastUpdated", { time: timeStr })}</span>
        ) : (
          <span>{t("header.awaitingFirstFetch")}</span>
        )}
      </span>
    </div>
  );
}
