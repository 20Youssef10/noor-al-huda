import { type AudioStatus } from 'expo-audio';
import { useCallback, useEffect, useState } from 'react';

import {
  playSharedAudio,
  stopSharedAudio,
  toggleSharedAudio,
  sharedPlayer,
} from '../lib/audio';
import { useAppStore } from '../store/app-store';

export function useAudioPlayer() {
  const [isLoading, setIsLoading] = useState(false);
  const currentUrl = useAppStore((state) => state.currentAudioUrl);
  const [status, setStatus] = useState<AudioStatus>(sharedPlayer.currentStatus);

  useEffect(() => {
    const subscription = sharedPlayer.addListener('playbackStatusUpdate', (nextStatus) => {
      setStatus(nextStatus);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const play = useCallback(async (url: string, label?: string) => {
    setIsLoading(true);
    try {
      await playSharedAudio(url, label);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const stop = useCallback(async () => {
    await stopSharedAudio();
  }, []);

  const toggle = useCallback(async () => {
    await toggleSharedAudio();
  }, []);

  return {
    currentUrl,
    isLoading,
    isPlaying: status.playing,
    play,
    stop,
    toggle,
    status,
  };
}
