import { useQuery } from '@tanstack/react-query';
import { Link } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { z } from 'zod';

import { ar } from '../../../shared/i18n/ar';
import { jsonRequest } from '../../../lib/api';
import { storage } from '../../../lib/mmkv';
import { theme } from '../../../lib/theme';
import { GhostButton, SurfaceCard } from '../../../components/ui';

const searchSchema = z.object({
  query: z.string(),
  results: z.array(
    z.object({
      surah: z.number(),
      ayah: z.number(),
      text_ar: z.string(),
      surah_name: z.string(),
      score: z.number(),
    })
  ),
});

export function SemanticSearch() {
  const [input, setInput] = useState('');
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(input.trim()), 500);
    return () => clearTimeout(timer);
  }, [input]);

  const recent = useMemo(() => {
    const raw = storage.getString('recent_searches');
    return raw ? (JSON.parse(raw) as string[]) : [];
  }, [debounced]);

  const query = useQuery({
    queryKey: ['semantic-search', debounced],
    enabled: debounced.length > 1,
    queryFn: async () => {
      const result = await jsonRequest(`/api/quran/search?q=${encodeURIComponent(debounced)}&limit=10`, searchSchema);
      const updated = [debounced, ...recent.filter((item) => item !== debounced)].slice(0, 6);
      storage.set('recent_searches', JSON.stringify(updated));
      return result;
    },
  });

  return (
    <SurfaceCard>
      <Text style={styles.title}>{ar.search.semanticTitle}</Text>
      <TextInput
        accessibilityLabel={ar.search.placeholder}
        placeholder={ar.search.placeholder}
        placeholderTextColor={theme.colors.creamFaint}
        value={input}
        onChangeText={setInput}
        style={styles.input}
        textAlign="right"
      />
      <View style={styles.recentRow}>
        {recent.map((item) => (
          <GhostButton key={item} label={item} onPress={() => setInput(item)} />
        ))}
      </View>
      <FlatList
        data={query.data?.results ?? []}
        keyExtractor={(item) => `${item.surah}:${item.ayah}`}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <Link href={`/quran/${item.surah}`} asChild>
            <View style={styles.resultCard}>
              <Text style={styles.resultTitle}>{item.surah_name} · {item.ayah}</Text>
              <Text style={styles.resultText}>{item.text_ar}</Text>
              <View style={styles.scoreTrack}>
                <View style={[styles.scoreFill, { width: `${Math.min(100, Math.round(item.score * 100))}%` }]} />
              </View>
            </View>
          </Link>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>{debounced ? 'لا توجد نتائج حالياً.' : ar.search.recent}</Text>
        }
      />
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  title: { color: theme.colors.goldLight, fontFamily: theme.fonts.display, fontSize: 28, textAlign: 'right' },
  input: { borderRadius: 16, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceStrong, color: theme.colors.cream, padding: 14, fontFamily: theme.fonts.body },
  recentRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  resultCard: { gap: 8, paddingVertical: 10 },
  resultTitle: { color: theme.colors.goldLight, fontFamily: theme.fonts.bodyBold, fontSize: 14, textAlign: 'right' },
  resultText: { color: theme.colors.cream, fontFamily: theme.fonts.arabic, fontSize: 20, textAlign: 'right', lineHeight: 34 },
  scoreTrack: { height: 8, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' },
  scoreFill: { height: '100%', backgroundColor: theme.colors.emeraldLight },
  emptyText: { color: theme.colors.creamFaint, fontFamily: theme.fonts.body, fontSize: 13, textAlign: 'right' },
});
