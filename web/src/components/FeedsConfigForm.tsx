"use client";

import type { FeedsConfig } from "@/lib/feedsConfig";
import type { FeedDef } from "@/lib/feedsConfig";
import { useState } from "react";

interface FeedsConfigFormProps {
  initialConfig: FeedsConfig;
  availableFeeds: FeedDef[];
}

export default function FeedsConfigForm({
  initialConfig,
  availableFeeds,
}: FeedsConfigFormProps) {
  const [config, setConfig] = useState<FeedsConfig>(initialConfig);
  const [videoUrl, setVideoUrl] = useState(initialConfig.videoEmbedUrl ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<"saved" | "error" | null>(null);

  const toggleFeed = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      enabledFeedIds: prev.enabledFeedIds.includes(id)
        ? prev.enabledFeedIds.filter((x) => x !== id)
        : [...prev.enabledFeedIds, id],
    }));
  };

  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/config/feeds", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabledFeedIds: config.enabledFeedIds,
          videoEmbedUrl: videoUrl.trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      setMessage("saved");
      setTimeout(() => setMessage(null), 3000);
    } catch {
      setMessage("error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
          Conflict / wartime sources
        </p>
        <p className="mt-1 text-sm text-neutral-600">
          Enable or disable feeds used for Wartime and Events. Data is fetched
          according to this selection.
        </p>
      </div>
      <ul className="space-y-2">
        {availableFeeds.map((feed) => (
          <li
            key={feed.id}
            className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50/80 px-3 py-2"
          >
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={config.enabledFeedIds.includes(feed.id)}
                onChange={() => toggleFeed(feed.id)}
                className="h-4 w-4 rounded border-neutral-300"
              />
              <span className="font-medium text-neutral-900">{feed.name}</span>
              {feed.region && (
                <span className="text-[11px] text-neutral-500">
                  {feed.region}
                </span>
              )}
            </label>
            <span className="text-[10px] uppercase tracking-wider text-neutral-400">
              {feed.attribution}
            </span>
          </li>
        ))}
      </ul>
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
          Today page video embed URL
        </label>
        <p className="mt-0.5 text-xs text-neutral-500">
          Optional. If set, this URL is shown in the video module on the Today
          page (e.g. livestream iframe).
        </p>
        <input
          type="url"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="https://..."
          className="mt-2 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400"
        />
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-100 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        {message === "saved" && (
          <span className="text-sm text-emerald-600">Saved.</span>
        )}
        {message === "error" && (
          <span className="text-sm text-red-600">Save failed.</span>
        )}
      </div>
    </div>
  );
}
