import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export type RateLimitResult = {
  success: boolean;
  reset: number;
  remaining: number;
};

function createLimiter(
  limit: number,
  window: `${number} ${"s" | "m" | "h" | "d"}`,
  analytics = false
) {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

  if (!url || !token) {
    throw new Error(
      "UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are required"
    );
  }

  return new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(limit, window),
    analytics,
  });
}

export const startCallLimiter = createLimiter(2, "60 m", true);
export const userRatelimit = createLimiter(5, "60 s");

export async function applyRateLimit(
  limiter: Ratelimit,
  key: string
): Promise<RateLimitResult> {
  return limiter.limit(key);
}
