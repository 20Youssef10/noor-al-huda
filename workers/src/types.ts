export interface Env {
  PRAYER_CACHE: KVNamespace;
  QURAN_CACHE: KVNamespace;
  HADITH_CACHE: KVNamespace;
  RADIO_LIST: KVNamespace;
  AZKAR_CACHE: KVNamespace;
  AI?: {
    run(model: string, payload: unknown): Promise<unknown>;
  };
  QURAN_VECTORS?: {
    query(vector: number[], options: { topK: number; returnMetadata: 'all' | 'none' }): Promise<{
      matches: Array<{ score: number; metadata?: Record<string, unknown> }>;
    }>;
  };
  MEDIA_BUCKET?: R2Bucket;
  FIREBASE_PROJECT_ID: string;
}

export type PrayerResponse = {
  locationLabel: string;
  method: string;
  source: 'worker' | 'local';
  prayers: {
    fajr: string;
    sunrise: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
  };
  qiblaDegrees: number;
  nextPrayer: {
    name: 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
    at: string;
    minutesUntil: number;
  } | null;
};

export interface TajweedWordResult {
  expected: string;
  got: string;
  status: 'correct' | 'missing' | 'extra' | 'changed';
}

export interface TajweedError {
  type: 'ghunna' | 'madd' | 'qalqala' | 'idgham' | 'ikhfa' | 'extra_word' | 'missing_word';
  position: number;
  expected: string;
  got: string;
  description_ar: string;
}

export interface TajweedAnalysis {
  score: number;
  accuracy: number;
  words: TajweedWordResult[];
  errors: TajweedError[];
  encouragement_ar: string;
}
