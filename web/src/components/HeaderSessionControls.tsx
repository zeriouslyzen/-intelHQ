"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export default function HeaderSessionControls() {
  const { data: session, status } = useSession();

  if (status === "authenticated" && session?.user) {
    return (
      <span className="flex items-center gap-2">
        <span className="hidden text-xs text-neutral-600 dark:text-zinc-400 sm:inline">
          {session.user.name ?? session.user.email}
        </span>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="rounded border border-neutral-200 bg-white px-2 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Sign out
        </button>
      </span>
    );
  }

  if (status === "unauthenticated") {
    return (
      <Link
        href="/signin"
        className="rounded border border-amber-400/60 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-900 hover:bg-amber-100 dark:border-amber-500/40 dark:bg-amber-950/50 dark:text-amber-100 dark:hover:bg-amber-950/80"
      >
        Sign in
      </Link>
    );
  }

  return null;
}
