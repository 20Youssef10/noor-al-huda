import { useQuery } from '@tanstack/react-query';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { GhostButton, Page, PrimaryButton, SectionHeader, SurfaceCard } from '../../src/components/ui';
import { SelectSheet } from '../../src/components/SelectSheet';
import { useAuthUser } from '../../src/features/auth/service';
import { buildReciterAudioUrl, fetchReciterCollections, fetchSurahDetail, fetchTafsirCollections, fetchTranslationCollections } from '../../src/features/quran/service';
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
  const settings = useAppStore((state) => state.settings);
  const setReciter = useAppStore((state) => state.setReciter);
  const { user } = useAuthUser();
  const audioPlayer = useAudioPlayer();
  const [selectedTranslationId, setSelectedTranslationId] = useState('en.asad');
  const [selectedTafsirId, setSelectedTafsirId] = useState('ar.muyassar');

  const translationsQuery = useQuery({ queryKey: ['translation-collections'], queryFn: fetchTranslationCollections });
  const tafsirQuery = useQuery({ queryKey: ['tafsir-collections'], queryFn: fetchTafsirCollections });
  const recitersQuery = useQuery({ queryKey: ['reciter-collections'], queryFn: fetchReciterCollections });

  const selectedReciter = useMemo(
    () => recitersQuery.data?.find((item) => item.name === settings.reciter) ?? recitersQuery.data?.[0],
    [recitersQuery.data, settings.reciter]
  );
  const targetAudio = useMemo(() => buildReciterAudioUrl(selectedReciter, surahId), [selectedReciter, surahId]);

  const surahQuery = useQuery({
    queryKey: ['surah-detail', surahId, selectedTranslationId, selectedTafsirId, selectedReciter?.id],
    queryFn: () =>
      fetchSurahDetail(surahId, {
        translationIds: [selectedTranslationId],
        tafsirId: selectedTafsirId,
        reciter: selectedReciter,
      }),
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
            <View style={styles.selectorGroup}>
              <SelectSheet
                label="الترجمة"
                value={selectedTranslationId}
                options={(translationsQuery.data ?? []).map((item) => ({ value: item.id, label: item.label }))}
                onSelect={setSelectedTranslationId}
              />
              <SelectSheet
                label="التفسير"
                value={selectedTafsirId}
                options={(tafsirQuery.data ?? []).map((item) => ({ value: item.id, label: item.label }))}
                onSelect={setSelectedTafsirId}
              />
              <SelectSheet
                label="القارئ"
                value={selectedReciter?.id ?? ''}
                options={(recitersQuery.data ?? []).map((item) => ({ value: item.id, label: item.name }))}
                onSelect={(value) => {
                  const next = recitersQuery.data?.find((item) => item.id === value);
                  if (next) {
                    setReciter(next.name);
                  }
                }}
              />
            </View>
            <View style={styles.actionRow}>
              {targetAudio ? (
                <PrimaryButton
                  label={
                    audioPlayer.currentUrl === targetAudio && audioPlayer.isPlaying
                      ? 'إيقاف مؤقت'
                      : 'استماع'
                  }
                  onPress={() => {
                    if (audioPlayer.currentUrl === targetAudio) {
                      void audioPlayer.toggle();
                    } else if (targetAudio) {
                      void audioPlayer.play(targetAudio, `${surahQuery.data.surah.name} - ${selectedReciter?.name ?? 'القارئ الافتراضي'}`);
                    }
                  }}
                />
              ) : null}
              <GhostButton label={isBookmarked ? 'إزالة الإشارة' : 'إشارة مرجعية'} onPress={() => void handleBookmark()} />
            </View>
            {selectedReciter ? <Text style={styles.audioMeta}>القارئ الحالي: {selectedReciter.name}</Text> : null}
          </SurfaceCard>

          {surahQuery.data.verses.map((verse: Awaited<ReturnType<typeof fetchSurahDetail>>['verses'][number]) => (
            <SurfaceCard key={verse.number} accent="gold">
              <Text style={styles.verseNumber}>الآية {verse.number}</Text>
              <Text style={styles.verseArabic}>{verse.arabicText}</Text>
              <Text style={styles.verseTranslation}>{verse.translations?.find((item) => item.id === selectedTranslationId)?.text ?? verse.translation}</Text>
              {verse.tafsir?.text ? <Text style={styles.tafsirText}>{verse.tafsir.text}</Text> : null}
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
  selectorGroup: {
    gap: 10,
  },
  audioMeta: {
    color: theme.colors.creamFaint,
    fontFamily: theme.fonts.body,
    fontSize: 13,
    textAlign: 'right',
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
  tafsirText: {
    color: theme.colors.goldLight,
    fontFamily: theme.fonts.body,
    fontSize: 14,
    lineHeight: 24,
    textAlign: 'right',
  },
});
