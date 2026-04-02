import { fetchConflictUpdates } from "@/lib/conflict";
import { getDefaultFeedsConfig, getFeedsConfig } from "@/lib/configDb";
import { fetchGlobalNews } from "@/lib/news";
import EventsView from "@/components/EventsView";

export default async function EventsPage() {
  let news: Awaited<ReturnType<typeof fetchGlobalNews>> = [];
  let conflict: Awaited<ReturnType<typeof fetchConflictUpdates>> = [];
  try {
    const config = await getFeedsConfig();
    [news, conflict] = await Promise.all([
      fetchGlobalNews(),
      fetchConflictUpdates(config),
    ]);
  } catch {
    try {
      [news, conflict] = await Promise.all([
        fetchGlobalNews(),
        fetchConflictUpdates(getDefaultFeedsConfig()),
      ]);
    } catch {
      news = [];
      conflict = [];
    }
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <header className="flex items-center justify-between gap-3 border-b border-neutral-200 pb-3 dark:border-zinc-800">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500 dark:text-zinc-500">
            Events
          </p>
          <h1 className="mt-1 text-base font-semibold text-neutral-900 dark:text-zinc-50">
            Global timeline
          </h1>
        </div>
        <div className="hidden text-[11px] text-neutral-500 dark:text-zinc-400 sm:block">
          Wire and official sources. Conflict feed: NATO/military close to source.
        </div>
      </header>
      <EventsView news={news} conflict={conflict} />
    </div>
  );
}

