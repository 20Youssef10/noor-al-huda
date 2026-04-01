import { z } from 'zod';

import { fallbackAzkar } from '../../data/fallback';
import { getCachedContent, putCachedContent } from '../../lib/sqlite';
import { type AzkarCollection } from '../../types/domain';

const azkarSchema = z.array(
  z.object({
    id: z.string(),
    text: z.string(),
    count: z.number(),
    virtue: z.string(),
  })
);

const hisnItemSchema = z.object({
  ID: z.number(),
  ARABIC_TEXT: z.string(),
  REPEAT: z.number(),
});

const hisnCollectionSchema = z.record(z.string(), z.array(hisnItemSchema));

export async function fetchAzkarCollection(collection: AzkarCollection) {
  const cached = await getCachedContent<z.infer<typeof azkarSchema>>('azkar', collection);

  try {
    const categoryId = collection === 'after-prayer' ? 25 : 27;
    const response = await fetch(`https://www.hisnmuslim.com/api/ar/${categoryId}.json`);
    if (!response.ok) {
      throw new Error(`azkar-failed-${response.status}`);
    }
    const raw = await response.text();
    const payload = hisnCollectionSchema.parse(JSON.parse(raw.replace(/^\ufeff/, '')));
    const list = (Object.values(payload)[0] ?? []) as Array<z.infer<typeof hisnItemSchema>>;
    const remote = azkarSchema.parse(
      list.slice(0, 40).map((item) => ({
        id: String(item.ID),
        text: item.ARABIC_TEXT,
        count: item.REPEAT,
        virtue: collection === 'after-prayer' ? 'ذكر بعد الصلاة من حصن المسلم.' : 'ذكر حي من حصن المسلم.',
      }))
    );
    await putCachedContent('azkar', collection, remote);
    return remote;
  } catch {
    if (cached) {
      return cached;
    }
    const fallback = fallbackAzkar[collection];
    await putCachedContent('azkar', collection, fallback);
    return fallback;
  }
}
