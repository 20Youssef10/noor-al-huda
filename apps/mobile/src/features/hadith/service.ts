import { z } from 'zod';

import { getCachedContent, putCachedContent } from '../../lib/sqlite';
import { type HadithCollection } from '../../types/domain';

const COLLECTIONS: HadithCollection[] = [
  { id: '1', title: 'صحيح البخاري', count: 7563, bookGroup: 'الكتب التسعة' },
  { id: '2', title: 'صحيح مسلم', count: 7563, bookGroup: 'الكتب التسعة' },
  { id: '3', title: 'سنن أبي داود', count: 5274, bookGroup: 'الكتب التسعة' },
  { id: '4', title: 'سنن الترمذي', count: 3956, bookGroup: 'الكتب التسعة' },
  { id: '5', title: 'سنن النسائي', count: 5758, bookGroup: 'الكتب التسعة' },
  { id: '6', title: 'سنن ابن ماجه', count: 4341, bookGroup: 'الكتب التسعة' },
  { id: '7', title: 'موطأ مالك', count: 1850, bookGroup: 'الكتب التسعة' },
  { id: '8', title: 'مسند أحمد', count: 27647, bookGroup: 'الكتب التسعة' },
  { id: '9', title: 'سنن الدارمي', count: 3503, bookGroup: 'الكتب التسعة' },
  { id: '10', title: 'رياض الصالحين', count: 1900, bookGroup: 'مجاميع معتمدة' },
  { id: '11', title: 'الأربعون النووية', count: 42, bookGroup: 'مجاميع معتمدة' },
  { id: '12', title: 'بلوغ المرام', count: 1400, bookGroup: 'مجاميع معتمدة' },
  { id: '13', title: 'عمدة الأحكام', count: 430, bookGroup: 'مجاميع معتمدة' },
  { id: '14', title: 'الأدب المفرد', count: 1322, bookGroup: 'مجاميع معتمدة' },
  { id: '15', title: 'الشمائل المحمدية', count: 415, bookGroup: 'مجاميع معتمدة' },
  { id: '16', title: 'الترغيب والترهيب', count: 1300, bookGroup: 'مجاميع معتمدة' },
  { id: '17', title: 'صحيح الجامع', count: 3600, bookGroup: 'مجاميع معتمدة' },
];

const categoriesSchema = z.array(
  z.object({
    id: z.string(),
    title: z.string(),
    hadeeths_count: z.string(),
    parent_id: z.string().nullable(),
  })
);

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

export type HadithListItem = { id: string; title: string };

export const hadithCollectionsCatalog = COLLECTIONS;

export async function fetchHadithCollections(): Promise<HadithCollection[]> {
  const cached = await getCachedContent<HadithCollection[]>('hadith', 'collections:v2');
  try {
    const response = await fetch('https://hadeethenc.com/api/v1/categories/roots/?language=ar');
    if (!response.ok) {
      throw new Error(`hadith-categories-failed-${response.status}`);
    }
    const payload = categoriesSchema.parse(await response.json());
    const fromApi = payload.slice(0, 12).map((item) => ({
      id: item.id,
      title: item.title,
      count: Number(item.hadeeths_count),
      bookGroup: 'حسب API',
    }));
    const merged = [...fromApi, ...COLLECTIONS].slice(0, 17);
    await putCachedContent('hadith', 'collections:v2', merged);
    return merged;
  } catch {
    return cached ?? COLLECTIONS;
  }
}

export async function fetchHadithPage(categoryId: string, page: number, perPage = 10) {
  const cacheKey = `page:${categoryId}:${page}:${perPage}`;
  const cached = await getCachedContent<{ items: HadithListItem[]; page: number; totalPages: number }>('hadith', cacheKey);
  const response = await fetch(`https://hadeethenc.com/api/v1/hadeeths/list/?language=ar&category_id=${categoryId}&page=${page}&per_page=${perPage}`);
  if (!response.ok) {
    if (cached) {
      return cached;
    }
    throw new Error(`hadith-page-failed-${response.status}`);
  }
  const payload = hadithListSchema.parse(await response.json());
  const result = {
    items: payload.data,
    page: Number(payload.meta.current_page),
    totalPages: payload.meta.last_page,
  };
  await putCachedContent('hadith', cacheKey, result);
  return result;
}

const hadithDetailSchema = z.object({
  id: z.string(),
  title: z.string(),
  hadeeth: z.string(),
  attribution: z.string().optional(),
  grade: z.string().optional(),
});

export async function fetchHadithDetail(id: string) {
  const cacheKey = `detail:${id}`;
  const cached = await getCachedContent<{ id: string; title: string; text: string; englishText?: string; source: string }>('hadith', cacheKey);
  const [arabicResponse, englishResponse] = await Promise.all([
    fetch(`https://hadeethenc.com/api/v1/hadeeths/one/?language=ar&id=${id}`),
    fetch(`https://hadeethenc.com/api/v1/hadeeths/one/?language=en&id=${id}`),
  ]);

  if (!arabicResponse.ok) {
    if (cached) {
      return cached;
    }
    throw new Error(`hadith-detail-failed-${arabicResponse.status}`);
  }

  const arabic = hadithDetailSchema.parse(await arabicResponse.json());
  const english = englishResponse.ok ? hadithDetailSchema.parse(await englishResponse.json()) : null;

  const result = {
    id: arabic.id,
    title: arabic.title,
    text: arabic.hadeeth,
    englishText: english?.hadeeth,
    source: arabic.attribution ?? arabic.grade ?? 'موسوعة الحديث',
  };
  await putCachedContent('hadith', cacheKey, result);
  return result;
}
