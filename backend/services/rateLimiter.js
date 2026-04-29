import getRedis from "../config/redis.js";

const PLANS = {
  free: { limit: 100, window: 60 * 60 * 24 },
  pro: { limit: 50, window: 60 },
};

export const checkRateLimit = async (apiKeyId, plan = "free") => {
  const redis = getRedis();

  if (!redis) {
    console.warn("Redis not available — skipping rate limit");
    return { allowed: true, remaining: 999, limit: 1000 };
  }

  try {
    const { limit, window } = PLANS[plan] || PLANS.free;
    const redisKey = `ratelimit:${apiKeyId}:${plan}`;

    const current = await redis.get(redisKey);

    if (current === null) {
      await redis.set(redisKey, 1, { ex: window });
      return { allowed: true, remaining: limit - 1, limit };
    }

    const count = parseInt(current);

    if (count >= limit) {
      return { allowed: false, remaining: 0, limit };
    }

    await redis.incr(redisKey);
    return { allowed: true, remaining: limit - count - 1, limit };
  } catch (error) {
    console.error("Rate limiter error:", error.message);
    return { allowed: true, remaining: -1, limit: -1 };
  }
};
