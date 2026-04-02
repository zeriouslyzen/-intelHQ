"use client";

import AimExperience from "@/components/AimExperience";

export default function ChatClient({ authEnabled }: { authEnabled: boolean }) {
  if (!authEnabled) {
    return (
      <div className="flex min-h-[12rem] flex-col items-center justify-center gap-2 px-4 text-center text-sm text-neutral-600 dark:text-zinc-400">
        <p className="font-medium text-neutral-800 dark:text-zinc-200">Chat is not enabled</p>
        <p className="max-w-sm text-xs leading-relaxed">
          Accounts and sign-in are turned off for this deployment. The rest of the dashboard works without logging in.
        </p>
      </div>
    );
  }
  return <AimExperience />;
}
