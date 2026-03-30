type RequestTimestamps = number[];

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

interface RateLimitResult {
  allowed: boolean;
  retryAfterMs: number;
}

const store = new Map<string, RequestTimestamps>();

const CLEANUP_INTERVAL_MS = 60_000;
let lastCleanup = Date.now();

function removeExpiredEntries(now: number, windowMs: number): void {
  for (const [key, timestamps] of store) {
    const valid = timestamps.filter((t) => now - t < windowMs);
    if (valid.length === 0) {
      store.delete(key);
    } else {
      store.set(key, valid);
    }
  }
}

export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();

  if (now - lastCleanup > CLEANUP_INTERVAL_MS) {
    removeExpiredEntries(now, config.windowMs);
    lastCleanup = now;
  }

  const timestamps = store.get(key) ?? [];
  const windowStart = now - config.windowMs;
  const recentRequests = timestamps.filter((t) => t > windowStart);

  if (recentRequests.length >= config.maxRequests) {
    const oldestInWindow = recentRequests[0];
    const retryAfterMs = oldestInWindow + config.windowMs - now;
    return { allowed: false, retryAfterMs };
  }

  recentRequests.push(now);
  store.set(key, recentRequests);
  return { allowed: true, retryAfterMs: 0 };
}

export function rateLimitResponse(retryAfterMs: number): Response {
  const retryAfterSeconds = Math.ceil(retryAfterMs / 1000);
  return Response.json(
    { error: "Too many requests. Please try again later." },
    {
      status: 429,
      headers: { "Retry-After": String(retryAfterSeconds) },
    }
  );
}

/** Visible for testing only */
export function _resetStore(): void {
  store.clear();
}
