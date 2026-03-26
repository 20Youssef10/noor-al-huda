import { useCallback, useMemo, useState } from 'react';
import TrackPlayer, { Capability, Event, State, useActiveTrack, usePlaybackState, useTrackPlayerEvents, type AddTrack } from 'react-native-track-player';

function toTrack(url: string): AddTrack {
  return {
    id: url,
    url,
    title: 'نور الهدى',
    artist: 'Noor Al Huda',
  };
}

export function useAudioPlayer() {
  const [isLoading, setIsLoading] = useState(false);
  const activeTrack = useActiveTrack();
  const playbackState = usePlaybackState();

  useTrackPlayerEvents([Event.PlaybackError], () => {
    setIsLoading(false);
  });

  const currentUrl = useMemo(() => (typeof activeTrack?.url === 'string' ? activeTrack.url : null), [activeTrack?.url]);
  const isPlaying = playbackState.state === State.Playing;

  const play = useCallback(async (url: string) => {
    setIsLoading(true);
    try {
      if (currentUrl !== url) {
        await TrackPlayer.reset();
        await TrackPlayer.add(toTrack(url));
      }
      await TrackPlayer.play();
    } finally {
      setIsLoading(false);
    }
  }, [currentUrl]);

  const stop = useCallback(async () => {
    await TrackPlayer.stop();
    await TrackPlayer.reset();
  }, []);

  const toggle = useCallback(async () => {
    if (playbackState.state === State.Playing) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  }, [playbackState.state]);

  return {
    currentUrl,
    isLoading,
    isPlaying,
    play,
    stop,
    toggle,
  };
}
