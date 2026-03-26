import { z } from 'zod';

import { fallbackRadios } from '../../data/fallback';
import { jsonRequest } from '../../lib/api';

const radioSchema = z.array(
  z.object({
    id: z.string(),
    name: z.string(),
    country: z.string(),
    description: z.string(),
    streamUrl: z.string(),
  })
);

export async function fetchRadios() {
  try {
    return await jsonRequest('/api/radios', radioSchema);
  } catch {
    return fallbackRadios;
  }
}
