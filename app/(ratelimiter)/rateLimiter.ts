import { Ratelimit } from "@upstash/ratelimit"; 
import { Redis } from "@upstash/redis";


export const startCallLimiter= new Ratelimit({
    redis:Redis.fromEnv(),
    limiter:Ratelimit.slidingWindow(2,"1 m"),
    analytics:true
})


export const userRatelimit = new Ratelimit({
  redis:Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "60 s"),
});