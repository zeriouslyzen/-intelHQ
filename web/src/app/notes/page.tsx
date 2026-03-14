import NotesView from "@/components/NotesView";
import {
  fetchAllRegionalFx,
  fetchCommodities,
} from "@/lib/markets";

export default async function NotesPage() {
  let fx: Awaited<ReturnType<typeof fetchAllRegionalFx>> = [];
  let commodities: Awaited<ReturnType<typeof fetchCommodities>> = [];
  try {
    [fx, commodities] = await Promise.all([
      fetchAllRegionalFx(),
      fetchCommodities(),
    ]);
  } catch {
    // keep empty arrays
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <header className="flex items-center justify-between gap-3 border-b border-neutral-200 pb-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
            Notes
          </p>
          <h1 className="mt-1 text-base font-semibold text-neutral-900">
            Analysis and pinned widgets
          </h1>
        </div>
        <div className="hidden text-[11px] text-neutral-500 sm:block">
          Region widgets and freeform notes.
        </div>
      </header>
      <NotesView fx={fx} commodities={commodities} />
    </div>
  );
}
