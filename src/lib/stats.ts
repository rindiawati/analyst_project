/**
 * Pure dashboard-stat helpers for a runner's activities. Each takes a minimal
 * structural shape so they're easy to unit-test and reuse. Week boundaries use
 * Monday as the first day (common for fitness). All date math is local (not
 * UTC) so "today" matches what the user sees.
 */

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/** Monday 00:00 (local) of the week containing `date`. */
function startOfWeek(date: Date): number {
  const dayOfWeek = date.getDay(); // 0 = Sun ... 6 = Sat
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() - daysSinceMonday,
  ).getTime();
}

export function totalDistance(runs: { distance: number }[]): number {
  return runs.reduce((sum, run) => sum + run.distance, 0);
}

export function longestRun(runs: { distance: number }[]): number {
  if (runs.length === 0) return 0;
  return runs.reduce((max, run) => (run.distance > max ? run.distance : max), 0);
}

export function distanceThisWeek(
  runs: { distance: number; runDate: Date }[],
  today: Date,
): number {
  const weekStart = startOfWeek(today);
  const weekEnd = weekStart + 7 * ONE_DAY_MS;

  return runs
    .filter((run) => {
      const day = startOfDay(run.runDate);
      return day >= weekStart && day < weekEnd;
    })
    .reduce((sum, run) => sum + run.distance, 0);
}

export function averagePace(runs: { averagePace: number }[]): number {
  if (runs.length === 0) return 0;
  return runs.reduce((sum, run) => sum + run.averagePace, 0) / runs.length;
}

/**
 * Ongoing streak: consecutive days with a run, counting back from today — but
 * if today has no run yet, yesterday still counts so the streak isn't shown as
 * broken mid-day. Returns 0 once a full day is missed.
 */
export function currentStreak(
  runs: { runDate: Date }[],
  today: Date,
): number {
  const todayTime = startOfDay(today);
  const days = new Set<number>();

  for (const run of runs) {
    const day = startOfDay(run.runDate);
    if (day <= todayTime) days.add(day); // ignore future runs
  }

  let cursor: number;
  if (days.has(todayTime)) {
    cursor = todayTime;
  } else if (days.has(todayTime - ONE_DAY_MS)) {
    cursor = todayTime - ONE_DAY_MS; // streak still alive, today not done yet
  } else {
    return 0;
  }

  let streak = 0;
  while (days.has(cursor)) {
    streak += 1;
    cursor -= ONE_DAY_MS;
  }

  return streak;
}
