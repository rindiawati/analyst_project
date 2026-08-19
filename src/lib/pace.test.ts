import { describe, expect, it } from "vitest";

import { formatPace } from "./pace";

describe("formatPace", () => {
  it("formats the canonical example (5.26km in 40:45 -> 7:44)", () => {
    // 40 min 45 sec = 40.75 min; 40.75 / 5.26 = 7.7472 min/km
    expect(formatPace(40.75 / 5.26)).toBe("7:44");
  });

  it("returns 0:00 for zero or negative input", () => {
    expect(formatPace(0)).toBe("0:00");
    expect(formatPace(-3)).toBe("0:00");
  });

  it("formats a whole-minute pace", () => {
    expect(formatPace(6)).toBe("6:00");
  });

  it("pads single-digit seconds", () => {
    // 4 min 5 sec per km = 4 + 5/60 min/km -> 245 sec -> "4:05"
    expect(formatPace(4 + 5 / 60)).toBe("4:05");
  });

  it("truncates fractional seconds (does not round up)", () => {
    // 7.7499 min/km -> 464.99 sec -> "7:44", not "7:45"
    expect(formatPace(7.7499)).toBe("7:44");
  });
});
