import * as SQLite from 'expo-sqlite';

type CacheRow = {
  payload: string;
  updated_at: string;
};

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function getDb() {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync('noor-al-huda.db');
  }
  return databasePromise;
}

export async function initDatabaseAsync() {
  const db = await getDb();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS content_cache (
      bucket TEXT NOT NULL,
      key TEXT NOT NULL,
      payload TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      PRIMARY KEY(bucket, key)
    );

    CREATE TABLE IF NOT EXISTS bookmarks (
      surah_id INTEGER NOT NULL,
      surah_name TEXT NOT NULL,
      ayah_number INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      PRIMARY KEY(surah_id, ayah_number)
    );
  `);
}

export async function getCachedContent<T>(bucket: string, key: string): Promise<T | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<CacheRow>(
    'SELECT payload, updated_at FROM content_cache WHERE bucket = ? AND key = ?',
    bucket,
    key
  );

  if (!row) {
    return null;
  }

  try {
    return JSON.parse(row.payload) as T;
  } catch {
    return null;
  }
}

export async function putCachedContent(bucket: string, key: string, payload: unknown) {
  const db = await getDb();
  await db.runAsync(
    `INSERT OR REPLACE INTO content_cache (bucket, key, payload, updated_at)
     VALUES (?, ?, ?, ?)`,
    bucket,
    key,
    JSON.stringify(payload),
    new Date().toISOString()
  );
}
