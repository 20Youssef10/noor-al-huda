import { Stack } from 'expo-router';

import { theme } from '../../src/lib/theme';

export default function FeaturesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    />
  );
}
