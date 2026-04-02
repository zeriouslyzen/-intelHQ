"use client";

import Link from "next/link";
import { useLocale } from "@/contexts/LocaleContext";

interface SidebarGlobalChatProps {
  /** When true, no border/rounded so it fills a parent panel (e.g. slide-out). */
  embedded?: boolean;
}

export default function SidebarGlobalChat({ embedded }: SidebarGlobalChatProps) {
  const { t } = useLocale();

  return (
    <div
      className={
        embedded
          ? "flex h-full min-h-0 flex-col"
          : "flex min-h-0 flex-1 flex-col rounded-xl border border-neutral-200 bg-white/90 shadow-sm"
      }
    >
      {!embedded && (
        <div className="flex shrink-0 items-center gap-2 border-b border-neutral-200 px-2.5 py-2">
          <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" aria-hidden />
          <span className="truncate text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-600">
            {t("nav.chat")}
          </span>
        </div>
      )}
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-2.5 py-4 text-center text-[11px] text-neutral-500">
        <p>{t("chat.sidebarHint")}</p>
        <Link
          href="/chat"
          className="mt-2 text-sky-600 underline hover:text-sky-700"
        >
          {t("nav.chat")}
        </Link>
      </div>
    </div>
  );
}
