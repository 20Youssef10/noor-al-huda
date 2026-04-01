import { z } from 'zod';

import { fallbackRadios } from '../../data/fallback';

const radioSchema = z.array(
  z.object({
    id: z.string(),
    name: z.string(),
    country: z.string(),
    description: z.string(),
    streamUrl: z.string(),
  })
);

const mp3QuranSchema = z.object({
  radios: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      url: z.string(),
    })
  ),
});

export async function fetchRadios() {
  try {
    const response = await fetch('https://www.mp3quran.net/api/v3/radios?language=ar');
    if (!response.ok) {
      throw new Error(`radios-failed-${response.status}`);
    }
    const payload = mp3QuranSchema.parse(await response.json());
    return radioSchema.parse(
      payload.radios.slice(0, 24).map((radio) => ({
        id: String(radio.id),
        name: radio.name,
        country: 'العالم الإسلامي',
        description: 'بث مباشر من مكتبة MP3Quran.',
        streamUrl: radio.url,
      }))
    );
  } catch {
    return fallbackRadios;
  }
}
