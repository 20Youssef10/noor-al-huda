import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';
import { z } from 'zod';

import { Page, PrimaryButton, SectionHeader, SurfaceCard } from '../../src/components/ui';
import { jsonRequest } from '../../src/lib/api';
import { theme } from '../../src/lib/theme';

const moodSchema = z.object({
  suggestion: z.string(),
  ayah: z.string(),
  dhikr: z.string(),
});

export default function MoodScreen() {
  const [mood, setMood] = useState('متعب');
  const mutation = useMutation({
    mutationFn: () =>
      jsonRequest('/api/mood/suggest', moodSchema, {
        method: 'POST',
        body: JSON.stringify({ mood }),
      }),
  });

  return (
    <Page>
      <SectionHeader title="تحليل المزاج" subtitle="اقتراح ذكر وآية بناءً على شعورك" />
      <SurfaceCard accent="blue">
        <TextInput style={styles.input} value={mood} onChangeText={setMood} placeholder="مثال: قلق، متعب، حزين" placeholderTextColor={theme.colors.creamFaint} textAlign="right" />
        <PrimaryButton label={mutation.isPending ? 'جاري التحليل...' : 'اقترح لي'} onPress={() => mutation.mutate()} disabled={!mood.trim() || mutation.isPending} tone="emerald" />
        {mutation.data ? (
          <>
            <Text style={styles.text}>{mutation.data.suggestion}</Text>
            <Text style={styles.highlight}>{mutation.data.ayah}</Text>
            <Text style={styles.text}>{mutation.data.dhikr}</Text>
          </>
        ) : null}
      </SurfaceCard>
    </Page>
  );
}

const styles = StyleSheet.create({
  input: { borderRadius: 16, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceStrong, color: theme.colors.cream, padding: 14, fontFamily: theme.fonts.body },
  text: { color: theme.colors.cream, fontFamily: theme.fonts.body, fontSize: 15, lineHeight: 24, textAlign: 'right' },
  highlight: { color: theme.colors.goldLight, fontFamily: theme.fonts.arabic, fontSize: 22, lineHeight: 36, textAlign: 'right' },
});
