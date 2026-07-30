import { describe, expect, it } from "vitest";
import { streakLength } from "./streak";

describe("streakLength", () => {
  const today = new Date("2026-01-15");

  it("returns 0 for an empty array", () => {
    expect(streakLength([], today)).toBe(0);
  });

  it("returns 0 if there is no check-in today", () => {
    const checkIns = [
      { date: new Date("2026-01-14") },
      { date: new Date("2026-01-13") },
    ];

    expect(streakLength(checkIns, today)).toBe(0);
  });

  it("returns 1 when there is only a check-in today", () => {
    const checkIns = [{ date: new Date("2026-01-15") }];

    expect(streakLength(checkIns, today)).toBe(1);
  });

  it("counts consecutive days ending today", () => {
    const checkIns = [
      { date: new Date("2026-01-15") },
      { date: new Date("2026-01-14") },
      { date: new Date("2026-01-13") },
    ];

    expect(streakLength(checkIns, today)).toBe(3);
  });

  it("stops counting when a day is missing", () => {
    const checkIns = [
      { date: new Date("2026-01-15") },
      { date: new Date("2026-01-13") },
    ];

    expect(streakLength(checkIns, today)).toBe(1);
  });

  it("counts duplicate check-ins on the same day only once", () => {
    const checkIns = [
      { date: new Date("2026-01-15") },
      { date: new Date("2026-01-15") },
      { date: new Date("2026-01-14") },
    ];

    expect(streakLength(checkIns, today)).toBe(2);
  });

  it("ignores future check-ins", () => {
    const checkIns = [
      { date: new Date("2026-01-16") },
      { date: new Date("2026-01-15") },
      { date: new Date("2026-01-14") },
    ];

    expect(streakLength(checkIns, today)).toBe(2);
  });
});
