import { useQuery } from '@tanstack/react-query';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';

import { GhostButton, Page, PrimaryButton, SectionHeader, SurfaceCard } from '../../src/components/ui';
import { useAuthUser } from '../../src/features/auth/service';
import { fetchSurahDetail } from '../../src/features/quran/service';
import { useAudioPlayer } from '../../src/hooks/useAudioPlayer';
import { theme } from '../../src/lib/theme';
import { useAppStore } from '../../src/store/app-store';

export default function SurahDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ surah: string }>();
  const parsedSurahId = Number(params.surah ?? 1);
  const surahId = Number.isFinite(parsedSurahId) && parsedSurahId > 0 ? parsedSurahId : 1;
  const bookmarks = useAppStore((state) => state.bookmarks);
  const toggleBookmark = useAppStore((state) => state.toggleBookmark);
  const setLastReadSurahId = useAppStore((state) => state.setLastReadSurahId);
  const { user } = useAuthUser();
  const audioPlayer = useAudioPlayer();

  const surahQuery = useQuery({
    queryKey: ['surah-detail', surahId],
    queryFn: () => fetchSurahDetail(surahId),
  });

  const bookmark = useMemo(
    () => ({
      surahId,
      surahName: surahQuery.data?.surah.name ?? 'سورة',
      ayahNumber: 1,
      createdAt: new Date().toISOString(),
    }),
    [surahId, surahQuery.data?.surah.name]
  );

  const isBookmarked = bookmarks.some(
    (item) => item.surahId === surahId && item.ayahNumber === bookmark.ayahNumber
  );

  useEffect(() => {
    setLastReadSurahId(surahId);
  }, [setLastReadSurahId, surahId]);

  async function handleBookmark() {
    const detail = surahQuery.data;
    if (!detail) {
      return;
    }

    toggleBookmark({ ...bookmark, surahName: detail.surah.name, createdAt: new Date().toISOString() });
    Alert.alert(
      isBookmarked ? 'أزيلت الإشارة' : 'تم الحفظ',
      user
        ? isBookmarked
          ? 'أزيلت السورة من الإشارات المرجعية وسيتم تحديث Firebase تلقائياً.'
          : 'حُفظت السورة ضمن الإشارات المرجعية وسيتم رفعها إلى Firebase تلقائياً.'
        : isBookmarked
          ? 'أزيلت السورة من الإشارات المرجعية المحلية.'
          : 'حُفظت السورة ضمن الإشارات المرجعية المحلية.'
    );
  }

  return (
    <Page>
      <Stack.Screen options={{ headerShown: false }} />
      <SurfaceCard accent="emerald">
        <View style={styles.topRow}>
          <GhostButton label="رجوع" onPress={() => router.back()} />
          <View style={styles.topMeta}>
            <Text style={styles.topTitle}>السورة</Text>
            <Text style={styles.topValue}>{surahId}</Text>
          </View>
        </View>
      </SurfaceCard>

      {surahQuery.isLoading ? (
        <SurfaceCard>
          <ActivityIndicator color={theme.colors.goldLight} />
        </SurfaceCard>
      ) : surahQuery.data ? (
        <>
          <SurfaceCard>
            <SectionHeader
              title={surahQuery.data.surah.name}
              subtitle={`${surahQuery.data.surah.transliteration} · ${surahQuery.data.surah.versesCount} آية`}
            />
            <View style={styles.actionRow}>
              {surahQuery.data.audioUrl ? (
                <PrimaryButton
                  label={
                    audioPlayer.currentUrl === surahQuery.data.audioUrl && audioPlayer.isPlaying
                      ? 'إيقاف مؤقت'
                      : 'استماع'
                  }
                  onPress={() => {
                    if (audioPlayer.currentUrl === surahQuery.data?.audioUrl) {
                      void audioPlayer.toggle();
                    } else if (surahQuery.data?.audioUrl) {
                      void audioPlayer.play(surahQuery.data.audioUrl, surahQuery.data.surah.name);
                    }
                  }}
                />
              ) : null}
              <GhostButton label={isBookmarked ? 'إزالة الإشارة' : 'إشارة مرجعية'} onPress={() => void handleBookmark()} />
            </View>
          </SurfaceCard>

          {surahQuery.data.verses.map((verse: Awaited<ReturnType<typeof fetchSurahDetail>>['verses'][number]) => (
            <SurfaceCard key={verse.number} accent="gold">
              <Text style={styles.verseNumber}>الآية {verse.number}</Text>
              <Text style={styles.verseArabic}>{verse.arabicText}</Text>
              <Text style={styles.verseTranslation}>{verse.translation}</Text>
            </SurfaceCard>
          ))}
        </>
      ) : null}
    </Page>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topMeta: {
    alignItems: 'flex-end',
  },
  topTitle: {
    color: theme.colors.creamFaint,
    fontFamily: theme.fonts.body,
    fontSize: 12,
  },
  topValue: {
    color: theme.colors.goldLight,
    fontFamily: theme.fonts.bodyBlack,
    fontSize: 26,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  verseNumber: {
    color: theme.colors.goldLight,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 13,
    textAlign: 'right',
  },
  verseArabic: {
    color: theme.colors.cream,
    fontFamily: theme.fonts.arabic,
    fontSize: 24,
    lineHeight: 42,
    textAlign: 'right',
  },
  verseTranslation: {
    color: theme.colors.creamMuted,
    fontFamily: theme.fonts.body,
    fontSize: 14,
    lineHeight: 24,
    textAlign: 'right',
  },
});
