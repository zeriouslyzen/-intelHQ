/**
 * Site mark: quiet SVG + `/katanx` (all lowercase). Slash echoes the wordmark; amber accent only.
 */
export default function KatanWordmark({
  className = "",
}: {
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        viewBox="0 0 26 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-[1.35rem] shrink-0 text-sky-400/90 dark:text-sky-300/90 sm:h-6 sm:w-6"
        aria-hidden
      >
        {/* Soft parallel hint — no cross, no grid */}
        <path
          d="M7 19.5 L18.5 7"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.22"
        />
        <path
          d="M6.5 18.5 L18 6"
          stroke="currentColor"
          strokeWidth="1.35"
          strokeLinecap="round"
        />
        <circle
          cx="18"
          cy="6"
          r="1.65"
          className="fill-amber-400/95 dark:fill-amber-300/95"
        />
      </svg>
      <span className="inline-flex items-baseline font-board text-lg font-semibold normal-case tracking-[0.04em] sm:text-xl">
        <span className="text-sky-300 dark:text-sky-200">/</span>
        <span className="text-neutral-900 dark:text-zinc-50">katan</span>
        <span className="text-amber-400 dark:text-amber-300">x</span>
      </span>
    </span>
  );
}
