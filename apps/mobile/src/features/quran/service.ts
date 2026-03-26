import { z } from 'zod';

import { buildFallbackSurahDetail, fallbackSurahs } from '../../data/fallback';
import { jsonRequest } from '../../lib/api';
import { getCachedContent, putCachedContent } from '../../lib/sqlite';

const surahSummarySchema = z.object({
  id: z.number(),
  name: z.string(),
  transliteration: z.string(),
  englishName: z.string(),
  versesCount: z.number(),
  revelation: z.enum(['Meccan', 'Medinan']),
});

const surahListSchema = z.array(surahSummarySchema);

const surahDetailSchema = z.object({
  surah: surahSummarySchema,
  verses: z.array(
    z.object({
      number: z.number(),
      arabicText: z.string(),
      translation: z.string(),
    })
  ),
  audioUrl: z.string().optional(),
});

export async function fetchSurahList() {
  try {
    return await jsonRequest('/api/quran/surahs', surahListSchema);
  } catch {
    return fallbackSurahs;
  }
}

export async function fetchSurahDetail(surahId: number) {
  const cached = await getCachedContent<z.infer<typeof surahDetailSchema>>(
    'surah',
    String(surahId)
  );

  if (cached) {
    return cached;
  }

  try {
    const remote = await jsonRequest(`/api/quran/surah/${surahId}`, surahDetailSchema);
    await putCachedContent('surah', String(surahId), remote);
    return remote;
  } catch {
    const fallback = buildFallbackSurahDetail(surahId);
    await putCachedContent('surah', String(surahId), fallback);
    return fallback;
  }
}
