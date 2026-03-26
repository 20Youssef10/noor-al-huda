const memoryCache = new Map<string, string>();

function cacheKey(bucket: string, key: string) {
  return `${bucket}:${key}`;
}

export async function initDatabaseAsync() {
  return;
}

export async function getCachedContent<T>(bucket: string, key: string): Promise<T | null> {
  const raw = memoryCache.get(cacheKey(bucket, key));
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function putCachedContent(bucket: string, key: string, payload: unknown) {
  memoryCache.set(cacheKey(bucket, key), JSON.stringify(payload));
}
