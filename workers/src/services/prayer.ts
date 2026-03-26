import { CalculationMethod, Coordinates, PrayerTimes, Qibla } from 'adhan';

import { readCache, writeCache } from './cache';
import { type Env, type PrayerResponse } from '../types';

type PrayerMethod = 'ummAlQura' | 'egyptian' | 'karachi';
type PrayerName = NonNullable<PrayerResponse['nextPrayer']>['name'];

const methodMap: Record<PrayerMethod, { adhanId: number; adhanFactory: () => ReturnType<typeof CalculationMethod.UmmAlQura> }> = {
  ummAlQura: { adhanId: 4, adhanFactory: () => CalculationMethod.UmmAlQura() },
  egyptian: { adhanId: 5, adhanFactory: () => CalculationMethod.Egyptian() },
  karachi: { adhanId: 1, adhanFactory: () => CalculationMethod.Karachi() }
};

function formatClock(value: Date): string {
  return new Intl.DateTimeFormat('ar-EG', { hour: 'numeric', minute: '2-digit' }).format(value);
}

function computeNextPrayer(entries: Array<[PrayerName, Date]>) {
  const now = Date.now();
  const next = entries.find(([, date]) => date.getTime() > now);
  if (!next) {
    return null;
  }

  return {
    name: next[0],
    at: formatClock(next[1]),
    minutesUntil: Math.max(0, Math.round((next[1].getTime() - now) / 60000))
  };
}

function buildLocalPrayerPayload(lat: number, lng: number, method: PrayerMethod, locationLabel: string): PrayerResponse {
  const coordinates = new Coordinates(lat, lng);
  const params = methodMap[method].adhanFactory();
  const prayerTimes = new PrayerTimes(coordinates, new Date(), params);
  const entries = [
    ['fajr', prayerTimes.fajr],
    ['sunrise', prayerTimes.sunrise],
    ['dhuhr', prayerTimes.dhuhr],
    ['asr', prayerTimes.asr],
    ['maghrib', prayerTimes.maghrib],
    ['isha', prayerTimes.isha]
  ] as Array<[PrayerName, Date]>;

  return {
    locationLabel,
    method,
    source: 'local',
    prayers: {
      fajr: formatClock(prayerTimes.fajr),
      sunrise: formatClock(prayerTimes.sunrise),
      dhuhr: formatClock(prayerTimes.dhuhr),
      asr: formatClock(prayerTimes.asr),
      maghrib: formatClock(prayerTimes.maghrib),
      isha: formatClock(prayerTimes.isha)
    },
    qiblaDegrees: Number(Qibla(coordinates).toFixed(1)),
    nextPrayer: computeNextPrayer(entries)
  };
}

export async function getPrayerTimes(env: Env, lat: number, lng: number, method: PrayerMethod) {
  const today = new Date().toISOString().slice(0, 10);
  const cacheKey = `prayer:${lat.toFixed(3)}:${lng.toFixed(3)}:${today}:${method}`;
  const cached = await readCache<PrayerResponse>(env, 'PRAYER_CACHE', cacheKey);
  if (cached) {
    return cached;
  }

  const mapping = methodMap[method];
  const local = buildLocalPrayerPayload(lat, lng, method, 'الموقع الحالي');

  try {
    const response = await fetch(
      `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=${mapping.adhanId}`
    );
    if (!response.ok) {
      throw new Error('AlAdhan fetch failed');
    }

    const json = await response.json() as {
      data?: {
        timings?: Record<string, string>;
        meta?: { timezone?: string };
      };
    };

    const timings = json.data?.timings;
    if (!timings) {
      throw new Error('Missing timings payload');
    }

    const payload: PrayerResponse = {
      ...local,
      source: 'worker',
      prayers: {
        fajr: timings.Fajr ?? local.prayers.fajr,
        sunrise: timings.Sunrise ?? local.prayers.sunrise,
        dhuhr: timings.Dhuhr ?? local.prayers.dhuhr,
        asr: timings.Asr ?? local.prayers.asr,
        maghrib: timings.Maghrib ?? local.prayers.maghrib,
        isha: timings.Isha ?? local.prayers.isha
      }
    };

    await writeCache(env, 'PRAYER_CACHE', cacheKey, payload, 86400);
    return payload;
  } catch {
    await writeCache(env, 'PRAYER_CACHE', cacheKey, local, 3600);
    return local;
  }
}
