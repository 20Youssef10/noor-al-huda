import { CalculationMethod, Coordinates, PrayerTimes, Qibla } from 'adhan';
import { z } from 'zod';

import { jsonRequest } from '../../lib/api';
import { formatClock } from '../../lib/formatting';
import { type AppLocation, type PrayerName, type PrayerTimesData } from '../../types/domain';

const prayerSchema = z.object({
  locationLabel: z.string(),
  method: z.string(),
  source: z.enum(['worker', 'local']),
  prayers: z.object({
    fajr: z.string(),
    sunrise: z.string(),
    dhuhr: z.string(),
    asr: z.string(),
    maghrib: z.string(),
    isha: z.string(),
  }),
  qiblaDegrees: z.number(),
  nextPrayer: z
    .object({
      name: z.enum(['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha']),
      at: z.string(),
      minutesUntil: z.number(),
    })
    .nullable(),
});

type CalculationMethodName = 'ummAlQura' | 'egyptian' | 'karachi';

function resolveCalculationMethod(method: string) {
  switch (method as CalculationMethodName) {
    case 'egyptian':
      return CalculationMethod.Egyptian();
    case 'karachi':
      return CalculationMethod.Karachi();
    case 'ummAlQura':
    default:
      return CalculationMethod.UmmAlQura();
  }
}

function computeNextPrayer(
  entries: Array<[PrayerName, Date]>,
  location: AppLocation,
  method: string
) {
  const now = new Date();
  const upcoming = entries.find(([, value]) => value.getTime() > now.getTime());

  if (upcoming) {
    return {
      name: upcoming[0],
      at: formatClock(upcoming[1]),
      minutesUntil: Math.max(0, Math.round((upcoming[1].getTime() - now.getTime()) / 60000)),
    };
  }

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextDay = buildLocalPrayerData(tomorrow, location, method);
  return nextDay.nextPrayer;
}

export function buildLocalPrayerData(
  date: Date,
  location: AppLocation,
  method: string
): PrayerTimesData {
  const coordinates = new Coordinates(location.latitude, location.longitude);
  const params = resolveCalculationMethod(method);
  const prayerTimes = new PrayerTimes(coordinates, date, params);

  const entries: Array<[PrayerName, Date]> = [
    ['fajr', prayerTimes.fajr],
    ['sunrise', prayerTimes.sunrise],
    ['dhuhr', prayerTimes.dhuhr],
    ['asr', prayerTimes.asr],
    ['maghrib', prayerTimes.maghrib],
    ['isha', prayerTimes.isha],
  ];

  return {
    locationLabel: location.label,
    method,
    source: 'local',
    prayers: Object.fromEntries(entries.map(([name, value]) => [name, formatClock(value)])) as PrayerTimesData['prayers'],
    qiblaDegrees: Number(Qibla(coordinates).toFixed(1)),
    nextPrayer: computeNextPrayer(entries, location, method),
  };
}

export async function fetchPrayerTimes(location: AppLocation, method: string) {
  try {
    return await jsonRequest(
      `/api/prayer-times?lat=${location.latitude}&lng=${location.longitude}&method=${method}`,
      prayerSchema
    );
  } catch {
    return buildLocalPrayerData(new Date(), location, method);
  }
}
