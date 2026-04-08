import * as Crypto from 'expo-crypto';
import * as SQLite from 'expo-sqlite';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { z } from 'zod';

import { jsonRequest } from '../../lib/api';
import { theme } from '../../lib/theme';
import { Page, PrimaryButton, SurfaceCard } from '../../components/ui';

const reflectionSchema = z.object({ reflection: z.string() });

function xorHexEncode(input: string, key: string) {
  return Array.from(input).map((char, index) => (char.charCodeAt(0) ^ key.charCodeAt(index % key.length)).toString(16).padStart(2, '0')).join('');
}

export function RuyaJournalScreen() {
  const [pin, setPin] = useState('');
  const [dream, setDream] = useState('');
  const [reflection, setReflection] = useState('');

  async function saveEntry() {
    try {
      const db = await SQLite.openDatabaseAsync('noor-al-huda.db');
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS ruya_journal (
          id TEXT PRIMARY KEY DEFAULT (hex(randomblob(8))),
          hijri_date TEXT NOT NULL,
          content TEXT NOT NULL,
          reflection TEXT,
          mood TEXT,
          created_at INTEGER DEFAULT (unixepoch())
        );
      `);
      const key = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, pin || '0000');
      await db.runAsync(
        'INSERT INTO ruya_journal (hijri_date, content, reflection, mood) VALUES (?, ?, ?, ?)',
        new Intl.DateTimeFormat('en-TN-u-ca-islamic', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()),
        xorHexEncode(dream, key),
        xorHexEncode(reflection, key),
        'neutral'
      );
      Alert.alert('تم الحفظ', 'حُفظت الرؤيا محلياً بشكل مشفر.');
    } catch (error) {
      Alert.alert('تعذر الحفظ', error instanceof Error ? error.message : 'حدث خطأ أثناء الحفظ.');
    }
  }

  async function requestReflection() {
    try {
      const payload = await jsonRequest('/api/ruya/reflect', reflectionSchema, {
        method: 'POST',
        body: JSON.stringify({ dream }),
      });
      setReflection(payload.reflection);
    } catch (error) {
      Alert.alert('تعذر تحميل التأمل', error instanceof Error ? error.message : 'حدث خطأ أثناء إنشاء التأمل.');
    }
  }

  return (
    <Page>
      <SurfaceCard accent="blue">
        <Text style={styles.title}>يومية الرؤى</Text>
        <TextInput value={pin} onChangeText={setPin} placeholder="رمز PIN من 4 أرقام" placeholderTextColor={theme.colors.creamFaint} secureTextEntry style={styles.input} />
        <TextInput value={dream} onChangeText={setDream} placeholder="اكتب رؤياك هنا..." placeholderTextColor={theme.colors.creamFaint} multiline style={[styles.input, styles.textarea]} />
        <View style={styles.actions}>
          <PrimaryButton label="تأمل إسلامي" onPress={() => void requestReflection()} tone="emerald" disabled={!dream.trim()} />
          <PrimaryButton label="حفظ" onPress={() => void saveEntry()} disabled={!dream.trim() || !pin.trim()} />
        </View>
        {reflection ? <Text style={styles.reflection}>{reflection}</Text> : null}
      </SurfaceCard>
    </Page>
  );
}

const styles = StyleSheet.create({
  title: { color: theme.colors.goldLight, fontFamily: theme.fonts.display, fontSize: 26, textAlign: 'right' },
  input: { borderRadius: 16, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceStrong, color: theme.colors.cream, padding: 14, fontFamily: theme.fonts.body, textAlign: 'right' },
  textarea: { minHeight: 140, textAlignVertical: 'top' },
  actions: { flexDirection: 'row-reverse', gap: 10 },
  reflection: { color: theme.colors.cream, fontFamily: theme.fonts.arabic, fontSize: 20, lineHeight: 34, textAlign: 'right' },
});
