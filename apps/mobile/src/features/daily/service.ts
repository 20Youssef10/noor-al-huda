import { z } from 'zod';

import { fallbackDailyContent } from '../../data/fallback';

const dailyContentSchema = z.object({
  ayah: z.object({
    surahId: z.number(),
    surahName: z.string(),
    reference: z.string(),
    text: z.string(),
  }),
  hadith: z.object({
    id: z.string(),
    title: z.string(),
    text: z.string(),
    source: z.string(),
  }),
});

const ayahSchema = z.object({
  verse: z.object({
    verse_key: z.string(),
    text_uthmani: z.string(),
  }),
});

const hadithListSchema = z.object({
  data: z.array(z.object({ id: z.string(), title: z.string() })),
  meta: z.object({ total_items: z.number() }),
});

const hadithDetailSchema = z.object({
  id: z.string(),
  title: z.string(),
  hadeeth: z.string(),
  attribution: z.string().optional(),
  grade: z.string().optional(),
});

function getDailyVerseKey() {
  const now = new Date();
  const dayOfYear = Math.max(1, Math.ceil((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 86400000));
  return `${(dayOfYear % 114) + 1}:1`;
}

export async function fetchDailyContent() {
  try {
    const now = new Date();
    const dayOfYear = Math.max(1, Math.ceil((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 86400000));
    const verseKey = getDailyVerseKey();
    const [ayahResponse, hadithListResponse] = await Promise.all([
      fetch(`https://api.quran.com/api/v4/verses/by_key/${verseKey}?language=ar&translations=131&words=false&fields=text_uthmani`),
      fetch(`https://hadeethenc.com/api/v1/hadeeths/list/?language=ar&category_id=1&page=${(dayOfYear % 197) + 1}&per_page=1`),
    ]);
    if (!ayahResponse.ok || !hadithListResponse.ok) {
      throw new Error('daily-upstream-failed');
    }

    const ayah = ayahSchema.parse(await ayahResponse.json());
    const hadithList = hadithListSchema.parse(await hadithListResponse.json());
    const hadithSummary = hadithList.data[0];
    if (!hadithSummary) {
      throw new Error('daily-hadith-missing');
    }

    const hadithDetailResponse = await fetch(`https://hadeethenc.com/api/v1/hadeeths/one/?language=ar&id=${hadithSummary.id}`);
    if (!hadithDetailResponse.ok) {
      throw new Error('daily-hadith-detail-failed');
    }
    const hadith = hadithDetailSchema.parse(await hadithDetailResponse.json());

    return dailyContentSchema.parse({
      ayah: {
        surahId: Number((ayah.verse.verse_key.split(':')[0] ?? '2')),
        surahName: `سورة ${ayah.verse.verse_key.split(':')[0] ?? '2'}`,
        reference: ayah.verse.verse_key,
        text: ayah.verse.text_uthmani,
      },
      hadith: {
        id: hadith.id,
        title: hadith.title,
        text: hadith.hadeeth,
        source: hadith.attribution ?? hadith.grade ?? 'موسوعة الحديث',
      },
    });
  } catch {
    return fallbackDailyContent;
  }
}
