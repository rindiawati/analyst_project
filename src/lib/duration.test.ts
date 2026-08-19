import { describe, expect, it } from "vitest";

import { durationFromParts, durationToParts, formatDuration } from "./duration";

describe("durationFromParts", () => {
  it("converts minutes-only to minutes", () => {
    expect(durationFromParts(0, 28, 0)).toBe(28);
  });

  it("combines hours, minutes, and seconds into fractional minutes", () => {
    expect(durationFromParts(1, 30, 30)).toBe(90.5);
  });

  it("treats zero as zero", () => {
    expect(durationFromParts(0, 0, 0)).toBe(0);
  });
});

describe("durationToParts", () => {
  it("splits whole minutes", () => {
    expect(durationToParts(28)).toEqual({ hours: 0, minutes: 28, seconds: 0 });
  });

  it("splits fractional minutes into h/m/s", () => {
    expect(durationToParts(90.5)).toEqual({ hours: 1, minutes: 30, seconds: 30 });
  });

  it("rounds to the nearest second on float input", () => {
    // 5.9999 min -> 360s -> 0h 6m 0s
    expect(durationToParts(5.9999)).toEqual({ hours: 0, minutes: 6, seconds: 0 });
  });

  it("is the inverse of durationFromParts", () => {
    for (const [h, m, s] of [
      [0, 0, 0],
      [0, 28, 0],
      [1, 30, 30],
      [2, 5, 45],
    ] as const) {
      expect(durationToParts(durationFromParts(h, m, s))).toEqual({
        hours: h,
        minutes: m,
        seconds: s,
      });
    }
  });
});

describe("formatDuration", () => {
  it("formats minutes-only durations", () => {
    expect(formatDuration(45)).toBe("45m");
  });

  it("formats hour + minute durations", () => {
    expect(formatDuration(90)).toBe("1h 30m");
    expect(formatDuration(125)).toBe("2h 5m");
  });

  it("returns 0m for zero/negative", () => {
    expect(formatDuration(0)).toBe("0m");
    expect(formatDuration(-5)).toBe("0m");
  });
});
