import { fetchAllAlerts } from "@/lib/alerts";
import { fetchRadioStations } from "@/lib/radio";
import AlertsRadioView from "@/components/AlertsRadioView";

export const dynamic = "force-dynamic";

export default async function AlertsPage() {
  const [alerts, radio] = await Promise.all([
    fetchAllAlerts(),
    fetchRadioStations(),
  ]);

  return (
    <div className="flex h-full flex-col gap-4">
      <header className="flex items-center justify-between gap-3 border-b border-neutral-200 pb-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
            EMS & Radio
          </p>
          <h1 className="mt-1 text-base font-semibold text-neutral-900">
            Alerts and live radio
          </h1>
        </div>
        <div className="hidden text-[11px] text-neutral-500 sm:block">
          International and national disaster alerts; news and talk radio streams. Updates and log by source.
        </div>
      </header>
      <AlertsRadioView alerts={alerts} radio={radio} />
    </div>
  );
}
