import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export type RateLimitResult = {
  success: boolean;
  reset: number;
  remaining: number;
};

const upstashUrl = process.env.UPSTASH_REDIS_REST_URL?.trim();
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
const isRateLimitConfigured = Boolean(upstashUrl && upstashToken);

function createLimiter(
  limit: number,
  window: `${number} ${"s" | "m" | "h" | "d"}`,
  analytics = false
): Ratelimit | null {
  if (!isRateLimitConfigured) {
    return null;
  }

  return new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(limit, window),
    analytics,
  });
}

export const startCallLimiter = createLimiter(2, "1 m", true);
export const userRatelimit = createLimiter(5, "60 s");

const allowRequest: RateLimitResult = {
  success: true,
  reset: Date.now(),
  remaining: 999,
};

/**
 * Apply rate limiting with graceful fallback when Upstash is unavailable.
 */
export async function applyRateLimit(
  limiter: Ratelimit | null,
  key: string
): Promise<RateLimitResult> {
  if (!limiter) {
    console.warn("Upstash Redis not configured, skipping rate limit");
    return allowRequest;
  }

  try {
    return await limiter.limit(key);
  } catch (error) {
    console.warn("Rate limiter unavailable, allowing request:", error);
    return allowRequest;
  }
}
