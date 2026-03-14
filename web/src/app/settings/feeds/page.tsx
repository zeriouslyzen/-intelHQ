import FeedsConfigForm from "@/components/FeedsConfigForm";
import { CONFLICT_FEED_REGISTRY } from "@/lib/feedsConfig";
import { getFeedsConfig } from "@/lib/configDb";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function FeedsSettingsPage() {
  const config = await getFeedsConfig();
  return (
    <div className="flex h-full flex-col gap-4">
      <header className="flex items-center justify-between gap-3 border-b border-neutral-200 pb-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
            Settings
          </p>
          <h1 className="mt-1 text-base font-semibold text-neutral-900">
            Feeds &amp; data sources
          </h1>
        </div>
        <Link
          href="/wartime"
          className="text-xs font-medium text-neutral-500 hover:text-neutral-700"
        >
          Back to Wartime
        </Link>
      </header>
      <FeedsConfigForm
        initialConfig={config}
        availableFeeds={CONFLICT_FEED_REGISTRY}
      />
    </div>
  );
}
