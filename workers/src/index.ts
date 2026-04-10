import { cors } from 'hono/cors';
import { Hono } from 'hono';

import { optionalAuth } from './middleware/auth';
import { rateLimit } from './middleware/rateLimit';
import { contentRoutes } from './routes/content';
import { aiRoutes } from './routes/ai';
import { prayerRoutes } from './routes/prayer';
import { quranRoutes } from './routes/quran';
import { type Env } from './types';

const app = new Hono<{ Bindings: Env }>();

const ALLOWED_ORIGINS = [
  'https://noor-al-huda.vercel.app',
  'https://noor-al-huda-260326.firebaseapp.com',
  'https://noor-al-huda-260326.web.app',
  'http://localhost:3000',
];

app.use('/api/*', cors({
  origin: (origin) => ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]!,
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
}));
app.use('/api/*', rateLimit());
app.use('/api/*', optionalAuth);

app.get('/api/health', (c) => {
  return c.json({
    ok: true,
    service: 'noor-al-huda-api',
    timestamp: new Date().toISOString()
  });
});

app.route('/api', prayerRoutes);
app.route('/api', quranRoutes);
app.route('/api', contentRoutes);
app.route('/api', aiRoutes);

export default app;
