"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { LocaleProvider } from "@/contexts/LocaleContext";
import { LivePollingProvider } from "@/contexts/LivePollingContext";
import BottomNavBar from "@/components/BottomNavBar";
import KatanWordmark from "@/components/KatanWordmark";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import LiveFeedToggle from "@/components/LiveFeedToggle";
import NavTickers from "@/components/NavTickers";
import OnboardingTutorial from "@/components/OnboardingTutorial";
import ThemeToggle from "@/components/ThemeToggle";

function HeaderWithLocale() {
  const { data: session, status } = useSession();
  return (
    <header className="border-b border-neutral-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-zinc-800/80 dark:bg-zinc-950/85">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <Link
          href="/"
          className="rounded-sm hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40"
          aria-label="/katanx"
        >
          <KatanWordmark />
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          {status === "authenticated" && session?.user ? (
            <span className="flex items-center gap-2">
              <span className="hidden text-xs text-neutral-600 dark:text-zinc-400 sm:inline">
                {session.user.name ?? session.user.email}
              </span>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded border border-neutral-200 bg-white px-2 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Sign out
              </button>
            </span>
          ) : status === "unauthenticated" ? (
            <Link
              href="/signin"
              className="rounded border border-amber-400/60 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-900 hover:bg-amber-100 dark:border-amber-500/40 dark:bg-amber-950/50 dark:text-amber-100 dark:hover:bg-amber-950/80"
            >
              Sign in
            </Link>
          ) : null}
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
        <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto rounded-xl border border-neutral-200 bg-white/95 p-3 shadow-sm dark:border-zinc-800/60 dark:bg-[var(--surface-veil)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-4">
          {children}
        </section>
      </main>
      <BottomNavBar />
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
      <LivePollingProvider>
        <div className="flex min-h-screen flex-col bg-gradient-to-b from-white via-neutral-50 to-sky-50/40 text-neutral-900 dark:from-[#030304] dark:via-[#050506] dark:to-[#0a0a0c] dark:text-zinc-100">
          <HeaderWithLocale />
          <NavTickers />
          <MainWithBottomPad>{children}</MainWithBottomPad>
          <OnboardingTutorial />
        </div>
      </LivePollingProvider>
    </LocaleProvider>
  );
}
