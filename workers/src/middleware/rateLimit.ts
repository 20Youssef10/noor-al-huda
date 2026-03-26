import { createMiddleware } from 'hono/factory';

const bucket = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(limit = 120, windowMs = 60_000) {
  return createMiddleware(async (c, next) => {
    const now = Date.now();
    const ip = c.req.header('cf-connecting-ip') ?? 'unknown';
    const entry = bucket.get(ip);

    if (!entry || entry.resetAt < now) {
      bucket.set(ip, { count: 1, resetAt: now + windowMs });
      await next();
      return;
    }

    if (entry.count >= limit) {
      return c.json({ error: 'Too many requests' }, 429);
    }

    entry.count += 1;
    bucket.set(ip, entry);
    await next();
  });
}
