// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Binding = any;

// Custom environment type for Cloudflare Workers
// This is different from Hono's built-in Env type which expects Bindings/Variables
export type Env = {
  // Bindings - Cloudflare Workers KV, R2, etc.
  PRAYER_CACHE: Binding;
  QURAN_CACHE: Binding;
  HADITH_CACHE: Binding;
  RADIO_LIST: Binding;
  AZKAR_CACHE: Binding;
  AI?: {
    run(model: string, payload: unknown): Promise<unknown>;
  };
  QURAN_VECTORS?: {
    query(vector: number[], options: { topK: number; returnMetadata: 'all' | 'none' }): Promise<{
      matches: Array<{ score: number; metadata?: Record<string, unknown> }>;
    }>;
  };
  MEDIA_BUCKET?: {
    get(key: string): Promise<{ body: ReadableStream } | null>;
    put(key: string, value: unknown): Promise<void>;
  };
  FIREBASE_PROJECT_ID: string;
  FIREBASE_WEB_API_KEY?: string;

  // Variables - custom context variables
  firebaseToken?: string;
  firebaseUserId?: string;
  firebaseUserEmail?: string | null;
};

// Re-export Hono's Env type for compatibility with Hono middleware
export type HonoEnv = {
  Bindings: {
    PRAYER_CACHE: Binding;
    QURAN_CACHE: Binding;
    HADITH_CACHE: Binding;
    RADIO_LIST: Binding;
    AZKAR_CACHE: Binding;
    AI?: {
      run(model: string, payload: unknown): Promise<unknown>;
    };
    QURAN_VECTORS?: {
      query(vector: number[], options: { topK: number; returnMetadata: 'all' | 'none' }): Promise<{
        matches: Array<{ score: number; metadata?: Record<string, unknown> }>;
      }>;
    };
    MEDIA_BUCKET?: {
      get(key: string): Promise<{ body: ReadableStream } | null>;
      put(key: string, value: unknown): Promise<void>;
    };
    FIREBASE_PROJECT_ID: string;
    FIREBASE_WEB_API_KEY?: string;
  };
  Variables: {
    firebaseToken?: string;
    firebaseUserId?: string;
    firebaseUserEmail?: string | null;
  };
};

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
