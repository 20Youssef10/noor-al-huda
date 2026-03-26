import { NativeModules } from 'react-native';

type LiveActivityBridge = {
  startActivity?: (name: string, payload: string) => Promise<void> | void;
  updateActivity?: (name: string, payload: string) => Promise<void> | void;
  endActivity?: (name: string) => Promise<void> | void;
};

const bridge = NativeModules.LiveActivities as LiveActivityBridge | undefined;

export async function startPlaybackActivity(payload: Record<string, unknown>) {
  await bridge?.startActivity?.('quran_playback', JSON.stringify(payload));
}

export async function updatePlaybackActivity(payload: Record<string, unknown>) {
  await bridge?.updateActivity?.('quran_playback', JSON.stringify(payload));
}

export async function stopPlaybackActivity() {
  await bridge?.endActivity?.('quran_playback');
}
