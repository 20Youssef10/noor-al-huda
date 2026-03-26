import { Audio } from 'expo-av';
import { useCallback, useEffect, useRef, useState } from 'react';

export function useAudioPlayer() {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);

  const unload = useCallback(async () => {
    if (!soundRef.current) return;
    await soundRef.current.unloadAsync();
    soundRef.current.setOnPlaybackStatusUpdate(null);
    soundRef.current = null;
    setIsPlaying(false);
    setCurrentUrl(null);
  }, []);

  const play = useCallback(async (url: string) => {
    setIsLoading(true);
    try {
      if (currentUrl === url && soundRef.current) {
        await soundRef.current.playAsync();
        setIsPlaying(true);
        return;
      }
      await unload();
      const { sound } = await Audio.Sound.createAsync({ uri: url }, { shouldPlay: true });
      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) return;
        setIsPlaying(status.isPlaying);
      });
      soundRef.current = sound;
      setCurrentUrl(url);
      setIsPlaying(true);
    } finally {
      setIsLoading(false);
    }
  }, [currentUrl, unload]);

  const toggle = useCallback(async () => {
    if (!soundRef.current) return;
    const status = await soundRef.current.getStatusAsync();
    if (!status.isLoaded) return;
    if (status.isPlaying) {
      await soundRef.current.pauseAsync();
      setIsPlaying(false);
    } else {
      await soundRef.current.playAsync();
      setIsPlaying(true);
    }
  }, []);

  useEffect(() => () => { void unload(); }, [unload]);

  return { currentUrl, isLoading, isPlaying, play, stop: unload, toggle };
}
