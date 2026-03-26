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

app.use('/api/*', cors());
app.use('/api/*', rateLimit());
app.use('/api/*', optionalAuth);

app.get('/api/health', (c) => {
  return c.json({
    ok: true,
    service: 'noor-al-huda-api',
    firebaseProjectId: c.env.FIREBASE_PROJECT_ID
  });
});

app.route('/api', prayerRoutes);
app.route('/api', quranRoutes);
app.route('/api', contentRoutes);
app.route('/api', aiRoutes);

export default app;
