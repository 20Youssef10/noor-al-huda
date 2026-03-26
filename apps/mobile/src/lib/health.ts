import { z } from 'zod';

import { jsonRequest } from './api';

const healthSchema = z.object({
  ok: z.boolean(),
  service: z.string(),
  firebaseProjectId: z.string(),
});

export async function fetchBackendHealth() {
  return jsonRequest('/api/health', healthSchema);
}
