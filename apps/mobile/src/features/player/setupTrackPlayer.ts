import TrackPlayer, { AppKilledPlaybackBehavior, Capability, RepeatMode } from 'react-native-track-player';

let hasSetup = false;

export async function setupTrackPlayer() {
  if (hasSetup) return;
  await TrackPlayer.setupPlayer();
  await TrackPlayer.setRepeatMode(RepeatMode.Off);
  await TrackPlayer.updateOptions({
    android: {
      appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
    },
    capabilities: [Capability.Play, Capability.Pause, Capability.Stop],
    compactCapabilities: [Capability.Play, Capability.Pause],
    notificationCapabilities: [Capability.Play, Capability.Pause, Capability.Stop],
    progressUpdateEventInterval: 1,
  });
  hasSetup = true;
}
