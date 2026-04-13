import { createMiddleware } from 'hono/factory';
import type { HonoEnv } from '../types';

export const optionalAuth = createMiddleware<HonoEnv>(async (c, next) => {
  const authorization = c.req.header('authorization');
  if (authorization?.startsWith('Bearer ')) {
    const firebaseToken = authorization.slice(7);
    if (!c.env.FIREBASE_WEB_API_KEY) {
      return c.json({ error: 'Firebase token verification is not configured' }, 500);
    }

    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${c.env.FIREBASE_WEB_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: firebaseToken }),
      }
    );

    if (!response.ok) {
      return c.json({ error: 'Invalid Firebase token' }, 401);
    }

    const payload = await response.json() as { users?: Array<{ localId?: string; email?: string }> };
    const user = payload.users?.[0];
    if (!user?.localId) {
      return c.json({ error: 'Invalid Firebase token' }, 401);
    }

    c.set('firebaseToken', firebaseToken);
    c.set('firebaseUserId', user.localId);
    c.set('firebaseUserEmail', user.email ?? null);
  }
  await next();
});
