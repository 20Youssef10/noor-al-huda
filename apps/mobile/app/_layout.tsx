import { Amiri_700Bold } from '@expo-google-fonts/amiri';
import {
  Cairo_400Regular,
  Cairo_700Bold,
  Cairo_900Black,
} from '@expo-google-fonts/cairo';
import { NotoNaskhArabic_400Regular } from '@expo-google-fonts/noto-naskh-arabic';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { I18nManager } from 'react-native';
import { useEffect } from 'react';

import { AppProviders } from '../src/providers/AppProviders';
import { theme } from '../src/lib/theme';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Amiri_700Bold,
    Cairo_400Regular,
    Cairo_700Bold,
    Cairo_900Black,
    NotoNaskhArabic_400Regular,
  });

  useEffect(() => {
    if (!I18nManager.isRTL) {
      I18nManager.allowRTL(true);
    }
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AppProviders>
      <StatusBar style="light" backgroundColor={theme.colors.background} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="features" />
        <Stack.Screen name="quran/[surah]" />
        <Stack.Screen name="hadith/[id]" />
      </Stack>
    </AppProviders>
  );
}
