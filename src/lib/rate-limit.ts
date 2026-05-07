import { createClient, RedisClientType } from "redis";

// In-memory fallback for development
const inMemoryAttempts = new Map<string, { count: number; resetAt: number }>();

let redisClient: RedisClientType | null = null;
let redisReady = false;

// Initialize Redis client if configured
async function initRedis(): Promise<void> {
  if (redisReady || redisClient) return;

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) return;

  try {
    redisClient = createClient({ url: redisUrl });
    redisClient.on("error", (err) => {
      console.error("Redis error:", err);
      redisClient = null;
    });
    await redisClient.connect();
    redisReady = true;
  } catch (error) {
    console.error("Failed to connect to Redis:", error);
    redisClient = null;
  }
}

// Initialize on module load
initRedis().catch(console.error);

export async function checkRateLimit(
  key: string,
  max: number,
  windowMs: number
): Promise<{ allowed: boolean; retryAfter?: number }> {
  const now = Date.now();

  // Try Redis first if available
  if (redisClient && redisReady) {
    try {
      const countKey = `rate-limit:${key}`;
      const count = await redisClient.incr(countKey);

      // First request in window
      if (count === 1) {
        await redisClient.pExpire(countKey, windowMs);
        return { allowed: true };
      }

      // Check if limit exceeded
      if (count > max) {
        const ttl = await redisClient.pTtl(countKey);
        return { allowed: false, retryAfter: Math.ceil(ttl / 1000) };
      }

      return { allowed: true };
    } catch (error) {
      console.error("Rate limit Redis error:", error);
      // Fall through to in-memory
    }
  }

  // Fallback to in-memory (development or Redis unavailable)
  const record = inMemoryAttempts.get(key);

  // First attempt or window expired
  if (!record || now > record.resetAt) {
    inMemoryAttempts.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  // Limit reached
  if (record.count >= max) {
    return { allowed: false, retryAfter: Math.ceil((record.resetAt - now) / 1000) };
  }

  // Increment and allow
  record.count++;
  return { allowed: true };
}
