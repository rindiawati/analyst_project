/**
 * Weekly bucketing for dashboard charts. Week = Monday→Sunday (matches
 * stats.ts). Pure + unit-tested; the SVG chart components consume these.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/** Monday 00:00 (local) of the week containing `date`. */
function startOfWeek(date: Date): Date {
  const day = date.getDay(); // 0 = Sun ... 6 = Sat
  const daysSinceMonday = day === 0 ? 6 : day - 1;
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() - daysSinceMonday,
  );
}

function shortLabel(date: Date): string {
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export type WeekBucket = { weekStart: Date; label: string; distance: number };
export type PaceBucket = { weekStart: Date; label: string; pace: number | null };

/** Total distance per week for the last `weeks` weeks (oldest → newest). */
export function weeklyMileage(
  runs: { distance: number; runDate: Date }[],
  today: Date,
  weeks = 8,
): WeekBucket[] {
  const currentWeek = startOfWeek(today).getTime();
  const buckets: WeekBucket[] = [];

  for (let i = weeks - 1; i >= 0; i--) {
    const start = new Date(currentWeek - i * 7 * DAY_MS);
    const startMs = start.getTime();
    const endMs = startMs + 7 * DAY_MS;

    const distance = runs
      .filter((run) => {
        const day = startOfDay(run.runDate);
        return day >= startMs && day < endMs;
      })
      .reduce((sum, run) => sum + run.distance, 0);

    buckets.push({ weekStart: start, label: shortLabel(start), distance });
  }

  return buckets;
}

/**
 * Time-weighted pace (totalDuration / totalDistance) per week for the last
 * `weeks` weeks. Weeks with no runs are `null` (the chart leaves a gap).
 */
export function weeklyPace(
  runs: { distance: number; duration: number; runDate: Date }[],
  today: Date,
  weeks = 8,
): PaceBucket[] {
  const currentWeek = startOfWeek(today).getTime();
  const buckets: PaceBucket[] = [];

  for (let i = weeks - 1; i >= 0; i--) {
    const start = new Date(currentWeek - i * 7 * DAY_MS);
    const startMs = start.getTime();
    const endMs = startMs + 7 * DAY_MS;

    const inWeek = runs.filter((run) => {
      const day = startOfDay(run.runDate);
      return day >= startMs && day < endMs;
    });

    const totalDistance = inWeek.reduce((s, r) => s + r.distance, 0);
    const totalDuration = inWeek.reduce((s, r) => s + r.duration, 0);

    buckets.push({
      weekStart: start,
      label: shortLabel(start),
      pace: totalDistance > 0 ? totalDuration / totalDistance : null,
    });
  }

  return buckets;
}
