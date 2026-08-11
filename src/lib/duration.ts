/**
 * Convert between a duration expressed in minutes (how `Activity.duration` is
 * stored) and the hours/minutes/seconds triple used by the run-entry form.
 * Pure + unit-tested so the form stays thin.
 */

export type DurationParts = {
  hours: number;
  minutes: number;
  seconds: number;
};

export function durationFromParts(
  hours: number,
  minutes: number,
  seconds: number,
): number {
  return hours * 60 + minutes + seconds / 60;
}

export function durationToParts(totalMinutes: number): DurationParts {
  const totalSeconds = Math.round(totalMinutes * 60);
  return {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}
