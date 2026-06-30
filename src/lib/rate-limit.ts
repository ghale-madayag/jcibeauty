/**
 * Minimal in-memory sliding-window rate limiter.
 *
 * Scope: single process. Good enough to blunt credential brute-forcing on the
 * admin login in this app's deployment (one Node instance). It does NOT survive
 * a restart and is NOT shared across instances — if this ever runs multi-node,
 * move the window to a shared store (Redis/Upstash) keyed the same way.
 */

type Timestamps = number[];

const buckets = new Map<string, Timestamps>();

export function checkRateLimit(
  key: string,
  opts: { max: number; windowMs: number },
): { allowed: boolean; remaining: number; retryAfterMs: number } {
  const now = Date.now();
  const cutoff = now - opts.windowMs;
  const hits = (buckets.get(key) ?? []).filter((t) => t > cutoff);

  if (hits.length >= opts.max) {
    buckets.set(key, hits);
    const retryAfterMs = Math.max(0, hits[0] + opts.windowMs - now);
    return { allowed: false, remaining: 0, retryAfterMs };
  }

  hits.push(now);
  buckets.set(key, hits);
  return { allowed: true, remaining: opts.max - hits.length, retryAfterMs: 0 };
}

/** Clear a key's window (e.g. after a successful, legitimate action). */
export function resetRateLimit(key: string) {
  buckets.delete(key);
}
