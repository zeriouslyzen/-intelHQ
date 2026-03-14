import { fetchConflictUpdates } from "@/lib/conflict";
import { getDefaultFeedsConfig, getFeedsConfig } from "@/lib/configDb";
import WartimeView from "@/components/WartimeView";

export const dynamic = "force-dynamic";

export default async function WartimePage() {
  let conflict: Awaited<ReturnType<typeof fetchConflictUpdates>> = [];
  try {
    const config = await getFeedsConfig();
    conflict = await fetchConflictUpdates(config);
  } catch {
    try {
      conflict = await fetchConflictUpdates(getDefaultFeedsConfig());
    } catch {
      conflict = [];
    }
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <header className="flex items-center justify-between gap-3 border-b border-neutral-200 pb-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
            Wartime
          </p>
          <h1 className="mt-1 text-base font-semibold text-neutral-900">
            Conflict and military updates
          </h1>
        </div>
        <div className="hidden text-[11px] text-neutral-500 sm:block">
          Wire and official sources. Missiles, facilities, strikes, ground.
        </div>
      </header>
      <WartimeView conflict={conflict} />
    </div>
  );
}
