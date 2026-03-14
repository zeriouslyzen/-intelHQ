"use client";

import { useState, useEffect } from "react";
import { useLocale } from "@/contexts/LocaleContext";

const STORAGE_KEY = "worldsignals_tutorial_seen";

export default function OnboardingTutorial() {
  const { t } = useLocale();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = localStorage.getItem(STORAGE_KEY);
    setVisible(seen !== "1");
  }, []);

  const dismiss = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, "1");
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-20 right-4 z-40 max-w-sm rounded-xl border border-amber-200 bg-white p-4 shadow-lg sm:right-6 sm:bottom-24"
      role="dialog"
      aria-modal="false"
      aria-labelledby="tutorial-title"
    >
      <h2
        id="tutorial-title"
        className="text-sm font-semibold text-neutral-900"
      >
        {t("tutorial.title")}
      </h2>
      <div className="mt-2 space-y-2 text-xs text-neutral-700">
        <p>{t("tutorial.body1")}</p>
        <p>{t("tutorial.body2")}</p>
        <p>{t("tutorial.body3")}</p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={dismiss}
          className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          {t("tutorial.gotIt")}
        </button>
        <button
          type="button"
          onClick={dismiss}
          className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-300"
        >
          {t("tutorial.maybeLater")}
        </button>
      </div>
    </div>
  );
}
