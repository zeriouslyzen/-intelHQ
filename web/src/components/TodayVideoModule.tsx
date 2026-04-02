import Link from "next/link";

interface TodayVideoModuleProps {
  videoEmbedUrl?: string | null;
  className?: string;
}

export default function TodayVideoModule({
  videoEmbedUrl,
  className = "",
}: TodayVideoModuleProps) {
  const url = videoEmbedUrl?.trim();
  const hasUrl = Boolean(url);

  return (
    <div
      className={`min-w-0 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-900 ${className}`}
    >
      <div className="flex items-center justify-between border-b border-neutral-700 px-3 py-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
          Live / headline video
        </span>
        {!hasUrl && (
          <Link
            href="/settings/feeds"
            className="text-[11px] text-amber-500 hover:text-amber-400"
          >
            Set embed URL
          </Link>
        )}
      </div>
      <div className="relative aspect-video w-full bg-black">
        {hasUrl ? (
          <>
            <iframe
              src={url!}
              title="Headline video"
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            <a
              href={url!}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-2 left-2 rounded bg-black/70 px-2 py-1 text-[10px] font-medium text-amber-400 hover:bg-black/80 hover:text-amber-300"
              title="Open in new window to watch while using the app"
            >
              Pop out
            </a>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-neutral-500">
            <span className="text-sm">No video URL configured</span>
            <Link
              href="/settings/feeds"
              className="text-xs text-amber-500 hover:text-amber-400"
            >
              Add in Settings → Feeds
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
