"use client";

import { useLocale } from "@/contexts/LocaleContext";
import DecodeTestPanel from "@/components/DecodeTestPanel";

export default function DecodeTestPageContent() {
  const { t } = useLocale();
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-amber-200 bg-amber-50/80 p-3">
        <h1 className="text-sm font-semibold text-amber-900">
          {t("decode.title")}
        </h1>
        <p className="mt-1 text-xs text-amber-800">
          {t("decode.subtitle")}
        </p>
      </div>
      <DecodeTestPanel />
    </div>
  );
}
