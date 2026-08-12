import { notFound } from "next/navigation";

import { AppHeader } from "~/app/_components/app-header";
import { BottomNav } from "~/app/_components/bottom-nav";
import { formatDuration } from "~/lib/duration";
import { formatPace } from "~/lib/pace";
import { api } from "~/trpc/server";

const DAY_MS = 24 * 60 * 60 * 1000;

const rangeFmt = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });
const dayFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

/** Normalize any date to its Monday (local). */
function mondayOf(date: Date): Date {
  const day = date.getDay();
  const sinceMonday = day === 0 ? 6 : day - 1;
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() - sinceMonday,
  );
}

export default async function WeekDetailPage({
  params,
}: {
  params: Promise<{ start: string }>;
}) {
  const { start } = await params;
  const parts = start.split("-").map(Number);
  const [y, m, d] = parts;
  if (!y || !m || !d) notFound();

  const parsed = new Date(y, m - 1, d);
  if (Number.isNaN(parsed.getTime())) notFound();

  const weekStart = mondayOf(parsed);
  const weekEnd = new Date(weekStart.getTime() + 7 * DAY_MS);
  const sunday = new Date(weekEnd.getTime() - DAY_MS);

  const runs = await api.activities.range({
    after: weekStart,
    before: weekEnd,
  });

  const totalDistance = runs.reduce((s, r) => s + r.distance, 0);
  const totalDuration = runs.reduce((s, r) => s + r.duration, 0);
  const avgPace = totalDistance > 0 ? totalDuration / totalDistance : 0;

  return (
    <main className="flex min-h-screen flex-col bg-base text-white">
      <AppHeader email={null} backHref="/dashboard" />
      <div className="flex flex-1 flex-col gap-6 px-4 pb-24">
        <div>
          <p className="text-xs uppercase tracking-wide text-accent">
            Week detail
          </p>
          <h1 className="text-2xl font-extrabold">
            {rangeFmt.format(weekStart)} – {rangeFmt.format(sunday)}
          </h1>
        </div>

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Distance" value={`${totalDistance.toFixed(1)} km`} />
          <Stat label="Time" value={formatDuration(totalDuration)} />
          <Stat label="Avg pace" value={`${formatPace(avgPace)} /km`} />
          <Stat label="Runs" value={String(runs.length)} />
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Runs</h2>
          {runs.length === 0 ? (
            <p className="text-sm text-white/50">No runs this week.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {runs.map((run) => (
                <li
                  key={run.id}
                  className="flex items-center justify-between rounded-xl bg-surface px-5 py-4"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-white">
                      {run.distance.toFixed(2)} km
                    </span>
                    <span className="text-xs text-white/50">
                      {dayFmt.format(run.runDate)}
                    </span>
                  </div>
                  <div className="flex gap-4 text-sm text-white/70">
                    <span>{formatDuration(run.duration)}</span>
                    <span>{formatPace(run.averagePace)} /km</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
      <BottomNav />
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl bg-surface px-4 py-3">
      <span className="text-xs uppercase tracking-wide text-accent">
        {label}
      </span>
      <span className="text-xl font-bold text-white">{value}</span>
    </div>
  );
}
