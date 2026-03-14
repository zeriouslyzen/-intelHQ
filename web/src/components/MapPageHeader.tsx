"use client";

import { useLocale } from "@/contexts/LocaleContext";

export default function MapPageHeader() {
  const { t } = useLocale();
  return (
    <header className="flex items-center justify-between gap-3 border-b border-neutral-200 pb-3">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
          {t("nav.map")}
        </p>
        <h1 className="mt-1 text-base font-semibold text-neutral-900">
          {t("map.pageHeading")}
        </h1>
      </div>
      <div className="hidden text-[11px] text-neutral-500 sm:block">
        {t("map.realMetricsDesc")}
      </div>
    </header>
  );
}
