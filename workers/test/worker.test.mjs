import test from 'node:test';
import assert from 'node:assert/strict';

import app from '../dist/worker.mjs';

class MemoryKV {
  constructor() {
    this.store = new Map();
  }

  async get(key) {
    return this.store.get(key) ?? null;
  }

  async put(key, value) {
    this.store.set(key, value);
  }

  async delete(key) {
    this.store.delete(key);
  }
}

function createEnv() {
  return {
    PRAYER_CACHE: new MemoryKV(),
    QURAN_CACHE: new MemoryKV(),
    HADITH_CACHE: new MemoryKV(),
    RADIO_LIST: new MemoryKV(),
    AZKAR_CACHE: new MemoryKV(),
    FIREBASE_PROJECT_ID: 'noor-al-huda-260326',
  };
}

const realFetch = global.fetch;

test.afterEach(() => {
  global.fetch = realFetch;
});

test('health route returns project metadata', async () => {
  const response = await app.request('http://localhost/api/health', {}, createEnv());
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(payload.ok, true);
  assert.equal(payload.firebaseProjectId, 'noor-al-huda-260326');
});

test('radio route serves fallback data and caches it', async () => {
  const env = createEnv();
  const response = await app.request('http://localhost/api/radios', {}, env);
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.ok(Array.isArray(payload));
  assert.ok(payload.length > 0);
  assert.equal(typeof payload[0].name, 'string');
  assert.ok(await env.RADIO_LIST.get('radios:v2:all'));
});

test('quran routes return surah list and detail', async () => {
  const env = createEnv();
  global.fetch = async (url) => {
    const value = String(url);
    if (value.includes('/chapters?')) {
      return new Response(JSON.stringify({
        chapters: [{
          id: 1,
          name_arabic: 'الفاتحة',
          name_simple: 'Al-Fatihah',
          verses_count: 7,
          revelation_place: 'makkah',
          translated_name: { name: 'The Opening' },
        }],
      }), { status: 200 });
    }
    if (value.includes('/verses/by_chapter/1')) {
      return new Response(JSON.stringify({
        verses: [{
          verse_number: 1,
          text_uthmani: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
          translations: [{ text: 'In the name of Allah' }],
        }],
      }), { status: 200 });
    }
    throw new Error(`Unhandled fetch: ${value}`);
  };

  const listResponse = await app.request('http://localhost/api/quran/surahs', {}, env);
  const detailResponse = await app.request('http://localhost/api/quran/surah/1', {}, env);
  const listPayload = await listResponse.json();
  const detailPayload = await detailResponse.json();

  assert.equal(listResponse.status, 200);
  assert.equal(detailResponse.status, 200);
  assert.equal(listPayload[0].name, 'الفاتحة');
  assert.equal(detailPayload.surah.id, 1);
  assert.equal(detailPayload.verses[0].number, 1);
});

test('prayer route falls back locally when upstream fetch fails', async () => {
  global.fetch = async () => {
    throw new Error('offline');
  };

  const response = await app.request(
    'http://localhost/api/prayer-times?lat=21.4225&lng=39.8262&method=ummAlQura',
    {},
    createEnv()
  );
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(payload.source, 'local');
  assert.equal(typeof payload.prayers.fajr, 'string');
  assert.equal(typeof payload.qiblaDegrees, 'number');
});
