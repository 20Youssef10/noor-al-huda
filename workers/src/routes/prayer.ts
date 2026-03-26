import { Hono } from 'hono';
import { z } from 'zod';

import { getPrayerTimes } from '../services/prayer';
import { type Env } from '../types';

const prayerQuerySchema = z.object({
  lat: z.coerce.number(),
  lng: z.coerce.number(),
  method: z.enum(['ummAlQura', 'egyptian', 'karachi']).default('ummAlQura')
});

export const prayerRoutes = new Hono<{ Bindings: Env }>();

prayerRoutes.get('/prayer-times', async (c) => {
  const query = prayerQuerySchema.parse(c.req.query());
  const payload = await getPrayerTimes(c.env, query.lat, query.lng, query.method);
  return c.json(payload);
});

prayerRoutes.get('/qibla', async (c) => {
  const query = prayerQuerySchema.parse(c.req.query());
  const payload = await getPrayerTimes(c.env, query.lat, query.lng, query.method);
  return c.json({
    locationLabel: payload.locationLabel,
    qiblaDegrees: payload.qiblaDegrees
  });
});
