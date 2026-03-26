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
  assert.ok(await env.RADIO_LIST.get('radios:all'));
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
