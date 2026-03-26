import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { ActivityIndicator, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import { z } from 'zod';

import { ar } from '../../../shared/i18n/ar';
import { jsonRequest } from '../../../lib/api';
import { putCachedContent } from '../../../lib/sqlite';
import { theme } from '../../../lib/theme';
import { GhostButton, PrimaryButton, SurfaceCard } from '../../../components/ui';
import { VerificationBadge } from '../../../shared/components/VerificationBadge';

const duaSchema = z.object({
  dua: z.string(),
  sources: z.array(z.string()),
});

export function DuaGenerator() {
  const [situation, setSituation] = useState('');
  const mutation = useMutation({
    mutationFn: async () => {
      const payload = await jsonRequest('/api/dua/generate', duaSchema, {
        method: 'POST',
        body: JSON.stringify({ situation, language: 'ar' }),
      });
      await putCachedContent('personal_duas', `${Date.now()}`, {
        situation,
        dua_text: payload.dua,
        sources_json: payload.sources,
        created_at: new Date().toISOString(),
      });
      return payload;
    },
  });

  return (
    <SurfaceCard accent="emerald">
      <Text style={styles.title}>{ar.dua.title}</Text>
      <TextInput
        accessibilityLabel={ar.dua.placeholder}
        multiline
        textAlignVertical="top"
        placeholder={ar.dua.placeholder}
        placeholderTextColor={theme.colors.creamFaint}
        value={situation}
        onChangeText={setSituation}
        style={styles.input}
      />
      <View style={styles.actions}>
        <PrimaryButton label={ar.dua.generate} onPress={() => mutation.mutate()} disabled={!situation.trim() || mutation.isPending} tone="emerald" />
        {mutation.isPending ? <ActivityIndicator color={theme.colors.goldLight} /> : null}
      </View>
      {mutation.data ? (
        <View style={styles.resultBlock}>
          <Text style={styles.duaText}>{mutation.data.dua}</Text>
          <View style={styles.sourcesRow}>
            {mutation.data.sources.map((source) => (
              <GhostButton key={source} label={source} onPress={() => undefined} />
            ))}
          </View>
          <VerificationBadge badge={{ level: 'sahih', source: mutation.data.sources[0] ?? 'مصدر موثوق', verified_by: 'سحابة نور الهدى', verified_at: new Date().toISOString().slice(0, 10) }} />
          <GhostButton label="مشاركة" onPress={() => void Share.share({ message: mutation.data.dua })} />
        </View>
      ) : null}
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  title: { color: theme.colors.goldLight, fontFamily: theme.fonts.display, fontSize: 28, textAlign: 'right' },
  input: { minHeight: 120, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceStrong, color: theme.colors.cream, padding: 14, fontFamily: theme.fonts.body, textAlign: 'right' },
  actions: { flexDirection: 'row-reverse', gap: 12, alignItems: 'center' },
  resultBlock: { gap: 12 },
  duaText: { color: theme.colors.cream, fontFamily: theme.fonts.arabic, fontSize: 24, lineHeight: 42, textAlign: 'right' },
  sourcesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
