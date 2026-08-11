/**
 * Format a pace given in decimal minutes-per-km as a runner-friendly M:SS
 * string. Canonical method: convert to seconds-per-km (total seconds /
 * distance) then break into minutes + seconds.
 *
 *   40.75 min / 5.26 km = 7.747 min/km -> 464.8 sec/km -> "7:44"
 *
 * Truncates to the second (matches how runners read pace). A tiny epsilon
 * counters floating-point undershoot (e.g. 5.05 * 60 landing at 302.9999).
 */
export function formatPace(paceMinPerKm: number): string {
  if (!(paceMinPerKm > 0)) return "0:00";

  const totalSeconds = Math.floor(paceMinPerKm * 60 + 1e-9);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
