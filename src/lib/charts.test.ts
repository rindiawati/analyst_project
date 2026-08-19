import { describe, expect, it } from "vitest";

import { weeklyMileage, weeklyPace } from "./charts";

// Today = Thursday 2026-01-15 (week Mon 01-12 .. Sun 01-18).
const TODAY = new Date("2026-01-15T09:00:00");

describe("weeklyMileage", () => {
  it("returns the requested number of buckets, oldest -> newest", () => {
    const buckets = weeklyMileage([], TODAY, 4);
    expect(buckets).toHaveLength(4);
    // Newest bucket is the current week (Mon 01-12).
    expect(buckets[3]!.label).toBe("1/12");
    // Oldest is 3 weeks before.
    expect(buckets[0]!.label).toBe("12/22");
  });

  it("sums distance into the correct week", () => {
    const runs = [
      { distance: 5, runDate: new Date("2026-01-13") }, // this week
      { distance: 3, runDate: new Date("2026-01-15") }, // this week
      { distance: 10, runDate: new Date("2026-01-05") }, // previous week
    ];

    const buckets = weeklyMileage(runs, TODAY, 2);
    expect(buckets[0]!.distance).toBeCloseTo(10, 5); // week of 01-05
    expect(buckets[1]!.distance).toBeCloseTo(8, 5); // week of 01-12
  });

  it("zeros out weeks with no runs", () => {
    const buckets = weeklyMileage(
      [{ distance: 5, runDate: new Date("2026-01-13") }],
      TODAY,
      3,
    );
    expect(buckets[0]!.distance).toBe(0); // 2 weeks ago
    expect(buckets[2]!.distance).toBeCloseTo(5, 5); // this week
  });
});

describe("weeklyPace", () => {
  it("returns null for weeks with no runs", () => {
    const buckets = weeklyPace([], TODAY, 2);
    expect(buckets[0]!.pace).toBeNull();
    expect(buckets[1]!.pace).toBeNull();
  });

  it("returns time-weighted pace (totalDuration/totalDistance) for the week", () => {
    // Week of 01-12: 5km in 30min + 3km in 18min => 48min/8km = 6.0 min/km
    const runs = [
      { distance: 5, duration: 30, runDate: new Date("2026-01-13") },
      { distance: 3, duration: 18, runDate: new Date("2026-01-15") },
    ];

    const buckets = weeklyPace(runs, TODAY, 1);
    expect(buckets[0]!.pace).toBeCloseTo(6, 5);
  });
});
