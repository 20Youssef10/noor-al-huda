import { z } from 'zod';

import { type HadithCollection } from '../../types/domain';

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

export async function fetchHadithCollections(): Promise<HadithCollection[]> {
  const response = await fetch('https://hadeethenc.com/api/v1/categories/roots/?language=ar');
  if (!response.ok) {
    throw new Error(`hadith-categories-failed-${response.status}`);
  }
  const payload = categoriesSchema.parse(await response.json());
  return payload.slice(0, 12).map((item) => ({
    id: item.id,
    title: item.title,
    count: Number(item.hadeeths_count),
  }));
}

export async function fetchHadithPage(categoryId: string, page: number, perPage = 10) {
  const response = await fetch(`https://hadeethenc.com/api/v1/hadeeths/list/?language=ar&category_id=${categoryId}&page=${page}&per_page=${perPage}`);
  if (!response.ok) {
    throw new Error(`hadith-page-failed-${response.status}`);
  }
  const payload = hadithListSchema.parse(await response.json());
  return {
    items: payload.data,
    page: Number(payload.meta.current_page),
    totalPages: payload.meta.last_page,
  };
}
