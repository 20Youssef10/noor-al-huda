import { useAudioPlayer as useExpoAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { useCallback, useEffect, useMemo, useState } from 'react';

export function useAudioPlayer() {
  const player = useExpoAudioPlayer(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const isPlaying = !player.paused && player.playing;

  const play = useCallback(async (url: string) => {
    setIsLoading(true);
    try {
      await setAudioModeAsync({
        playsInSilentMode: true,
        interruptionMode: 'doNotMix',
        allowsRecording: false,
        shouldPlayInBackground: true,
        shouldRouteThroughEarpiece: false,
      });
      if (currentUrl !== url) {
        player.replace({ uri: url });
      }
      setCurrentUrl(url);
      player.play();
    } finally {
      setIsLoading(false);
    }
  }, [currentUrl, player]);

  const toggle = useCallback(async () => {
    if (player.playing && !player.paused) {
      player.pause();
    } else {
      player.play();
    }
  }, [player]);

  const stop = useCallback(async () => {
    player.pause();
    player.seekTo(0);
    setCurrentUrl(null);
  }, [player]);

  useEffect(() => {
    return () => {
      player.remove();
    };
  }, [player]);

  return { currentUrl, isLoading, isPlaying, play, stop, toggle };
}
