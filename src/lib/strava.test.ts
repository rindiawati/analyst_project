import { describe, expect, it } from "vitest";

import { isRunActivity, mapStravaActivity, type StravaActivity } from "./strava";

describe("isRunActivity", () => {
  it("accepts Run and VirtualRun", () => {
    expect(isRunActivity({ type: "Run" })).toBe(true);
    expect(isRunActivity({ type: "VirtualRun" })).toBe(true);
  });

  it("rejects non-run types", () => {
    expect(isRunActivity({ type: "Ride" })).toBe(false);
    expect(isRunActivity({ type: "Walk" })).toBe(false);
  });
});

describe("mapStravaActivity", () => {
  const sample: StravaActivity = {
    id: 1234567890,
    type: "Run",
    distance: 5260, // metres -> 5.26 km
    moving_time: 2445, // seconds -> 40.75 min
    start_date_local: "2026-01-15T07:00:00Z",
    start_date: "2026-01-15T06:00:00Z",
  };

  it("converts distance metres -> km", () => {
    expect(mapStravaActivity(sample).distance).toBeCloseTo(5.26, 5);
  });

  it("converts moving_time seconds -> minutes", () => {
    expect(mapStravaActivity(sample).duration).toBeCloseTo(40.75, 5);
  });

  it("derives averagePace as duration/distance (min/km)", () => {
    // 40.75 / 5.26 = 7.7472 min/km -> "7:44" when formatted
    expect(mapStravaActivity(sample).averagePace).toBeCloseTo(7.7472, 3);
  });

  it("stringifies the Strava id for dedup", () => {
    expect(mapStravaActivity(sample).stravaId).toBe("1234567890");
  });

  it("prefers start_date_local when present", () => {
    expect(mapStravaActivity(sample).runDate.toISOString()).toBe(
      new Date("2026-01-15T07:00:00Z").toISOString(),
    );
  });

  it("falls back to start_date when local is absent", () => {
    const { start_date_local, ...withoutLocal } = sample;
    void start_date_local;
    expect(mapStravaActivity(withoutLocal).runDate.toISOString()).toBe(
      new Date("2026-01-15T06:00:00Z").toISOString(),
    );
  });
});
