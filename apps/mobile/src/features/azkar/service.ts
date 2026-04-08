import { z } from 'zod';

import { fallbackAzkar } from '../../data/fallback';
import { getCachedContent, putCachedContent } from '../../lib/sqlite';
import { type AzkarCollection, type AzkarEntry } from '../../types/domain';

const azkarSchema = z.array(
  z.object({
    id: z.string(),
    text: z.string(),
    count: z.number(),
    virtue: z.string(),
    collectionTitle: z.string().optional(),
  })
);

const hisnItemSchema = z.object({
  ID: z.number(),
  ARABIC_TEXT: z.string(),
  REPEAT: z.number(),
});

const hisnCollectionSchema = z.record(z.string(), z.array(hisnItemSchema));

const hisnCatalogSchema = z.object({
  العربية: z.array(
    z.object({
      ID: z.number(),
      TITLE: z.string(),
    })
  ),
});

export type AzkarCatalogItem = { id: number; title: string };

const categoryMap: Record<AzkarCollection, number> = {
  morning: 27,
  evening: 27,
  'after-prayer': 25,
};

export async function fetchAzkarCatalog(): Promise<AzkarCatalogItem[]> {
  const response = await fetch('https://www.hisnmuslim.com/api/ar/husn_ar.json');
  if (!response.ok) {
    throw new Error(`azkar-catalog-failed-${response.status}`);
  }
  const raw = await response.text();
  const payload = hisnCatalogSchema.parse(JSON.parse(raw.replace(/^\ufeff/, '')));
  return payload.العربية.map((item) => ({ id: item.ID, title: item.TITLE }));
}

export async function fetchAzkarCollection(collection: AzkarCollection): Promise<AzkarEntry[]> {
  const catalogTitle =
    collection === 'morning'
      ? 'أذكار الصباح'
      : collection === 'evening'
        ? 'أذكار المساء'
        : 'الأذكار بعد الصلاة';

  return fetchAzkarCategory(categoryMap[collection], catalogTitle, collection === 'after-prayer' ? 'ذكر بعد الصلاة من حصن المسلم.' : 'ذكر حي من حصن المسلم.');
}

export async function fetchAzkarCategory(categoryId: number, collectionTitle: string, virtueFallback = 'ذكر من حصن المسلم.') {
  const cacheKey = `category:${categoryId}`;
  const cached = await getCachedContent<AzkarEntry[]>('azkar', cacheKey);

  try {
    const response = await fetch(`https://www.hisnmuslim.com/api/ar/${categoryId}.json`);
    if (!response.ok) {
      throw new Error(`azkar-failed-${response.status}`);
    }
    const raw = await response.text();
    const payload = hisnCollectionSchema.parse(JSON.parse(raw.replace(/^\ufeff/, '')));
    const list = (Object.values(payload)[0] ?? []) as Array<z.infer<typeof hisnItemSchema>>;
    const remote = azkarSchema.parse(
      list.slice(0, 80).map((item) => ({
        id: String(item.ID),
        text: item.ARABIC_TEXT,
        count: item.REPEAT,
        virtue: virtueFallback,
        collectionTitle,
      }))
    );
    await putCachedContent('azkar', cacheKey, remote);
    return remote;
  } catch {
    if (cached) {
      return cached;
    }
    const fallback = Object.values(fallbackAzkar).flat().map((item) => ({ ...item, collectionTitle }));
    await putCachedContent('azkar', cacheKey, fallback);
    return fallback;
  }
}
