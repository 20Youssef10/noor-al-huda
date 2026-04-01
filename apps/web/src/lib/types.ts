export type DailyPayload = {
  ayah: { text: string; reference: string; surahName: string };
  hadith: { title: string; text: string; source: string; id?: string };
};

export type RadioItem = {
  id: string;
  name: string;
  country: string;
  description: string;
  streamUrl?: string;
};

export type SurahSummary = {
  id: number;
  name: string;
  transliteration: string;
  englishName: string;
  versesCount: number;
  revelation: 'Meccan' | 'Medinan';
};

export type SurahDetail = {
  surah: SurahSummary;
  verses: Array<{
    number: number;
    arabicText: string;
    translation: string;
  }>;
  audioUrl?: string;
};

export type PrayerResponse = {
  locationLabel: string;
  prayers: Record<string, string>;
  nextPrayer: { name: string; at: string; minutesUntil: number } | null;
  qiblaDegrees: number;
};

export type HalalResult = {
  found: boolean;
  name?: string;
  verdict?: 'haram' | 'doubtful' | 'likely_halal';
  ingredients_raw?: string;
  disclaimer?: string;
};

export type SemanticResult = {
  surah: number;
  ayah: number;
  text_ar: string;
  surah_name: string;
  score: number;
};

export type DuaResponse = {
  dua: string;
  sources: string[];
};
