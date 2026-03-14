"use client";

import { useEffect, useState } from "react";
import RegionDashboard from "@/components/RegionDashboard";
import { REGIONS, type RegionCode } from "@/lib/regions";
import type { CommodityQuote, Quote } from "@/lib/markets";

interface NotesViewProps {
  fx: Quote[];
  commodities: CommodityQuote[];
}

type NoteRecord = {
  id: string;
  body: string;
  regionCode: string | null;
  instrumentId: string | null;
  createdAt: string;
  updatedAt: string;
};

const DEFAULT_LAYOUT: { regionCode: RegionCode }[] = [
  { regionCode: "CHN" },
  { regionCode: "MENA" },
];

export default function NotesView({ fx, commodities }: NotesViewProps) {
  const [notes, setNotes] = useState<NoteRecord[]>([]);
  const [newBody, setNewBody] = useState("");
  const [pinnedRegion, setPinnedRegion] = useState<RegionCode | null>("CHN");

  useEffect(() => {
    fetch("/api/notes")
      .then((r) => r.json())
      .then(setNotes)
      .catch(() => setNotes([]));
  }, []);

  const addNote = () => {
    if (!newBody.trim()) return;
    fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        body: newBody.trim(),
        regionCode: pinnedRegion,
      }),
    })
      .then((r) => r.json().then((data) => ({ ok: r.ok, data })))
      .then(({ ok, data }) => {
        if (ok && data && typeof data.id === "string") {
          setNotes((prev) => [data as NoteRecord, ...prev]);
          setNewBody("");
        }
      })
      .catch(() => {});
  };

  return (
    <div className="grid flex-1 gap-3 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1.8fr)]">
      <section className="flex min-h-0 flex-col gap-3">
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
            Pinned widgets
          </div>
          <p className="mt-1 text-xs text-neutral-600">
            Pin region dashboards for quick monitoring.
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {REGIONS.map((r) => (
              <button
                key={r.code}
                type="button"
                onClick={() => setPinnedRegion(r.code)}
                className={
                  "rounded border px-2 py-1 text-[11px] font-medium " +
                  (pinnedRegion === r.code
                    ? "border-amber-400 bg-amber-50 text-amber-800"
                    : "border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100")
                }
              >
                {r.code}
              </button>
            ))}
          </div>
          <div className="mt-3">
            <RegionDashboard
              regionCode={pinnedRegion}
              fx={fx}
              commodities={commodities}
            />
          </div>
        </div>
        {DEFAULT_LAYOUT.map((s) => (
          <div key={s.regionCode} className="rounded-xl border border-neutral-200 bg-white p-4">
            <RegionDashboard
              regionCode={s.regionCode}
              fx={fx}
              commodities={commodities}
            />
          </div>
        ))}
      </section>
      <section className="flex min-h-0 flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-4">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
          Notes
        </div>
        <div className="flex flex-col gap-2">
          <textarea
            value={newBody}
            onChange={(e) => setNewBody(e.target.value)}
            placeholder="Add a note (optionally pin to region above)..."
            className="min-h-[80px] w-full rounded border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-800 placeholder:text-neutral-400"
            rows={3}
          />
          <button
            type="button"
            onClick={addNote}
            className="rounded border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-100"
          >
            Save note
          </button>
        </div>
        <ul className="mt-2 flex-1 space-y-2 overflow-auto">
          {notes.map((n) => (
            <li
              key={n.id}
              className="rounded border border-neutral-100 bg-neutral-50 px-3 py-2 text-xs text-neutral-800"
            >
              <p className="whitespace-pre-wrap">{n.body}</p>
              <div className="mt-1 text-[11px] text-neutral-500">
                {n.regionCode && <span>Region: {n.regionCode}</span>}
                <span className="ml-2">
                  {new Date(n.updatedAt).toLocaleString()}
                </span>
              </div>
            </li>
          ))}
          {notes.length === 0 && (
            <li className="py-4 text-center text-[11px] text-neutral-400">
              No notes yet.
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}
