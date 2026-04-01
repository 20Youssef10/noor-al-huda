import { useQuery } from '@tanstack/react-query';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import { z } from 'zod';

import { Page, SectionHeader, SurfaceCard } from '../../src/components/ui';
import { jsonRequest } from '../../src/lib/api';
import { theme } from '../../src/lib/theme';
import { useAppStore } from '../../src/store/app-store';

const companionSchema = z.object({
  reflection: z.string(),
  focus: z.string(),
  focus_type: z.string(),
});

export default function CompanionFeatureScreen() {
  const lastReadSurahId = useAppStore((state) => state.lastReadSurahId);
  const completedAzkar = useAppStore((state) => state.completedAzkar);

  const query = useQuery({
    queryKey: ['daily-companion', lastReadSurahId, Object.keys(completedAzkar).length],
    queryFn: () =>
      jsonRequest('/api/companion/daily', companionSchema, {
        method: 'POST',
        body: JSON.stringify({
          history: {
            last_surah: `سورة رقم ${lastReadSurahId ?? 1}`,
            adhkar_completed: Object.keys(completedAzkar).slice(0, 8),
            hadith_topics: ['الصبر', 'الذكر'],
            streak_days: Object.keys(completedAzkar).length,
          },
        }),
      }),
  });

  return (
    <Page>
      <SectionHeader title="الرفيق اليومي" subtitle="تأمل شخصي مبني على نشاطك القريب" />
      <SurfaceCard accent="emerald">
        {query.isLoading ? <ActivityIndicator color={theme.colors.goldLight} /> : null}
        {query.data ? (
          <>
            <Text style={styles.reflection}>{query.data.reflection}</Text>
            <Text style={styles.focus}>تركيز اليوم: {query.data.focus}</Text>
          </>
        ) : null}
      </SurfaceCard>
    </Page>
  );
}

const styles = StyleSheet.create({
  reflection: {
    color: theme.colors.cream,
    fontFamily: theme.fonts.arabic,
    fontSize: 24,
    lineHeight: 42,
    textAlign: 'right',
  },
  focus: {
    color: theme.colors.goldLight,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 16,
    textAlign: 'right',
  },
});
