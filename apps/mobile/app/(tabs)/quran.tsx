import { useQuery } from '@tanstack/react-query';
import { Link } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { EmptyState, Page, SectionHeader, SurfaceCard, TextField } from '../../src/components/ui';
import { fetchSurahList } from '../../src/features/quran/service';
import { theme } from '../../src/lib/theme';
import { useAppStore } from '../../src/store/app-store';

export default function QuranScreen() {
  const [search, setSearch] = useState('');
  const lastReadSurahId = useAppStore((state) => state.lastReadSurahId);

  const surahQuery = useQuery({
    queryKey: ['surah-list'],
    queryFn: fetchSurahList,
  });

  const filtered = useMemo(() => {
    if (!surahQuery.data) {
      return [];
    }

    return surahQuery.data.filter((surah) => {
      if (!search.trim()) {
        return true;
      }

      const needle = search.trim().toLowerCase();
      return (
        surah.name.includes(search.trim()) ||
        surah.transliteration.toLowerCase().includes(needle) ||
        surah.englishName.toLowerCase().includes(needle)
      );
    });
  }, [search, surahQuery.data]);

  return (
    <Page>
      <SectionHeader title="القرآن الكريم" subtitle="نص، ترجمة، وتخزين Offline في SQLite" />
      <TextField value={search} onChangeText={setSearch} placeholder="ابحث باسم السورة" />

      {lastReadSurahId ? (
        <SurfaceCard accent="emerald">
          <SectionHeader title="استئناف القراءة" subtitle={`آخر سورة مفتوحة: رقم ${lastReadSurahId}`} />
          <Link href={`/quran/${lastReadSurahId}`} asChild>
            <Pressable style={styles.resumeButton}>
              <Text style={styles.resumeLink}>فتح السورة ومتابعة القراءة</Text>
            </Pressable>
          </Link>
        </SurfaceCard>
      ) : null}

      {surahQuery.isLoading ? (
        <SurfaceCard>
          <ActivityIndicator color={theme.colors.goldLight} />
        </SurfaceCard>
      ) : filtered.length ? (
        filtered.map((surah) => (
          <Link href={`/quran/${surah.id}`} key={surah.id} asChild>
            <Pressable
              accessibilityLabel={`فتح سورة ${surah.name}`}
              style={[
                styles.card,
                surah.id === lastReadSurahId ? styles.cardEmerald : styles.cardGold,
              ]}
            >
              <View style={styles.surahRow}>
                <View style={styles.surahMeta}>
                  <Text style={styles.surahName}>{surah.name}</Text>
                  <Text style={styles.surahSubtitle}>
                    {surah.transliteration} · {surah.englishName}
                  </Text>
                </View>
                <View style={styles.surahBadge}>
                  <Text style={styles.surahBadgeText}>{surah.id}</Text>
                </View>
              </View>
              <Text style={styles.surahDetails}>
                {surah.versesCount} آية · {surah.revelation === 'Meccan' ? 'مكية' : 'مدنية'}
              </Text>
            </Pressable>
          </Link>
        ))
      ) : (
        <EmptyState title="لا توجد نتائج" message="جرّب اسماً آخر أو انتظر مزامنة قائمة السور من الخادم." />
      )}
    </Page>
  );
}

const styles = StyleSheet.create({
  resumeLink: {
    color: theme.colors.goldLight,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 14,
    textAlign: 'right',
  },
  resumeButton: {
    borderRadius: 16,
    paddingVertical: 8,
  },
  card: {
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    backgroundColor: theme.colors.surface,
    gap: 12,
    ...theme.shadow.card,
  },
  cardGold: {
    borderColor: 'rgba(201,168,76,0.22)',
  },
  cardEmerald: {
    borderColor: 'rgba(42,157,92,0.22)',
  },
  surahRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  surahMeta: {
    flex: 1,
    gap: 4,
  },
  surahName: {
    color: theme.colors.cream,
    fontFamily: theme.fonts.display,
    fontSize: 26,
    textAlign: 'right',
  },
  surahSubtitle: {
    color: theme.colors.creamFaint,
    fontFamily: theme.fonts.body,
    fontSize: 13,
    textAlign: 'right',
  },
  surahDetails: {
    color: theme.colors.goldLight,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 14,
    textAlign: 'right',
  },
  surahBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(201,168,76,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  surahBadgeText: {
    color: theme.colors.goldLight,
    fontFamily: theme.fonts.bodyBlack,
    fontSize: 16,
  },
});
