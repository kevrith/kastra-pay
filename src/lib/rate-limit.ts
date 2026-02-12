// Simple in-memory rate limiter using a sliding window
// For production, replace with Redis/Upstash-based rate limiting

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) {
      store.delete(key);
    }
  }
}, 60_000);

interface RateLimitConfig {
  /** Maximum number of requests */
  limit: number;
  /** Window size in seconds */
  windowMs: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

export function rateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    // New window
    store.set(key, {
      count: 1,
      resetAt: now + config.windowMs * 1000,
    });
    return {
      success: true,
      remaining: config.limit - 1,
      resetAt: now + config.windowMs * 1000,
    };
  }

  if (entry.count >= config.limit) {
    return {
      success: false,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }

  entry.count++;
  return {
    success: true,
    remaining: config.limit - entry.count,
    resetAt: entry.resetAt,
  };
}

// Pre-configured rate limiters
export const rateLimiters = {
  /** Auth endpoints: 10 requests per minute */
  auth: (ip: string) =>
    rateLimit(`auth:${ip}`, { limit: 10, windowMs: 60 }),

  /** Payment initiation: 30 requests per minute per IP */
  payment: (ip: string) =>
    rateLimit(`payment:${ip}`, { limit: 30, windowMs: 60 }),

  /** API endpoints: 100 requests per minute per IP */
  api: (ip: string) =>
    rateLimit(`api:${ip}`, { limit: 100, windowMs: 60 }),
};
