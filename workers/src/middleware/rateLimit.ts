import { createMiddleware } from 'hono/factory';

import { type Env } from '../types';
import { queueBackgroundTask } from '../services/runtime';

export function rateLimit(limit = 120, windowMs = 60_000) {
  return createMiddleware<{ Bindings: Env }>(async (c, next) => {
    const now = Date.now();
    const ip = c.req.header('cf-connecting-ip') ?? 'unknown';
    const resetAt = now + windowMs;
    const bucketKey = `ratelimit:${ip}:${Math.floor(now / windowMs)}`;

    const current = Number((await c.env.PRAYER_CACHE.get(bucketKey)) ?? '0');
    if (current >= limit) {
      return c.json({ error: 'Too many requests' }, 429);
    }

    queueBackgroundTask(c, 
      c.env.PRAYER_CACHE.put(bucketKey, String(current + 1), {
        expirationTtl: Math.ceil(windowMs / 1000),
      })
    );

    c.header('X-RateLimit-Limit', String(limit));
    c.header('X-RateLimit-Remaining', String(Math.max(0, limit - current - 1)));
    c.header('X-RateLimit-Reset', String(resetAt));
    await next();
  });
}
