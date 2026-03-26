import TrackPlayer, { type Track } from 'react-native-track-player';

import { schedulePrayerReminderAsync } from '../../lib/notifications';
import { storage } from '../../lib/mmkv';

export interface SleepConfig {
  durationMinutes: 15 | 30 | 45 | 60 | 90;
  fadeOutDuration: 120;
  wakeFajr: boolean;
  suggestionMode: 'ruqyah' | 'short_surahs' | 'current';
}

const SLEEP_SURAHS = [89, 90, 91, 92, 93, 94, 95, 96, 112, 113, 114];

function getFajrTimeMs() {
  const raw = storage.getString('today_prayer_times');
  if (!raw) return Date.now() + 6 * 60 * 60 * 1000;
  try {
    const payload = JSON.parse(raw) as { fajr?: string };
    const match = payload.fajr?.match(/(\d{1,2}):(\d{2})/);
    if (!match) return Date.now() + 6 * 60 * 60 * 1000;
    const date = new Date();
    date.setHours(Number(match[1]), Number(match[2]), 0, 0);
    return date.getTime();
  } catch {
    return Date.now() + 6 * 60 * 60 * 1000;
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildSleepQueue(surahNumbers: number[]): Track[] {
  return surahNumbers.map((surah) => ({
    id: `sleep-${surah}`,
    url: `https://server8.mp3quran.net/afs/${String(surah).padStart(3, '0')}.mp3`,
    title: `سورة ${surah}`,
    artist: 'نور الهدى',
  }));
}

export async function startSleepMode(config: SleepConfig) {
  if (config.suggestionMode !== 'current') {
    await TrackPlayer.reset();
    await TrackPlayer.add(buildSleepQueue(SLEEP_SURAHS));
  }

  const fadeStart = Math.max(0, (config.durationMinutes * 60 - config.fadeOutDuration) * 1000);
  setTimeout(() => {
    void (async () => {
      for (let level = 10; level >= 0; level -= 1) {
        await TrackPlayer.setVolume(level / 10);
        await sleep(config.fadeOutDuration * 100);
      }
      await TrackPlayer.pause();
    })();
  }, fadeStart);

  if (config.wakeFajr) {
    const fajrTime = getFajrTimeMs();
    const delay = fajrTime - Date.now();
    if (delay > 0) {
      await schedulePrayerReminderAsync('الفجر', 'حان وقت الفجر 🌅', new Date(fajrTime));
    }
  }
}
