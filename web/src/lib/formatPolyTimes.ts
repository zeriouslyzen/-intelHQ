import type { Locale } from "@/contexts/LocaleContext";

const localeTag: Record<Locale, string> = {
  en: "en-US",
  es: "es",
  ja: "ja-JP",
  tr: "tr",
};

/** Short absolute time for feed snapshot lines */
export function formatPolyAbsolute(iso: string, locale: Locale): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat(localeTag[locale], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: locale !== "ja",
  }).format(d);
}

/** Relative past time from Gamma `updatedAt` */
export function formatPolyRelativePast(iso: string, locale: Locale): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const rtf = new Intl.RelativeTimeFormat(localeTag[locale], {
    numeric: "auto",
  });
  let diffSec = Math.round((Date.now() - d.getTime()) / 1000);
  if (diffSec < 0) diffSec = 0;
  if (diffSec < 60) return rtf.format(-diffSec, "second");
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return rtf.format(-diffMin, "minute");
  const diffHr = Math.round(diffSec / 3600);
  if (diffHr < 48) return rtf.format(-diffHr, "hour");
  const diffDay = Math.round(diffSec / 86400);
  return rtf.format(-diffDay, "day");
}
