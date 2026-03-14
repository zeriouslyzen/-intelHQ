import type { Metadata } from "next";
import Link from "next/link";
import AiAssistPanel from "@/components/AiAssistPanel";
import NavTickers from "@/components/NavTickers";
import "./globals.css";

export const metadata: Metadata = {
  title: "World Signals",
  description:
    "Mobile-first tactical dashboard for global markets, FX, macro news, maps, and discussion.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-50 text-neutral-900 antialiased">
        <div className="flex min-h-screen flex-col bg-gradient-to-b from-white via-neutral-50 to-sky-50/40 text-neutral-900">
          <header className="border-b border-neutral-200 bg-white/90 px-4 py-3 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
              <Link href="/" className="flex items-center gap-2 hover:opacity-90">
                <div className="h-6 w-6 rounded-sm border border-amber-400/70 bg-gradient-to-br from-amber-300 to-yellow-400 shadow-[0_0_18px_rgba(251,191,36,0.6)]" />
                <div className="leading-tight">
                  <div className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                    Global Ops
                  </div>
                  <div className="text-sm font-semibold text-neutral-900">
                    World Signals
                  </div>
                </div>
              </Link>
              <div className="hidden items-center gap-3 text-xs text-neutral-500 sm:flex">
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/80 bg-emerald-50 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.16em] text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                  Live Feed
                </span>
              </div>
            </div>
          </header>
          <NavTickers />
          <main className="mx-auto flex w-full max-w-6xl flex-1 gap-4 px-3 py-4 sm:px-4">
            <div className="hidden w-56 shrink-0 flex-col gap-2 sm:flex">
              <nav className="space-y-1 rounded-xl border border-neutral-200 bg-white/90 p-2 text-sm shadow-sm">
                <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
                  Console
                </div>
                <Link
                  href="/"
                  className="flex items-center justify-between rounded-lg bg-amber-50 px-2.5 py-1.5 text-neutral-900 hover:bg-amber-100"
                >
                  <span>Today</span>
                  <span className="text-[10px] text-amber-600">/</span>
                </Link>
                <Link
                  href="/markets"
                  className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-neutral-700 hover:bg-sky-50"
                >
                  <span>Markets</span>
                  <span className="text-[10px] text-neutral-400">/markets</span>
                </Link>
                <Link
                  href="/map"
                  className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-neutral-700 hover:bg-sky-50"
                >
                  <span>Map</span>
                  <span className="text-[10px] text-neutral-400">/map</span>
                </Link>
                <Link
                  href="/events"
                  className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-neutral-700 hover:bg-sky-50"
                >
                  <span>Events</span>
                  <span className="text-[10px] text-neutral-400">/events</span>
                </Link>
                <Link
                  href="/wartime"
                  className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-neutral-700 hover:bg-sky-50"
                >
                  <span>Wartime</span>
                  <span className="text-[10px] text-neutral-400">/wartime</span>
                </Link>
                <Link
                  href="/alerts"
                  className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-neutral-700 hover:bg-sky-50"
                >
                  <span>EMS & Radio</span>
                  <span className="text-[10px] text-neutral-400">/alerts</span>
                </Link>
                <Link
                  href="/chat"
                  className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-neutral-700 hover:bg-sky-50"
                >
                  <span>Chat</span>
                  <span className="text-[10px] text-neutral-400">/chat</span>
                </Link>
                <Link
                  href="/notes"
                  className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-neutral-700 hover:bg-sky-50"
                >
                  <span>Notes</span>
                  <span className="text-[10px] text-neutral-400">/notes</span>
                </Link>
                <Link
                  href="/settings/feeds"
                  className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-neutral-700 hover:bg-sky-50"
                >
                  <span>Feeds</span>
                  <span className="text-[10px] text-neutral-400">/settings/feeds</span>
                </Link>
              </nav>
            </div>
            <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto rounded-xl border border-neutral-200 bg-white/95 p-3 shadow-sm sm:p-4">
              {children}
            </section>
          </main>
          <footer className="border-t border-neutral-200 bg-white/95 px-4 py-2 sm:hidden">
            <nav className="mx-auto flex max-w-md items-center justify-between text-[11px] font-medium text-neutral-500">
              <Link href="/" className="flex flex-1 flex-col items-center gap-0.5">
                <span className="h-1 w-6 rounded-full bg-amber-400" />
                <span>Today</span>
              </Link>
              <Link href="/markets" className="flex flex-1 flex-col items-center gap-0.5">
                <span className="h-1 w-6 rounded-full bg-neutral-300" />
                <span>Markets</span>
              </Link>
              <Link href="/map" className="flex flex-1 flex-col items-center gap-0.5">
                <span className="h-1 w-6 rounded-full bg-neutral-300" />
                <span>Map</span>
              </Link>
              <Link href="/events" className="flex flex-1 flex-col items-center gap-0.5">
                <span className="h-1 w-6 rounded-full bg-neutral-300" />
                <span>Events</span>
              </Link>
              <Link href="/wartime" className="flex flex-1 flex-col items-center gap-0.5">
                <span className="h-1 w-6 rounded-full bg-neutral-300" />
                <span>Wartime</span>
              </Link>
              <Link href="/alerts" className="flex flex-1 flex-col items-center gap-0.5">
                <span className="h-1 w-6 rounded-full bg-neutral-300" />
                <span>Alerts</span>
              </Link>
              <Link href="/chat" className="flex flex-1 flex-col items-center gap-0.5">
                <span className="h-1 w-6 rounded-full bg-neutral-300" />
                <span>Chat</span>
              </Link>
              <Link href="/notes" className="flex flex-1 flex-col items-center gap-0.5">
                <span className="h-1 w-6 rounded-full bg-neutral-300" />
                <span>Notes</span>
              </Link>
            </nav>
          </footer>
          <AiAssistPanel />
        </div>
      </body>
    </html>
  );
}

