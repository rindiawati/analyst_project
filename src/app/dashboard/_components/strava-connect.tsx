"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { api } from "~/trpc/react";

/**
 * Strava connection entry point on the dashboard. When not connected, shows a
 * link to /api/strava/connect (full-page OAuth redirect). When connected,
 * shows a one-shot "Sync now" that pulls recent runs via the `strava.sync`
 * mutation, then refreshes the dashboard server component.
 */
export function StravaConnect({
  connected,
  athleteId,
}: {
  connected: boolean;
  athleteId: number | null;
}) {
  const router = useRouter();
  const [error, setError] = useState("");

  const sync = api.strava.sync.useMutation({
    onSuccess: () => {
      setError("");
      router.refresh();
    },
    onError: (err) => setError(err.message),
  });

  if (!connected) {
    return (
      <a
        href="/api/strava/connect"
        className="rounded-full border border-white/20 px-4 py-1.5 text-sm font-semibold text-white/80 transition hover:border-accent hover:text-accent"
      >
        Connect Strava
      </a>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-3 text-sm">
        <span className="text-white/50">
          Strava{athleteId ? ` · athlete ${athleteId}` : null}
        </span>
        <button
          type="button"
          onClick={() => sync.mutate()}
          disabled={sync.isPending}
          className="rounded-full border border-white/20 px-4 py-1.5 font-semibold text-white/80 transition hover:border-accent hover:text-accent disabled:opacity-50"
        >
          {sync.isPending ? "Syncing…" : "Sync now"}
        </button>
      </div>
      {error ? (
        <span className="text-xs text-red-300">{error}</span>
      ) : sync.data ? (
        <span className="text-xs text-white/50">
          Imported {sync.data.imported} · skipped {sync.data.skipped} duplicate(s)
        </span>
      ) : null}
    </div>
  );
}
