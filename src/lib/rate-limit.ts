// In-memory sliding window rate limiter
// Single-instance; adequate for MVP (horizontal scaling would need Redis)
const attempts = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  key: string,
  max: number,
  windowMs: number
): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const record = attempts.get(key);

  // First attempt or window expired
  if (!record || now > record.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
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
