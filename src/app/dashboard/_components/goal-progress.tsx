"use client";

import Link from "next/link";
import { useState } from "react";

import { api } from "~/trpc/react";

/**
 * Weekly distance goal. Two modes:
 * - editable (Profile): an input + Save to set/change the target.
 * - read-only (Dashboard): a progress bar of this week's km vs the target,
 *   or a "Set a weekly goal" link to /profile when no target exists.
 */
export function GoalProgress({
  current,
  target,
  editable = false,
}: {
  current?: number;
  target: number | null;
  editable?: boolean;
}) {
  const utils = api.useUtils();
  const [value, setValue] = useState(target ? String(target) : "");
  const save = api.goals.setTarget.useMutation({
    onSuccess: async () => {
      await utils.goals.get.invalidate();
    },
  });

  if (editable) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="1"
            step="0.5"
            inputMode="decimal"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="e.g. 25"
            className="w-24 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
          <span className="text-sm text-white/50">km / week</span>
          <button
            type="button"
            disabled={save.isPending}
            onClick={() => {
              const n = Number(value);
              if (n > 0) save.mutate({ targetDistance: n });
            }}
            className="ml-auto rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-contrast transition hover:bg-accent/90 disabled:opacity-50"
          >
            {save.isPending ? "Saving…" : "Save"}
          </button>
        </div>
        {save.isSuccess ? (
          <span className="text-xs text-white/40">Goal saved.</span>
        ) : null}
      </div>
    );
  }

  if (!target) {
    return (
      <Link
        href="/profile"
        className="text-sm text-accent underline hover:opacity-80"
      >
        Set a weekly goal →
      </Link>
    );
  }

  const pct = Math.min(100, ((current ?? 0) / target) * 100);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-sm">
        <span className="text-white/60">Weekly goal</span>
        <span className="text-white/80">
          {(current ?? 0).toFixed(1)} / {target.toFixed(0)} km
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-accent"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
