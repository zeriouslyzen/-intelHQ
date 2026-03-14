"use client";

import Link from "next/link";
import { LocaleProvider, useLocale } from "@/contexts/LocaleContext";
import AiAssistPanel from "@/components/AiAssistPanel";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import NavTickers from "@/components/NavTickers";
import OnboardingTutorial from "@/components/OnboardingTutorial";

function HeaderWithLocale() {
  const { t } = useLocale();
  return (
    <header className="border-b border-neutral-200 bg-white/90 px-4 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2 hover:opacity-90">
          <div className="h-6 w-6 rounded-sm border border-amber-400/70 bg-gradient-to-br from-amber-300 to-yellow-400 shadow-[0_0_18px_rgba(251,191,36,0.6)]" />
          <div className="leading-tight">
            <div className="text-xs uppercase tracking-[0.18em] text-neutral-500">
              {t("header.globalOps")}
            </div>
            <div className="text-sm font-semibold text-neutral-900">
              {t("header.worldSignals")}
            </div>
          </div>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher />
          <span className="hidden items-center gap-1 text-xs text-neutral-500 sm:inline-flex">
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/80 bg-emerald-50 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.16em] text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
              {t("header.liveFeed")}
            </span>
          </span>
        </div>
      </div>
    </header>
  );
}

function MainAndFooterWithLocale({ children }: { children: React.ReactNode }) {
  const { t } = useLocale();
  return (
    <>
      <main className="mx-auto flex w-full max-w-6xl flex-1 gap-4 px-3 py-4 pb-16 sm:px-4 sm:pb-4">
        <div className="hidden w-56 shrink-0 flex-col gap-2 sm:flex">
          <nav className="space-y-1 rounded-xl border border-neutral-200 bg-white/90 p-2 text-sm shadow-sm">
            <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
              {t("nav.console")}
            </div>
            <Link
              href="/"
              className="flex items-center justify-between rounded-lg bg-amber-50 px-2.5 py-1.5 text-neutral-900 hover:bg-amber-100"
            >
              <span>{t("nav.today")}</span>
              <span className="text-[10px] text-amber-600">/</span>
            </Link>
            <Link
              href="/markets"
              className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-neutral-700 hover:bg-sky-50"
            >
              <span>{t("nav.markets")}</span>
              <span className="text-[10px] text-neutral-400">/markets</span>
            </Link>
            <Link
              href="/map"
              className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-neutral-700 hover:bg-sky-50"
            >
              <span>{t("nav.map")}</span>
              <span className="text-[10px] text-neutral-400">/map</span>
            </Link>
            <Link
              href="/events"
              className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-neutral-700 hover:bg-sky-50"
            >
              <span>{t("nav.events")}</span>
              <span className="text-[10px] text-neutral-400">/events</span>
            </Link>
            <Link
              href="/wartime"
              className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-neutral-700 hover:bg-sky-50"
            >
              <span>{t("nav.wartime")}</span>
              <span className="text-[10px] text-neutral-400">/wartime</span>
            </Link>
            <Link
              href="/alerts"
              className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-neutral-700 hover:bg-sky-50"
            >
              <span>{t("nav.alerts")}</span>
              <span className="text-[10px] text-neutral-400">/alerts</span>
            </Link>
            <Link
              href="/chat"
              className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-neutral-700 hover:bg-sky-50"
            >
              <span>{t("nav.chat")}</span>
              <span className="text-[10px] text-neutral-400">/chat</span>
            </Link>
            <Link
              href="/notes"
              className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-neutral-700 hover:bg-sky-50"
            >
              <span>{t("nav.notes")}</span>
              <span className="text-[10px] text-neutral-400">/notes</span>
            </Link>
            <Link
              href="/settings/feeds"
              className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-neutral-700 hover:bg-sky-50"
            >
              <span>{t("nav.feeds")}</span>
              <span className="text-[10px] text-neutral-400">/settings/feeds</span>
            </Link>
            <Link
              href="/decode-test"
              className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-neutral-500 hover:bg-sky-50"
            >
              <span>{t("nav.decodeTest")}</span>
              <span className="text-[10px] text-neutral-400">/decode-test</span>
            </Link>
          </nav>
        </div>
        <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto rounded-xl border border-neutral-200 bg-white/95 p-3 shadow-sm sm:p-4">
          {children}
        </section>
      </main>
      <footer className="fixed bottom-0 left-0 right-0 z-30 border-t border-neutral-200 bg-white/95 px-4 py-2 sm:hidden">
        <nav className="mx-auto flex max-w-md items-center justify-between text-[11px] font-medium text-neutral-500">
          <Link href="/" className="flex flex-1 flex-col items-center gap-0.5">
            <span className="h-1 w-6 rounded-full bg-amber-400" />
            <span>{t("nav.today")}</span>
          </Link>
          <Link href="/markets" className="flex flex-1 flex-col items-center gap-0.5">
            <span className="h-1 w-6 rounded-full bg-neutral-300" />
            <span>{t("nav.markets")}</span>
          </Link>
          <Link href="/map" className="flex flex-1 flex-col items-center gap-0.5">
            <span className="h-1 w-6 rounded-full bg-neutral-300" />
            <span>{t("nav.map")}</span>
          </Link>
          <Link href="/events" className="flex flex-1 flex-col items-center gap-0.5">
            <span className="h-1 w-6 rounded-full bg-neutral-300" />
            <span>{t("nav.events")}</span>
          </Link>
          <Link href="/wartime" className="flex flex-1 flex-col items-center gap-0.5">
            <span className="h-1 w-6 rounded-full bg-neutral-300" />
            <span>{t("nav.wartime")}</span>
          </Link>
          <Link href="/alerts" className="flex flex-1 flex-col items-center gap-0.5">
            <span className="h-1 w-6 rounded-full bg-neutral-300" />
            <span>{t("nav.alerts")}</span>
          </Link>
          <Link href="/chat" className="flex flex-1 flex-col items-center gap-0.5">
            <span className="h-1 w-6 rounded-full bg-neutral-300" />
            <span>{t("nav.chat")}</span>
          </Link>
          <Link href="/notes" className="flex flex-1 flex-col items-center gap-0.5">
            <span className="h-1 w-6 rounded-full bg-neutral-300" />
            <span>{t("nav.notes")}</span>
          </Link>
        </nav>
      </footer>
    </>
  );
}

export default function LayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LocaleProvider>
      <div className="flex min-h-screen flex-col bg-gradient-to-b from-white via-neutral-50 to-sky-50/40 text-neutral-900">
        <HeaderWithLocale />
        <NavTickers />
        <MainAndFooterWithLocale>{children}</MainAndFooterWithLocale>
        <AiAssistPanel />
        <OnboardingTutorial />
      </div>
    </LocaleProvider>
  );
}
