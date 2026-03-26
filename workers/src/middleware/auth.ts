import { createMiddleware } from 'hono/factory';

export const optionalAuth = createMiddleware(async (c, next) => {
  const authorization = c.req.header('authorization');
  if (authorization?.startsWith('Bearer ')) {
    c.set('firebaseToken', authorization.slice(7));
  }
  await next();
});
