import { Platform } from 'react-native';

if (Platform.OS !== 'web') {
  const TrackPlayer = require('react-native-track-player').default;
  TrackPlayer.registerPlaybackService(() => require('./src/features/player/playbackService').playbackService);
}

import 'expo-router/entry';
