import { type Env } from '../types';

type CacheBinding = keyof Pick<Env, 'PRAYER_CACHE' | 'QURAN_CACHE' | 'HADITH_CACHE' | 'RADIO_LIST' | 'AZKAR_CACHE'>;

export async function readCache<T>(env: Env, binding: CacheBinding, key: string): Promise<T | null> {
  const raw = await env[binding].get(key);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function writeCache(
  env: Env,
  binding: CacheBinding,
  key: string,
  payload: unknown,
  expirationTtl?: number
) {
  await env[binding].put(key, JSON.stringify(payload), expirationTtl ? { expirationTtl } : undefined);
}
