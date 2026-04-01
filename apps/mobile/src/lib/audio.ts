import {
  createAudioPlayer,
  createAudioPlaylist,
  setAudioModeAsync,
  type AudioPlayer,
  type AudioPlaylist,
  type AudioSource,
} from 'expo-audio';

import { useAppStore } from '../store/app-store';
import { schedulePrayerReminderAsync } from './notifications';
import { storage } from './mmkv';

export const sharedPlayer = createAudioPlayer(null, { updateInterval: 250 });
const sleepPlaylist = createAudioPlaylist({ sources: [], updateInterval: 500, loop: 'none' });

const SLEEP_SURAHS = [89, 90, 91, 92, 93, 94, 95, 96, 112, 113, 114];

async function configureAudioMode(options?: { allowsRecording?: boolean; background?: boolean }) {
  await setAudioModeAsync({
    playsInSilentMode: true,
    interruptionMode: 'doNotMix',
    allowsRecording: options?.allowsRecording ?? false,
    shouldPlayInBackground: options?.background ?? true,
    shouldRouteThroughEarpiece: false,
  });
}

function buildSleepSources(): AudioSource[] {
  return SLEEP_SURAHS.map((surah) => ({
    uri: `https://server8.mp3quran.net/afs/${String(surah).padStart(3, '0')}.mp3`,
    name: `سورة ${surah}`,
  }));
}

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

export async function playSharedAudio(url: string, label?: string) {
  await configureAudioMode({ allowsRecording: false, background: true });
  if (useAppStore.getState().currentAudioUrl !== url) {
    sharedPlayer.replace({ uri: url, name: label });
  }
  useAppStore.getState().setCurrentAudio(url, label ?? null);
  sharedPlayer.play();
}

export async function toggleSharedAudio() {
  if (sharedPlayer.playing && !sharedPlayer.paused) {
    sharedPlayer.pause();
  } else {
    sharedPlayer.play();
  }
}

export async function stopSharedAudio() {
  sharedPlayer.pause();
  await sharedPlayer.seekTo(0);
  useAppStore.getState().setCurrentAudio(null, null);
}

export async function setSharedVolume(level: number) {
  sharedPlayer.volume = level;
}

export function cleanupSharedAudio() {
  sharedPlayer.remove();
  sleepPlaylist.destroy();
}

export interface SleepConfig {
  durationMinutes: 15 | 30 | 45 | 60 | 90;
  fadeOutDuration: 120;
  wakeFajr: boolean;
  suggestionMode: 'ruqyah' | 'short_surahs' | 'current';
}

export async function startSleepMode(config: SleepConfig) {
  await configureAudioMode({ allowsRecording: false, background: true });

  let target: AudioPlayer | AudioPlaylist = sharedPlayer;

  if (config.suggestionMode !== 'current') {
    await stopSharedAudio();
    sleepPlaylist.clear();
    buildSleepSources().forEach((source) => sleepPlaylist.add(source));
    sleepPlaylist.play();
    target = sleepPlaylist;
  }

  const fadeStart = Math.max(0, (config.durationMinutes * 60 - config.fadeOutDuration) * 1000);
  setTimeout(() => {
    void (async () => {
      for (let level = 10; level >= 0; level -= 1) {
        target.volume = level / 10;
        await sleep(config.fadeOutDuration * 100);
      }
      target.pause();
      if (target === sharedPlayer) {
        useAppStore.getState().setCurrentAudio(null, null);
      }
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
