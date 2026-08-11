import { describe, expect, it } from "vitest";

import {
  totalDistance,
  longestRun,
  distanceThisWeek,
  averagePace,
  currentStreak,
} from "./stats";

const THU = new Date("2026-01-15T00:00:00"); // Thursday; week start = Mon 2026-01-12

describe("totalDistance", () => {
  it("returns 0 for no runs", () => {
    expect(totalDistance([])).toBe(0);
  });

  it("sums all distances", () => {
    expect(
      totalDistance([
        { distance: 5 },
        { distance: 3.2 },
        { distance: 10 },
      ]),
    ).toBeCloseTo(18.2, 5);
  });
});

describe("longestRun", () => {
  it("returns 0 for no runs", () => {
    expect(longestRun([])).toBe(0);
  });

  it("returns the max distance", () => {
    expect(
      longestRun([
        { distance: 5 },
        { distance: 12.4 },
        { distance: 3 },
      ]),
    ).toBeCloseTo(12.4, 5);
  });
});

describe("distanceThisWeek", () => {
  it("returns 0 for no runs", () => {
    expect(distanceThisWeek([], THU)).toBe(0);
  });

  it("sums only runs inside the current Mon-Sun week", () => {
    const runs = [
      { distance: 5, runDate: new Date("2026-01-12") }, // Mon — in
      { distance: 4, runDate: new Date("2026-01-15") }, // Thu — in
      { distance: 9, runDate: new Date("2026-01-11") }, // prev Sun — out
      { distance: 2, runDate: new Date("2026-01-18") }, // next Sun — in
    ];

    expect(distanceThisWeek(runs, THU)).toBeCloseTo(11, 5); // 5 + 4 + 2
  });
});

describe("averagePace", () => {
  it("returns 0 for no runs", () => {
    expect(averagePace([])).toBe(0);
  });

  it("returns the mean pace", () => {
    expect(averagePace([{ averagePace: 5 }, { averagePace: 6 }, { averagePace: 7 }])).toBeCloseTo(
      6,
      5,
    );
  });
});

describe("currentStreak", () => {
  it("returns 0 for no runs", () => {
    expect(currentStreak([], THU)).toBe(0);
  });

  it("counts consecutive days ending today", () => {
    const runs = [
      { runDate: new Date("2026-01-15") }, // today
      { runDate: new Date("2026-01-14") },
      { runDate: new Date("2026-01-13") },
    ];

    expect(currentStreak(runs, THU)).toBe(3);
  });

  it("stays alive if the last run was yesterday (not broken yet today)", () => {
    const runs = [
      { runDate: new Date("2026-01-14") }, // yesterday
      { runDate: new Date("2026-01-13") },
    ];

    expect(currentStreak(runs, THU)).toBe(2);
  });

  it("returns 0 if the last run was before yesterday", () => {
    const runs = [{ runDate: new Date("2026-01-13") }]; // 2 days ago

    expect(currentStreak(runs, THU)).toBe(0);
  });

  it("stops at the first gap", () => {
    const runs = [
      { runDate: new Date("2026-01-15") }, // today
      { runDate: new Date("2026-01-13") }, // gap on the 14th
    ];

    expect(currentStreak(runs, THU)).toBe(1);
  });

  it("ignores future runs", () => {
    const runs = [
      { runDate: new Date("2026-01-15") },
      { runDate: new Date("2026-01-16") }, // future, ignored
    ];

    expect(currentStreak(runs, THU)).toBe(1);
  });

  it("counts a run today only as a 1-day streak", () => {
    expect(currentStreak([{ runDate: new Date("2026-01-15") }], THU)).toBe(1);
  });
});
