"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/contexts/LocaleContext";

const NAV_ITEMS: readonly { href: string; labelKey: string; pathMono: string }[] = [
  { href: "/", labelKey: "nav.today", pathMono: "/" },
  { href: "/markets", labelKey: "nav.markets", pathMono: "/markets" },
  { href: "/map", labelKey: "nav.map", pathMono: "/map" },
  { href: "/events", labelKey: "nav.events", pathMono: "/events" },
  { href: "/wartime", labelKey: "nav.wartime", pathMono: "/wartime" },
  { href: "/alerts", labelKey: "nav.alerts", pathMono: "/alerts" },
  { href: "/settings/feeds", labelKey: "nav.feeds", pathMono: "/feeds" },
] as const;

function routeActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function BottomNavBar() {
  const pathname = usePathname();
  const { t } = useLocale();

  if (pathname.startsWith("/signin") || pathname.startsWith("/signup")) {
    return null;
  }

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 border-t border-neutral-200/90 bg-white/95 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-0 shadow-[0_-8px_28px_rgba(0,0,0,0.08)] backdrop-blur-xl dark:border-zinc-800/90 dark:bg-zinc-950/92 dark:shadow-[0_-8px_32px_rgba(0,0,0,0.55)]">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent dark:via-amber-500/35"
        aria-hidden
      />
      <nav
        className="mx-auto max-w-6xl px-1 sm:px-3"
        aria-label={t("a11y.primaryNav")}
      >
        <ul className="flex items-stretch justify-start gap-0.5 overflow-x-auto overflow-y-hidden py-2 sm:justify-between sm:gap-1 sm:overflow-visible sm:py-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {NAV_ITEMS.map((item) => {
            const on = routeActive(pathname, item.href);
            return (
              <li key={item.href} className="shrink-0 sm:min-w-0 sm:flex-1">
                <Link
                  href={item.href}
                  className={
                    "flex min-w-[4.25rem] flex-col items-center justify-center gap-0.5 rounded-lg px-2 py-1.5 text-center transition-colors sm:min-w-0 " +
                    (on
                      ? "bg-amber-100/90 text-amber-950 ring-1 ring-amber-300/60 dark:bg-amber-500/10 dark:text-amber-100 dark:ring-amber-500/25"
                      : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 dark:text-zinc-500 dark:hover:bg-zinc-800/40 dark:hover:text-zinc-200")
                  }
                >
                  <span
                    className={
                      "font-board max-w-[4.5rem] truncate text-[9px] font-semibold uppercase tracking-[0.14em] sm:max-w-none sm:text-[10px] sm:tracking-[0.16em] " +
                      (on ? "text-amber-950 dark:text-amber-100" : "")
                    }
                  >
                    {t(item.labelKey)}
                  </span>
                  <span
                    className={
                      "font-mkt-mono text-[7px] tabular-nums opacity-75 sm:text-[8px] " +
                      (on
                        ? "text-amber-800 dark:text-amber-400/90"
                        : "text-neutral-400 dark:text-zinc-600")
                    }
                  >
                    {item.pathMono}
                  </span>
                  {on ? (
                    <span
                      className="mt-0.5 h-0.5 w-6 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.45)] dark:bg-amber-400 dark:shadow-[0_0_12px_rgba(251,191,36,0.5)] sm:w-8"
                      aria-hidden
                    />
                  ) : (
                    <span className="mt-0.5 h-0.5 w-6 opacity-0 sm:w-8" aria-hidden />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </footer>
  );
}
