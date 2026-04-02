"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LocaleProvider, useLocale } from "@/contexts/LocaleContext";
import { LivePollingProvider } from "@/contexts/LivePollingContext";
import BottomNavBar from "@/components/BottomNavBar";
import HeaderSessionControls from "@/components/HeaderSessionControls";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import LiveFeedToggle from "@/components/LiveFeedToggle";
import OnboardingTutorial from "@/components/OnboardingTutorial";
import ThemeToggle from "@/components/ThemeToggle";

const NavTickers = dynamic(() => import("@/components/NavTickers"), {
  ssr: true,
  loading: () => (
    <div
      className="min-h-[7.5rem] border-b border-neutral-200 bg-white/95 dark:border-zinc-800 dark:bg-zinc-950/90"
      aria-hidden
    />
  ),
});

function HeaderWithLocale({ authEnabled }: { authEnabled: boolean }) {
  const { t } = useLocale();
  return (
    <header className="border-b border-neutral-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-zinc-800/80 dark:bg-zinc-950/85">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-sm hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40"
          aria-label={`${t("header.globalOps")} — ${t("header.worldSignals")}`}
        >
          <div
            className="h-6 w-6 shrink-0 rounded-sm border border-amber-400/70 bg-gradient-to-br from-amber-300 to-yellow-400 shadow-[0_0_18px_rgba(251,191,36,0.45)] dark:shadow-[0_0_22px_rgba(251,191,36,0.35)]"
            aria-hidden
          />
          <div className="leading-tight">
            <div className="font-board text-xs uppercase tracking-[0.22em] text-neutral-500 dark:text-zinc-500">
              {t("header.globalOps")}
            </div>
            <div className="font-board text-sm font-semibold tracking-wide text-neutral-900 dark:text-zinc-100">
              {t("header.worldSignals")}
            </div>
          </div>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          {authEnabled ? <HeaderSessionControls /> : null}
          <ThemeToggle />
          <LiveFeedToggle />
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}

function MainWithBottomPad({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideBottomNav =
    pathname.startsWith("/signin") || pathname.startsWith("/signup");

  return (
    <>
      <main
        className={
          "mx-auto flex min-h-0 w-full max-w-6xl flex-1 px-3 py-4 " +
          (hideBottomNav ? "pb-4 sm:pb-4" : "pb-[5.25rem] sm:pb-[5.5rem]")
        }
      >
        <section className="app-scroll-surface flex min-h-0 min-w-0 flex-1 touch-pan-y flex-col overflow-x-hidden overflow-y-auto overscroll-y-contain rounded-xl border border-neutral-200 bg-white/95 p-3 shadow-sm dark:border-zinc-800/60 dark:bg-[var(--surface-veil)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-4">
          {children}
        </section>
      </main>
      <BottomNavBar />
    </>
  );
}

export default function LayoutClient({
  children,
  authEnabled = false,
}: {
  children: React.ReactNode;
  authEnabled?: boolean;
}) {
  return (
    <LocaleProvider>
      <LivePollingProvider>
        <div className="flex min-h-screen flex-col bg-gradient-to-b from-white via-neutral-50 to-sky-50/40 text-neutral-900 dark:from-[#030304] dark:via-[#050506] dark:to-[#0a0a0c] dark:text-zinc-100">
          <HeaderWithLocale authEnabled={authEnabled} />
          <NavTickers />
          <MainWithBottomPad>{children}</MainWithBottomPad>
          <OnboardingTutorial />
        </div>
      </LivePollingProvider>
    </LocaleProvider>
  );
}
