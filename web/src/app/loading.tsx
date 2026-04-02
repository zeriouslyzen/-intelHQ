/** Shown while the active route segment resolves (faster perceived load than a blank main). */
export default function Loading() {
  return (
    <div className="min-h-[40vh] space-y-3 p-1 sm:p-0" aria-busy aria-label="Loading">
      <div className="h-8 w-2/3 max-w-md animate-pulse rounded-md bg-neutral-200/90 dark:bg-zinc-800/90" />
      <div className="h-32 w-full animate-pulse rounded-xl bg-neutral-200/70 dark:bg-zinc-800/70" />
      <div className="h-48 w-full animate-pulse rounded-xl bg-neutral-200/50 dark:bg-zinc-800/50" />
    </div>
  );
}
