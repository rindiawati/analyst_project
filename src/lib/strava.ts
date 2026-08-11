/**
 * Pure helpers for turning Strava's activity objects into our `Activity`
 * shape. Kept separate from the HTTP layer so they're trivially unit-testable.
 *
 * Strava gives: distance in metres, moving_time in seconds, start_date_local
 * (ISO). We store: distance in km, duration in minutes, averagePace in min/km
 * (duration / distance — same convention as manual entry).
 */

export type StravaActivity = {
  id: number;
  type: string;
  distance: number; // metres
  moving_time: number; // seconds
  start_date_local?: string;
  start_date: string;
};

export type MappedRun = {
  distance: number; // km
  duration: number; // minutes
  runDate: Date;
  averagePace: number; // min/km
  stravaId: string;
};

export function isRunActivity(activity: { type: string }): boolean {
  return activity.type === "Run" || activity.type === "VirtualRun";
}

export function mapStravaActivity(activity: StravaActivity): MappedRun {
  const distance = activity.distance / 1000;
  const duration = activity.moving_time / 60;
  const runDate = new Date(activity.start_date_local ?? activity.start_date);
  const averagePace = distance > 0 ? duration / distance : 0;

  return {
    distance,
    duration,
    runDate,
    averagePace,
    stravaId: String(activity.id),
  };
}
