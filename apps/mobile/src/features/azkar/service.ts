import { z } from 'zod';

import { fallbackAzkar } from '../../data/fallback';
import { jsonRequest } from '../../lib/api';
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

export async function fetchAzkarCollection(collection: AzkarCollection) {
  const cached = await getCachedContent<z.infer<typeof azkarSchema>>('azkar', collection);
  if (cached) {
    return cached;
  }

  try {
    const remote = await jsonRequest(`/api/azkar/${collection}`, azkarSchema);
    await putCachedContent('azkar', collection, remote);
    return remote;
  } catch {
    const fallback = fallbackAzkar[collection];
    await putCachedContent('azkar', collection, fallback);
    return fallback;
  }
}
