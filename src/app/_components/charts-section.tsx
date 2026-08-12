"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { PaceTrendChart } from "~/app/_components/pace-trend-chart";
import { WeeklyMileageChart } from "~/app/_components/weekly-mileage-chart";
import { weeklyMileage, weeklyPace } from "~/lib/charts";
import { formatDuration } from "~/lib/duration";
import { api } from "~/trpc/react";

const DAY_MS = 24 * 60 * 60 * 1000;
const PERIODS = [
  { label: "4W", weeks: 4 },
  { label: "8W", weeks: 8 },
  { label: "12W", weeks: 12 },
] as const;

function startOfWeekMs(date: Date): number {
  const day = date.getDay();
  const sinceMonday = day === 0 ? 6 : day - 1;
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() - sinceMonday,
  ).getTime();
}

/**
 * Interactive charts block: a period selector (4W/8W/12W) drives both the
 * mileage bar chart and the pace line chart over a shared window. Mileage bars
 * are clickable — selecting one shows that week's totals and a "Detail" link to
 * the per-week breakdown page. Fetches its own data via `activities.range`.
 */
export function ChartsSection() {
  const [weeks, setWeeks] = useState<(typeof PERIODS)[number]["weeks"]>(8);
  const [selected, setSelected] = useState<string | null>(null);

  const today = new Date();
  const after = useMemo(
    () => new Date(startOfWeekMs(today) - (weeks - 1) * 7 * DAY_MS),
    // today is stable enough across renders; only re-fetch when the period changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [weeks],
  );

  const { data } = api.activities.range.useQuery({ after });
  const runs = data ?? [];

  const mileage = weeklyMileage(runs, today, weeks);
  const pace = weeklyPace(runs, today, weeks);

  const totalDistance = runs.reduce((sum, r) => sum + r.distance, 0);
  const totalDuration = runs.reduce((sum, r) => sum + r.duration, 0);

  // Selected week totals (distance + duration) from runs in that week.
  let selectedDistance = 0;
  let selectedDuration = 0;
  let selectedLabel = "";
  if (selected) {
    const [ys, ms, ds] = selected.split("-");
    const ws = new Date(Number(ys), Number(ms) - 1, Number(ds));
    const wsMs = new Date(ws.getFullYear(), ws.getMonth(), ws.getDate()).getTime();
    const endMs = wsMs + 7 * DAY_MS;
    selectedLabel = `${ws.getMonth() + 1}/${ws.getDate()}`;
    for (const r of runs) {
      const day = new Date(
        r.runDate.getFullYear(),
        r.runDate.getMonth(),
        r.runDate.getDate(),
      ).getTime();
      if (day >= wsMs && day < endMs) {
        selectedDistance += r.distance;
        selectedDuration += r.duration;
      }
    }
  }

  return (
    <section className="grid w-full max-w-xl gap-3 sm:grid-cols-2">
      <div className="rounded-xl bg-surface p-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xs uppercase tracking-wide text-accent">
            Weekly mileage
          </h2>
          <div className="flex gap-1">
            {PERIODS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => {
                  setWeeks(p.weeks);
                  setSelected(null);
                }}
                className={`rounded px-2 py-0.5 text-[10px] font-semibold transition ${
                  weeks === p.weeks
                    ? "bg-accent text-accent-contrast"
                    : "text-white/50 hover:text-white"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <p className="mb-2 text-xs text-white/50">
          Total: {totalDistance.toFixed(1)} km · {formatDuration(totalDuration)}
        </p>
        <WeeklyMileageChart
          data={mileage}
          selectedWeekStart={selected}
          onSelectWeek={setSelected}
        />
        {selected ? (
          <div className="mt-2 flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-xs">
            <span className="text-white/70">
              Week of {selectedLabel}: {selectedDistance.toFixed(1)} km ·{" "}
              {formatDuration(selectedDuration)}
            </span>
            <Link
              href={`/stats/weeks/${selected}`}
              className="font-semibold text-accent underline hover:opacity-80"
            >
              Detail →
            </Link>
          </div>
        ) : null}
      </div>

      <div className="rounded-xl bg-surface p-4">
        <h2 className="mb-2 text-xs uppercase tracking-wide text-accent">
          Pace trend (min/km)
        </h2>
        <PaceTrendChart data={pace} />
      </div>
    </section>
  );
}
