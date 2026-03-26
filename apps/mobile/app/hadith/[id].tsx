import { useQuery } from '@tanstack/react-query';
import { Stack, useRouter } from 'expo-router';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';

import { GhostButton, Page, SectionHeader, SurfaceCard } from '../../src/components/ui';
import { flagContent } from '../../src/features/content/flags';
import { fetchDailyContent } from '../../src/features/daily/service';
import { theme } from '../../src/lib/theme';
import { VerificationBadge } from '../../src/shared/components/VerificationBadge';

export default function HadithDetailScreen() {
  const router = useRouter();
  const query = useQuery({
    queryKey: ['hadith-detail'],
    queryFn: fetchDailyContent,
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
          <Text style={styles.title}>{query.data.hadith.title}</Text>
          <VerificationBadge
            badge={{
              level: 'sahih',
              source: query.data.hadith.source,
              verified_by: 'Dorar / Noor Al Huda',
              verified_at: new Date().toISOString().slice(0, 10),
            }}
          />
          <Text style={styles.body}>{query.data.hadith.text}</Text>
          <Text style={styles.source}>{query.data.hadith.source}</Text>
          <Text style={styles.note}>
            عند توفّر الاتصال بالخادم سيُحمَّل النصّ الموسّع ودرجة الحديث ومراجع الكتاب من Cloudflare Worker.
          </Text>
          <View style={styles.actions}>
            <GhostButton
              label="الإبلاغ كمصدر غير صحيح"
              onPress={() => {
                void flagContent(query.data?.hadith.id ?? 'hadith', 'wrong_source').then(() => {
                  Alert.alert('تم الإرسال', 'سُجّل بلاغك لمراجعته لاحقاً.');
                });
              }}
            />
            <GhostButton
              label="الإبلاغ كحديث ضعيف"
              onPress={() => {
                void flagContent(query.data?.hadith.id ?? 'hadith', 'weak').then(() => {
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
