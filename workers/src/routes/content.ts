import { Hono } from 'hono';
import { z } from 'zod';

import { fallbackAzkar, fallbackDailyContent, fallbackRadios } from '../data/fallback';
import { readCache, writeCache } from '../services/cache';
import { queueBackgroundTask } from '../services/runtime';
import { type HonoEnv } from '../types';

export const contentRoutes = new Hono<HonoEnv>();

const hadithListSchema = z.object({
  data: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
    })
  ),
  meta: z.object({
    current_page: z.string(),
    last_page: z.number(),
    total_items: z.number(),
    per_page: z.string(),
  }),
});

const hadithDetailSchema = z.object({
  id: z.string(),
  title: z.string(),
  hadeeth: z.string(),
  attribution: z.string().optional(),
  grade: z.string().optional(),
});

contentRoutes.get('/daily-content', async (c) => {
  const cacheKey = `daily:v2:${new Date().toISOString().slice(0, 10)}`;
  const cached = await readCache(c.env, 'HADITH_CACHE', cacheKey);
  if (cached) {
    return c.json(cached);
  }

  try {
    const dayOfYear = Math.max(1, Math.ceil((Date.now() - new Date(new Date().getFullYear(), 0, 1).getTime()) / 86400000));
    const verseKey = `${(dayOfYear % 114) + 1}:1`;
    const [ayahResponse, hadithListResponse] = await Promise.all([
      fetch(`https://api.quran.com/api/v4/verses/by_key/${verseKey}?language=ar&translations=131&words=false&fields=text_uthmani`),
      fetch(`https://hadeethenc.com/api/v1/hadeeths/list/?language=ar&category_id=1&page=${(dayOfYear % 197) + 1}&per_page=1`),
    ]);

    if (!ayahResponse.ok || !hadithListResponse.ok) {
      throw new Error('upstream_failed');
    }

    const ayahJson = await ayahResponse.json() as {
      verse?: { verse_key?: string; text_uthmani?: string };
    };
    const hadithListJson = hadithListSchema.parse(await hadithListResponse.json());
    const hadithSummary = hadithListJson.data[0];
    if (!hadithSummary) {
      throw new Error('hadith_missing');
    }

    const hadithDetailResponse = await fetch(
      `https://hadeethenc.com/api/v1/hadeeths/one/?language=ar&id=${hadithSummary.id}`
    );
    if (!hadithDetailResponse.ok) {
      throw new Error('hadith_detail_failed');
    }

    const hadithDetail = hadithDetailSchema.parse(await hadithDetailResponse.json());
    const surahId = Number((ayahJson.verse?.verse_key ?? '2:1').split(':')[0] ?? 2);

    const payload = {
      ayah: {
        surahId,
        surahName: `سورة ${surahId}`,
        reference: ayahJson.verse?.verse_key ?? verseKey,
        text: ayahJson.verse?.text_uthmani ?? fallbackDailyContent.ayah.text,
      },
      hadith: {
        id: hadithDetail.id,
        title: hadithDetail.title,
        text: hadithDetail.hadeeth,
        source: hadithDetail.attribution ?? hadithDetail.grade ?? 'موسوعة الحديث',
      },
    };

    queueBackgroundTask(c, writeCache(c.env, 'HADITH_CACHE', cacheKey, payload, 86400));
    return c.json(payload);
  } catch {
    await writeCache(c.env, 'HADITH_CACHE', cacheKey, fallbackDailyContent, 86400);
    return c.json(fallbackDailyContent);
  }
});

contentRoutes.get('/hadith/daily', async (c) => {
  const cacheKey = `daily:v2:${new Date().toISOString().slice(0, 10)}`;
  const cached = await readCache<{ hadith?: typeof fallbackDailyContent.hadith }>(c.env, 'HADITH_CACHE', cacheKey);
  if (cached?.hadith) {
    return c.json(cached.hadith);
  }
  return c.json(fallbackDailyContent.hadith);
});

contentRoutes.get('/radios', async (c) => {
  const cached = await readCache(c.env, 'RADIO_LIST', 'radios:v2:all');
  if (cached) {
    return c.json(cached);
  }

  try {
    const response = await fetch('https://www.mp3quran.net/api/v3/radios?language=ar');
    if (!response.ok) {
      throw new Error('radio_upstream_failed');
    }

    const json = await response.json() as { radios?: Array<{ id: number; name: string; url: string }> };
    const payload = (json.radios ?? []).slice(0, 24).map((item) => ({
      id: String(item.id),
      name: item.name,
      country: 'العالم الإسلامي',
      description: 'بث مباشر من مكتبة MP3Quran.',
      streamUrl: item.url,
    }));

    if (!payload.length) {
      throw new Error('radio_empty');
    }

    queueBackgroundTask(c, writeCache(c.env, 'RADIO_LIST', 'radios:v2:all', payload, 3600));
    return c.json(payload);
  } catch {
    await writeCache(c.env, 'RADIO_LIST', 'radios:v2:all', fallbackRadios, 3600);
    return c.json(fallbackRadios);
  }
});

contentRoutes.get('/azkar/:collection', async (c) => {
    const collection = c.req.param('collection') as keyof typeof fallbackAzkar;
    const cacheKey = `azkar:v2:${collection}`;
    const cached = await readCache(c.env, 'AZKAR_CACHE', cacheKey);
    if (cached) {
      return c.json(cached);
    }

    try {
      const categoryId = collection === 'after-prayer' ? 25 : 27;
      const response = await fetch(`https://www.hisnmuslim.com/api/ar/${categoryId}.json`);
      if (!response.ok) {
        throw new Error('azkar_upstream_failed');
      }

      const raw = await response.text();
      const json = JSON.parse(raw.replace(/^\ufeff/, '')) as Record<string, Array<{
        ID: number;
        ARABIC_TEXT: string;
        REPEAT: number;
      }>>;
      const list = Object.values(json)[0] ?? [];
      const payload = list.slice(0, 40).map((item) => ({
        id: String(item.ID),
        text: item.ARABIC_TEXT,
        count: item.REPEAT,
        virtue: collection === 'after-prayer' ? 'ذكر بعد الصلاة من حصن المسلم.' : 'ذكر حي من حصن المسلم.',
      }));

      if (!payload.length) {
        throw new Error('azkar_empty');
      }

      queueBackgroundTask(c, writeCache(c.env, 'AZKAR_CACHE', cacheKey, payload, 2_592_000));
      return c.json(payload);
    } catch {
      const payload = fallbackAzkar[collection] ?? fallbackAzkar.morning;
      await writeCache(c.env, 'AZKAR_CACHE', cacheKey, payload, 2_592_000);
      return c.json(payload);
    }
  }
);
