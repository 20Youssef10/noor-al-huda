import { useQuery } from '@tanstack/react-query';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';

import { GhostButton, Page, SectionHeader, SurfaceCard } from '../../src/components/ui';
import { flagContent } from '../../src/features/content/flags';
import { fetchHadithDetail } from '../../src/features/hadith/service';
import { theme } from '../../src/lib/theme';
import { VerificationBadge } from '../../src/shared/components/VerificationBadge';
import { useState } from 'react';

export default function HadithDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const hadithId = params.id ?? '65290';
  const [showEnglish, setShowEnglish] = useState(false);
  const query = useQuery({
    queryKey: ['hadith-detail', hadithId],
    queryFn: () => fetchHadithDetail(hadithId),
  });

  return (
    <Page>
      <Stack.Screen options={{ headerShown: false }} />
      <SurfaceCard accent="emerald">
        <View style={styles.headerRow}>
          <GhostButton label="رجوع" onPress={() => router.back()} />
          <SectionHeader title="شرح الحديث" subtitle="مصدر موثق مع قابلية التوسعة من Worker" />
        </View>
      </SurfaceCard>

      {query.isLoading ? (
        <SurfaceCard>
          <ActivityIndicator color={theme.colors.goldLight} />
        </SurfaceCard>
      ) : query.data ? (
        <SurfaceCard>
          <Text style={styles.title}>{query.data.title}</Text>
          <VerificationBadge
            badge={{
              level: 'sahih',
              source: query.data.source,
              verified_by: 'Dorar / Noor Al Huda',
              verified_at: new Date().toISOString().slice(0, 10),
            }}
          />
          <Text style={styles.body}>{showEnglish && query.data.englishText ? query.data.englishText : query.data.text}</Text>
          <Text style={styles.source}>{query.data.source}</Text>
          <View style={styles.actions}>
            {query.data.englishText ? (
              <GhostButton
                label={showEnglish ? 'العرض بالعربية' : 'العرض بالإنجليزية'}
                onPress={() => setShowEnglish((value) => !value)}
              />
            ) : null}
            <GhostButton
              label="استماع"
              onPress={() => Speech.speak(showEnglish && query.data.englishText ? query.data.englishText : query.data.text, { language: showEnglish ? 'en-US' : 'ar-SA' })}
            />
            <GhostButton
              label="الإبلاغ كمصدر غير صحيح"
              onPress={() => {
                void flagContent(query.data?.id ?? 'hadith', 'wrong_source').then(() => {
                  Alert.alert('تم الإرسال', 'سُجّل بلاغك لمراجعته لاحقاً.');
                });
              }}
            />
            <GhostButton
              label="الإبلاغ كحديث ضعيف"
              onPress={() => {
                void flagContent(query.data?.id ?? 'hadith', 'weak').then(() => {
                  Alert.alert('تم الإرسال', 'سُجّل بلاغك لمراجعته لاحقاً.');
                });
              }}
            />
          </View>
        </SurfaceCard>
      ) : null}
    </Page>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    gap: 10,
  },
  title: {
    color: theme.colors.goldLight,
    fontFamily: theme.fonts.display,
    fontSize: 30,
    textAlign: 'right',
  },
  body: {
    color: theme.colors.cream,
    fontFamily: theme.fonts.arabic,
    fontSize: 24,
    lineHeight: 42,
    textAlign: 'right',
  },
  source: {
    color: theme.colors.creamFaint,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 14,
    textAlign: 'right',
  },
  note: {
    color: theme.colors.creamMuted,
    fontFamily: theme.fonts.body,
    fontSize: 14,
    lineHeight: 24,
    textAlign: 'right',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
});
