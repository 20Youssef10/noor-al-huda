import { Hono } from 'hono';

import { fallbackAzkar, fallbackDailyContent, fallbackRadios } from '../data/fallback';
import { readCache, writeCache } from '../services/cache';
import { type Env } from '../types';

export const contentRoutes = new Hono<{ Bindings: Env }>();

contentRoutes.get('/daily-content', async (c) => {
  const cacheKey = `daily:${new Date().toISOString().slice(0, 10)}`;
  const cached = await readCache(c.env, 'HADITH_CACHE', cacheKey);
  if (cached) {
    return c.json(cached);
  }

  await writeCache(c.env, 'HADITH_CACHE', cacheKey, fallbackDailyContent, 86400);
  return c.json(fallbackDailyContent);
});

contentRoutes.get('/hadith/daily', async (c) => c.json(fallbackDailyContent.hadith));

contentRoutes.get('/radios', async (c) => {
  const cached = await readCache(c.env, 'RADIO_LIST', 'radios:all');
  if (cached) {
    return c.json(cached);
  }

  await writeCache(c.env, 'RADIO_LIST', 'radios:all', fallbackRadios, 3600);
  return c.json(fallbackRadios);
});

contentRoutes.get('/azkar/:collection', async (c) => {
    const collection = c.req.param('collection') as keyof typeof fallbackAzkar;
    const cacheKey = `azkar:${collection}`;
    const cached = await readCache(c.env, 'AZKAR_CACHE', cacheKey);
    if (cached) {
      return c.json(cached);
    }

    const payload = fallbackAzkar[collection] ?? fallbackAzkar.morning;
    await writeCache(c.env, 'AZKAR_CACHE', cacheKey, payload, 2_592_000);
    return c.json(payload);
  }
);
