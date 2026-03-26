import * as Crypto from 'expo-crypto';
import { useEffect, useState } from 'react';
import { AppState, StyleSheet, Text, TextInput, View } from 'react-native';

import { storage } from '../../lib/mmkv';
import { theme } from '../../lib/theme';
import { PrimaryButton, SurfaceCard } from '../../components/ui';

const KEY = 'kids_pin_hash';

async function hashPin(pin: string) {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, pin);
}

export function KidsPinGate({ onUnlocked }: { onUnlocked: () => void }) {
  const [pin, setPin] = useState('');

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') {
        storage.set('kids_mode_locked_at', String(Date.now()));
      }
    });
    return () => subscription.remove();
  }, []);

  async function submit() {
    const saved = storage.getString(KEY);
    const hashed = await hashPin(pin);
    if (!saved) {
      storage.set(KEY, hashed);
      onUnlocked();
      return;
    }
    if (saved === hashed) {
      onUnlocked();
    }
  }

  return (
    <SurfaceCard accent="emerald">
      <Text style={styles.title}>بوابة أولياء الأمور</Text>
      <TextInput value={pin} onChangeText={setPin} placeholder="أدخل رمزاً من 4 أرقام" placeholderTextColor={theme.colors.creamFaint} keyboardType="number-pad" secureTextEntry style={styles.input} />
      <PrimaryButton label="دخول" onPress={() => void submit()} disabled={pin.length < 4} tone="emerald" />
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  title: { color: theme.colors.goldLight, fontFamily: theme.fonts.display, fontSize: 24, textAlign: 'right' },
  input: { borderRadius: 16, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceStrong, color: theme.colors.cream, padding: 14, fontFamily: theme.fonts.body, textAlign: 'right' },
});
