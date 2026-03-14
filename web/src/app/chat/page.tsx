"use client";

export default function ChatPage() {
  return (
    <div className="flex h-full flex-col gap-4">
      <header className="flex items-center justify-between gap-3 border-b border-neutral-200 pb-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
            Chat
          </p>
          <h1 className="mt-1 text-base font-semibold text-neutral-900">
            Discussion console
          </h1>
        </div>
        <div className="hidden text-[11px] text-neutral-500 sm:block">
          Global, instrument, region, and event threads (WebSocket later).
        </div>
      </header>
      <div className="grid flex-1 gap-3 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1.6fr)]">
        <section className="flex min-h-0 flex-col rounded-xl border border-neutral-200 bg-white p-4">
          <div className="flex items-center justify-between gap-3 text-xs text-neutral-500">
            <div className="flex gap-2 text-[11px]">
              <span>Global</span>
              <span>By Instrument</span>
              <span>By Region</span>
              <span>Events</span>
            </div>
          </div>
          <div className="mt-3 flex-1 rounded-lg border border-dashed border-neutral-200 bg-neutral-50 p-4 text-xs text-neutral-500">
            Channel list placeholder. Each row will link to a thread and show
            basic metadata such as volume and recency.
          </div>
        </section>
        <section className="flex min-h-0 flex-col rounded-xl border border-neutral-200 bg-white">
          <div className="border-b border-neutral-200 px-4 py-3 text-xs text-neutral-700">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Active thread
            </div>
            <p className="mt-1">
              Messages and AI summaries for the selected channel will appear
              here.
            </p>
          </div>
          <div className="flex flex-1 flex-col justify-between">
            <div className="flex-1 px-4 py-3 text-xs text-neutral-500">
              Timeline of messages placeholder.
            </div>
            <form className="border-t border-neutral-200 px-3 py-2" onSubmit={(e) => e.preventDefault()} action="#">
              <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs text-neutral-700">
                <input
                  type="text"
                  placeholder="Type to comment (wire-up to WebSocket later)..."
                  className="flex-1 bg-transparent text-xs text-neutral-900 outline-none placeholder:text-neutral-400"
                />
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}

