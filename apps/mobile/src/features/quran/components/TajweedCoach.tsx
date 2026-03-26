import { useMutation } from '@tanstack/react-query';
import { Audio } from 'expo-av';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import { Circle, Svg } from 'react-native-svg';
import { z } from 'zod';

import { ar } from '../../../shared/i18n/ar';
import { apiBaseUrl } from '../../../lib/api';
import { getCachedContent, putCachedContent } from '../../../lib/sqlite';
import { theme } from '../../../lib/theme';
import { GhostButton, PrimaryButton, SurfaceCard } from '../../../components/ui';
import { type TajweedAnalysis } from '../types/tajweed';

const analysisSchema = z.object({
  score: z.number(),
  accuracy: z.number(),
  words: z.array(z.object({
    expected: z.string(),
    got: z.string(),
    status: z.enum(['correct', 'missing', 'extra', 'changed']),
  })),
  errors: z.array(z.object({
    type: z.enum(['ghunna', 'madd', 'qalqala', 'idgham', 'ikhfa', 'extra_word', 'missing_word']),
    position: z.number(),
    expected: z.string(),
    got: z.string(),
    description_ar: z.string(),
  })),
  encouragement_ar: z.string(),
});

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function TajweedCoach({ surah, ayah }: { surah: number; ayah: number }) {
  const recordingRef = useRef<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [history, setHistory] = useState<Array<{ recordedAt: string; score: number }>>([]);
  const progress = useSharedValue(0);

  const mutation = useMutation({
    mutationFn: async (uri: string) => {
      const fileResponse = await fetch(uri);
      const blob = await fileResponse.blob();
      const formData = new FormData();
      formData.append('audio', blob, 'tajweed.m4a');
      formData.append('surah', String(surah));
      formData.append('ayah', String(ayah));

      const response = await fetch(`${apiBaseUrl}/api/tajweed/analyze`, {
        method: 'POST',
        body: formData,
      });
      const payload = analysisSchema.parse(await response.json());

      const recordedAt = new Date().toISOString();
      await putCachedContent('tajweed_sessions', `${surah}:${ayah}:latest`, { payload, recordedAt });
      return payload;
    },
    onSuccess: async (result) => {
      progress.value = withTiming(result.score / 100, { duration: 700 });
      const entry = { recordedAt: new Date().toISOString(), score: result.score };
      setHistory((current) => [entry, ...current].slice(0, 7));
    },
  });

  useEffect(() => {
    const loadCached = async () => {
      const cached = await getCachedContent<{ payload: TajweedAnalysis; recordedAt: string }>(
        'tajweed_sessions',
        `${surah}:${ayah}:latest`
      );
      if (cached) {
        setHistory([{ recordedAt: cached.recordedAt, score: cached.payload.score }]);
      }
    };
    void loadCached();
  }, [ayah, surah]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: 565 - 565 * progress.value,
  }));

  const result = mutation.data;
  const scoreColor = useMemo(() => {
    if (!result) return theme.colors.goldLight;
    if (result.score >= 85) return '#4CAF50';
    if (result.score >= 65) return '#F5B942';
    return '#F97316';
  }, [result]);

  async function startRecording() {
    const permission = await Audio.requestPermissionsAsync();
    if (permission.status !== 'granted') return;
    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    await recording.startAsync();
    recordingRef.current = recording;
    setIsRecording(true);
  }

  async function stopRecording() {
    const recording = recordingRef.current;
    if (!recording) return;
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    recordingRef.current = null;
    setIsRecording(false);
    if (uri) {
      mutation.mutate(uri);
    }
  }

  return (
    <SurfaceCard accent="emerald">
      <Text style={styles.title}>{ar.tajweed.title}</Text>
      <View style={styles.ringRow}>
        <Svg width={200} height={200} viewBox="0 0 200 200">
          <Circle cx="100" cy="100" r="90" stroke="rgba(255,255,255,0.12)" strokeWidth="14" fill="none" />
          <AnimatedCircle
            cx="100"
            cy="100"
            r="90"
            stroke={scoreColor}
            strokeWidth="14"
            strokeDasharray="565"
            animatedProps={animatedProps}
            strokeLinecap="round"
            fill="none"
            rotation="-90"
            origin="100,100"
          />
        </Svg>
        <View style={styles.scoreOverlay}>
          <Text style={styles.scoreValue}>{result?.score ?? '--'}</Text>
          <Text style={styles.scoreLabel}>/ 100</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <PrimaryButton
          label={isRecording ? ar.tajweed.stop : ar.tajweed.start}
          onPress={() => void (isRecording ? stopRecording() : startRecording())}
          tone="emerald"
          disabled={mutation.isPending}
        />
        {mutation.isPending ? <ActivityIndicator color={theme.colors.goldLight} /> : null}
      </View>
      <Text style={styles.encouragement}>{result?.encouragement_ar ?? ar.tajweed.noData}</Text>
      {result ? (
        <FlatList
          data={result.words}
          keyExtractor={(item, index) => `${item.expected}-${index}`}
          horizontal
          inverted
          contentContainerStyle={styles.wordsRow}
          renderItem={({ item }) => (
            <View
              style={[
                styles.wordChip,
                item.status === 'correct' ? styles.wordCorrect : item.status === 'missing' ? styles.wordMissing : item.status === 'extra' ? styles.wordExtra : styles.wordChanged,
              ]}
            >
              <Text style={styles.wordText}>{item.got || item.expected}</Text>
            </View>
          )}
        />
      ) : null}
      {history.length ? (
        <View style={styles.historyBlock}>
          {history.map((entry) => (
            <View key={entry.recordedAt} style={styles.barRow}>
              <Text style={styles.barLabel}>{new Date(entry.recordedAt).toLocaleDateString('ar-EG')}</Text>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${entry.score}%` }]} />
              </View>
              <Text style={styles.barValue}>{entry.score}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  title: { color: theme.colors.goldLight, fontFamily: theme.fonts.display, fontSize: 28, textAlign: 'right' },
  ringRow: { alignItems: 'center', justifyContent: 'center' },
  scoreOverlay: { position: 'absolute', alignItems: 'center' },
  scoreValue: { color: theme.colors.cream, fontFamily: theme.fonts.bodyBlack, fontSize: 42 },
  scoreLabel: { color: theme.colors.creamFaint, fontFamily: theme.fonts.body, fontSize: 14 },
  actions: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12 },
  encouragement: { color: theme.colors.creamMuted, fontFamily: theme.fonts.body, fontSize: 14, textAlign: 'right' },
  wordsRow: { gap: 8 },
  wordChip: { borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8 },
  wordCorrect: { backgroundColor: 'rgba(52,199,89,0.18)' },
  wordMissing: { backgroundColor: 'rgba(255,59,48,0.18)' },
  wordExtra: { backgroundColor: 'rgba(249,115,22,0.18)' },
  wordChanged: { backgroundColor: 'rgba(255,204,0,0.18)' },
  wordText: { color: theme.colors.cream, fontFamily: theme.fonts.arabic, fontSize: 18 },
  historyBlock: { gap: 8 },
  barRow: { gap: 8 },
  barLabel: { color: theme.colors.creamFaint, fontFamily: theme.fonts.body, fontSize: 12, textAlign: 'right' },
  barTrack: { height: 10, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: theme.colors.goldLight },
  barValue: { color: theme.colors.goldLight, fontFamily: theme.fonts.bodyBold, fontSize: 12, textAlign: 'right' },
});
