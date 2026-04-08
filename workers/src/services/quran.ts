import { readCache, writeCache } from './cache';
import { buildFallbackSurahDetail, fallbackSurahs } from '../data/fallback';
import { type Env } from '../types';

export async function getSurahList(env: Env) {
  const cached = await readCache<typeof fallbackSurahs>(env, 'QURAN_CACHE', 'surahs:list');
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch('https://api.quran.com/api/v4/chapters?language=en');
    if (!response.ok) {
      throw new Error('Quran.com chapters failed');
    }

    const json = await response.json() as {
      chapters?: Array<{
        id: number;
        name_arabic: string;
        name_simple: string;
        verses_count: number;
        revelation_place: string;
        translated_name?: { name?: string };
      }>;
    };

    const payload = (json.chapters ?? []).map((chapter) => ({
      id: chapter.id,
      name: chapter.name_arabic,
      transliteration: chapter.name_simple,
      englishName: chapter.translated_name?.name ?? chapter.name_simple,
      versesCount: chapter.verses_count,
      revelation: chapter.revelation_place === 'madinah' ? 'Medinan' : 'Meccan'
    }));

    if (!payload.length) {
      throw new Error('Empty chapter list');
    }

    await writeCache(env, 'QURAN_CACHE', 'surahs:list', payload);
    return payload;
  } catch {
    await writeCache(env, 'QURAN_CACHE', 'surahs:list', fallbackSurahs);
    return fallbackSurahs;
  }
}

export async function getSurahDetail(env: Env, id: number) {
  const cacheKey = `surah:v2:${id}`;
  const cached = await readCache(env, 'QURAN_CACHE', cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(
      `https://api.quran.com/api/v4/verses/by_chapter/${id}?language=en&words=false&translations=131&fields=text_uthmani,verse_key&per_page=300`
    );
    if (!response.ok) {
      throw new Error('Quran.com surah detail failed');
    }

    const list = await getSurahList(env);
    const surah = list.find((item) => item.id === id) ?? fallbackSurahs[0]!;
    const json = await response.json() as {
      verses?: Array<{
        verse_number: number;
        text_uthmani: string;
        translations?: Array<{ text?: string }>;
      }>;
    };

    const payload = {
      surah,
      verses: (json.verses ?? []).map((verse) => ({
        number: verse.verse_number,
        arabicText: verse.text_uthmani,
        translation: verse.translations?.[0]?.text ?? ''
      })),
      audioUrl: `https://server8.mp3quran.net/afs/${String(id).padStart(3, '0')}.mp3`
    };

    if (!payload.verses.length) {
      throw new Error('Empty surah payload');
    }

    await writeCache(env, 'QURAN_CACHE', cacheKey, payload);
    return payload;
  } catch {
    const fallback = buildFallbackSurahDetail(id);
    await writeCache(env, 'QURAN_CACHE', cacheKey, fallback);
    return fallback;
  }
}
