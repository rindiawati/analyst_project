export type RateLimitStore = Map<string, { count: number; resetAt: number }>;

export type RateLimitOptions = { windowMs: number; max: number };

export type RateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterSeconds: number };

/**
 * Fixed-window, per-identifier rate limiter operating on an injected store so
 * it stays pure and unit-testable. Returns whether the request is allowed and,
 * when blocked, how many seconds until the window resets.
 *
 * NOTE: in-memory stores are per-process. That is fine for local dev and a
 * single long-lived server, but on Vercel (many serverless instances) each
 * instance keeps its own counter, so an attacker can effectively multiply the
 * limit by the number of warm instances. For production, swap `sharedStore`
 * for a centralized one — `@upstash/ratelimit` + `@upstash/redis` is the
 * recommended lightweight choice for this stack (edge-friendly, REST based).
 */
export function rateLimit(
  store: RateLimitStore,
  key: string,
  options: RateLimitOptions,
  now: number,
): RateLimitResult {
  const entry = store.get(key);

  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + options.windowMs });
    return { ok: true };
  }

  if (entry.count < options.max) {
    entry.count += 1;
    return { ok: true };
  }

  return { ok: false, retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000) };
}

const sharedStore: RateLimitStore = new Map();

/**
 * Builds the store key for an (IP, endpoint) pair. Including the scope means
 * each endpoint keeps its own bucket — otherwise `register`, `create`, and
 * `delete` would share one counter and throttle each other.
 */
export function rateLimitKey(ip: string, scope: string): string {
  return `ip:${ip}:${scope}`;
}

export function ipRateLimit(
  ip: string,
  options: RateLimitOptions,
  scope = "default",
): RateLimitResult {
  return rateLimit(sharedStore, rateLimitKey(ip, scope), options, Date.now());
}

/**
 * Best-effort client IP extraction. `x-forwarded-for` is set by Vercel (and
 * most proxies) as "client, proxy1, proxy2"; we take the first hop. Falls back
 * to `x-real-ip`, then to "unknown" so the limiter always has a key.
 */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0];
    if (first) return first.trim();
  }

  const real = headers.get("x-real-ip");
  if (real) return real.trim();

  return "unknown";
}
