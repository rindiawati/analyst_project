"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { WeeklyMileageChart } from "~/app/_components/weekly-mileage-chart";
import { weeklyMileage } from "~/lib/charts";
import { formatDuration } from "~/lib/duration";
import { formatPace } from "~/lib/pace";
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
 * Dominant weekly-mileage chart with a period selector (4W/8W/12W), a calendar
 * "from" date to scroll back in time, window totals, and clickable bars that
 * drill into a per-week detail page. Pace trend was removed per request.
 */
export function ChartsSection() {
  const [weeks, setWeeks] = useState<(typeof PERIODS)[number]["weeks"]>(8);
  const [fromDate, setFromDate] = useState<string>("");
  const [selected, setSelected] = useState<string | null>(null);

  const { windowStart, windowEnd, referenceDate } = useMemo(() => {
    if (fromDate) {
      const [ys, ms, ds] = fromDate.split("-");
      const from = new Date(Number(ys), Number(ms) - 1, Number(ds));
      const ws = startOfWeekMs(from);
      return {
        windowStart: ws,
        windowEnd: ws + weeks * 7 * DAY_MS,
        referenceDate: new Date(ws + (weeks * 7 - 1) * DAY_MS),
      };
    }
    const today = new Date();
    const currentWeek = startOfWeekMs(today);
    return {
      windowStart: currentWeek - (weeks - 1) * 7 * DAY_MS,
      windowEnd: currentWeek + 7 * DAY_MS,
      referenceDate: today,
    };
  }, [weeks, fromDate]);

  const { data } = api.activities.range.useQuery({
    after: new Date(windowStart),
  });
  const runs = data ?? [];

  const mileage = weeklyMileage(runs, referenceDate, weeks);

  const windowRuns = runs.filter((r) => {
    const day = new Date(
      r.runDate.getFullYear(),
      r.runDate.getMonth(),
      r.runDate.getDate(),
    ).getTime();
    return day >= windowStart && day < windowEnd;
  });
  const totalDistance = windowRuns.reduce((s, r) => s + r.distance, 0);
  const totalDuration = windowRuns.reduce((s, r) => s + r.duration, 0);

  // Selected-week totals.
  let selectedDistance = 0;
  let selectedDuration = 0;
  let selectedPace = 0;
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
    selectedPace = selectedDistance > 0 ? selectedDuration / selectedDistance : 0;
  }

  return (
    <section className="w-full max-w-xl rounded-xl bg-surface p-4">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xs uppercase tracking-wide text-accent">
          Weekly mileage
        </h2>
        <div className="flex items-center gap-2">
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
          <input
            type="date"
            aria-label="From date"
            value={fromDate}
            onChange={(e) => {
              setFromDate(e.target.value);
              setSelected(null);
            }}
            className="rounded border border-white/20 bg-white/10 px-2 py-0.5 text-[10px] text-white focus:outline-none focus:ring-1 focus:ring-accent/50"
          />
          {fromDate ? (
            <button
              type="button"
              onClick={() => {
                setFromDate("");
                setSelected(null);
              }}
              className="text-[10px] text-white/40 hover:text-white"
            >
              ✕
            </button>
          ) : null}
        </div>
      </div>

      <p className="mb-2 text-xs text-white/50">
        Total: {totalDistance.toFixed(1)} km · {formatDuration(totalDuration)}
      </p>

      <WeeklyMileageChart
        data={mileage}
        height={170}
        selectedWeekStart={selected}
        onSelectWeek={setSelected}
      />

      {selected ? (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white/5 px-3 py-2 text-xs">
          <span className="text-white/70">
            Week of {selectedLabel}: {selectedDistance.toFixed(1)} km ·{" "}
            {formatDuration(selectedDuration)} · {formatPace(selectedPace)} /km
          </span>
          <Link
            href={`/weeks/${selected}`}
            className="font-semibold text-accent underline hover:opacity-80"
          >
            Detail →
          </Link>
        </div>
      ) : null}
    </section>
  );
}
