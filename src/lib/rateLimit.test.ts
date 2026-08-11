import { describe, expect, it } from "vitest";

import {
  rateLimit,
  rateLimitKey,
  getClientIp,
  type RateLimitStore,
} from "./rateLimit";

const WINDOW = 60_000;
const MAX = 2;

describe("rateLimit", () => {
  let store: RateLimitStore;

  function setup() {
    store = new Map();
    return store;
  }

  it("allows the first request and seeds the window", () => {
    const s = setup();
    const res = rateLimit(s, "ip:1", { windowMs: WINDOW, max: MAX }, 1_000);

    expect(res).toEqual({ ok: true });
    expect(s.get("ip:1")).toEqual({ count: 1, resetAt: 61_000 });
  });

  it("counts subsequent requests within the same window", () => {
    const s = setup();
    rateLimit(s, "ip:1", { windowMs: WINDOW, max: MAX }, 1_000);

    const res = rateLimit(s, "ip:1", { windowMs: WINDOW, max: MAX }, 2_000);

    expect(res).toEqual({ ok: true });
    expect(s.get("ip:1")?.count).toBe(2);
  });

  it("blocks requests once the limit is reached and returns retry-after", () => {
    const s = setup();
    rateLimit(s, "ip:1", { windowMs: WINDOW, max: MAX }, 1_000);
    rateLimit(s, "ip:1", { windowMs: WINDOW, max: MAX }, 2_000);

    const res = rateLimit(s, "ip:1", { windowMs: WINDOW, max: MAX }, 3_000);

    expect(res).toEqual({ ok: false, retryAfterSeconds: 58 });
  });

  it("resets the window after it expires", () => {
    const s = setup();
    rateLimit(s, "ip:1", { windowMs: WINDOW, max: MAX }, 1_000);
    rateLimit(s, "ip:1", { windowMs: WINDOW, max: MAX }, 2_000);

    const res = rateLimit(s, "ip:1", { windowMs: WINDOW, max: MAX }, 70_000);

    expect(res).toEqual({ ok: true });
    expect(s.get("ip:1")).toEqual({ count: 1, resetAt: 130_000 });
  });

  it("isolates buckets per identifier", () => {
    const s = setup();
    rateLimit(s, "ip:1", { windowMs: WINDOW, max: 1 }, 1_000);

    const other = rateLimit(s, "ip:2", { windowMs: WINDOW, max: 1 }, 1_000);

    expect(other).toEqual({ ok: true });
  });

  it("re-seeds an expired entry without being affected by stale counts", () => {
    const s = setup();
    rateLimit(s, "ip:1", { windowMs: WINDOW, max: 1 }, 1_000);
    // stale entry still present but expired
    const blockedBeforeExpiry = rateLimit(
      s,
      "ip:1",
      { windowMs: WINDOW, max: 1 },
      60_999,
    );
    expect(blockedBeforeExpiry.ok).toBe(false);

    const res = rateLimit(s, "ip:1", { windowMs: WINDOW, max: 1 }, 61_001);
    expect(res).toEqual({ ok: true });
  });
});

describe("rateLimitKey", () => {
  it("namespaces per IP and scope so endpoints keep independent buckets", () => {
    expect(rateLimitKey("1.2.3.4", "register")).toBe("ip:1.2.3.4:register");
    expect(rateLimitKey("1.2.3.4", "create")).toBe("ip:1.2.3.4:create");
    expect(rateLimitKey("1.2.3.4", "delete")).toBe("ip:1.2.3.4:delete");
    expect(rateLimitKey("1.2.3.4", "register")).not.toBe(
      rateLimitKey("1.2.3.4", "create"),
    );
  });

  it("distinguishes IPs within the same scope", () => {
    expect(rateLimitKey("1.1.1.1", "create")).not.toBe(
      rateLimitKey("2.2.2.2", "create"),
    );
  });
});

describe("getClientIp", () => {
  it("uses the first IP from x-forwarded-for", () => {
    const headers = new Headers({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" });

    expect(getClientIp(headers)).toBe("1.2.3.4");
  });

  it("trims whitespace from x-forwarded-for", () => {
    const headers = new Headers({ "x-forwarded-for": " 1.2.3.4 " });

    expect(getClientIp(headers)).toBe("1.2.3.4");
  });

  it("falls back to x-real-ip", () => {
    const headers = new Headers({ "x-real-ip": "9.9.9.9" });

    expect(getClientIp(headers)).toBe("9.9.9.9");
  });

  it("returns unknown when no IP header is present", () => {
    expect(getClientIp(new Headers())).toBe("unknown");
  });
});
