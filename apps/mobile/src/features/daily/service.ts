import { z } from 'zod';

import { fallbackDailyContent } from '../../data/fallback';
import { jsonRequest } from '../../lib/api';

const dailyContentSchema = z.object({
  ayah: z.object({
    surahId: z.number(),
    surahName: z.string(),
    reference: z.string(),
    text: z.string(),
  }),
  hadith: z.object({
    id: z.string(),
    title: z.string(),
    text: z.string(),
    source: z.string(),
  }),
});

export async function fetchDailyContent() {
  try {
    return await jsonRequest('/api/daily-content', dailyContentSchema);
  } catch {
    return fallbackDailyContent;
  }
}
