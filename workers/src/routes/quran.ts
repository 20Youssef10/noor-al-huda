import { Hono } from 'hono';

import { getSurahDetail, getSurahList } from '../services/quran';
import { type Env } from '../types';

export const quranRoutes = new Hono<{ Bindings: Env }>();

quranRoutes.get('/surahs', async (c) => {
  const payload = await getSurahList(c.env);
  return c.json(payload);
});

quranRoutes.get('/surah/:id', async (c) => {
  const id = Number(c.req.param('id'));
  const payload = await getSurahDetail(c.env, Number.isNaN(id) ? 1 : id);
  return c.json(payload);
});
