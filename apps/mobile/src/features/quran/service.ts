import { z } from 'zod';

import { buildFallbackSurahDetail, fallbackSurahs } from '../../data/fallback';
import { getCachedContent, putCachedContent } from '../../lib/sqlite';

const surahSummarySchema = z.object({
  id: z.number(),
  name: z.string(),
  transliteration: z.string(),
  englishName: z.string(),
  versesCount: z.number(),
  revelation: z.enum(['Meccan', 'Medinan']),
});

const surahListSchema = z.array(surahSummarySchema);

const surahDetailSchema = z.object({
  surah: surahSummarySchema,
  verses: z.array(
    z.object({
      number: z.number(),
      arabicText: z.string(),
      translation: z.string(),
    })
  ),
  audioUrl: z.string().optional(),
});

const quranChaptersSchema = z.object({
  chapters: z.array(
    z.object({
      id: z.number(),
      name_arabic: z.string(),
      name_simple: z.string(),
      verses_count: z.number(),
      revelation_place: z.enum(['makkah', 'madinah']),
      translated_name: z.object({ name: z.string() }).optional(),
    })
  ),
});

const quranVersesSchema = z.object({
  verses: z.array(
    z.object({
      verse_number: z.number(),
      text_uthmani: z.string(),
      translations: z.array(z.object({ text: z.string().optional() })).optional(),
    })
  ),
});

export async function fetchSurahList() {
  try {
    const response = await fetch('https://api.quran.com/api/v4/chapters?language=en');
    if (!response.ok) {
      throw new Error(`quran-chapters-failed-${response.status}`);
    }
    const payload = quranChaptersSchema.parse(await response.json());
    return surahListSchema.parse(
      payload.chapters.map((chapter) => ({
        id: chapter.id,
        name: chapter.name_arabic,
        transliteration: chapter.name_simple,
        englishName: chapter.translated_name?.name ?? chapter.name_simple,
        versesCount: chapter.verses_count,
        revelation: chapter.revelation_place === 'madinah' ? 'Medinan' : 'Meccan',
      }))
    );
  } catch {
    return fallbackSurahs;
  }
}

export async function fetchSurahDetail(surahId: number) {
  const cacheKey = `v2:${surahId}`;
  const cached = await getCachedContent<z.infer<typeof surahDetailSchema>>('surah', cacheKey);

  try {
    const [surahList, versesResponse] = await Promise.all([
      fetchSurahList(),
      fetch(`https://api.quran.com/api/v4/verses/by_chapter/${surahId}?language=en&words=false&translations=131&fields=text_uthmani,verse_key&per_page=300`),
    ]);
    if (!versesResponse.ok) {
      throw new Error(`quran-surah-failed-${versesResponse.status}`);
    }
    const versesPayload = quranVersesSchema.parse(await versesResponse.json());
    const surah = surahList.find((item) => item.id === surahId) ?? fallbackSurahs[0]!;
    const remote = surahDetailSchema.parse({
      surah,
      verses: versesPayload.verses.map((verse) => ({
        number: verse.verse_number,
        arabicText: verse.text_uthmani,
        translation: verse.translations?.[0]?.text ?? '',
      })),
      audioUrl: `https://server8.mp3quran.net/afs/${String(surahId).padStart(3, '0')}.mp3`,
    });
    await putCachedContent('surah', cacheKey, remote);
    return remote;
  } catch {
    if (cached) {
      return cached;
    }
    const fallback = buildFallbackSurahDetail(surahId);
    await putCachedContent('surah', cacheKey, fallback);
    return fallback;
  }
}
