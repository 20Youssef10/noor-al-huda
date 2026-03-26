import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Page, SectionHeader, SurfaceCard, GhostButton } from '../../src/components/ui';
import { fetchAzkarCollection } from '../../src/features/azkar/service';
import { theme } from '../../src/lib/theme';
import { useAppStore } from '../../src/store/app-store';
import { type AzkarCollection } from '../../src/types/domain';

const tabs: Array<{ key: AzkarCollection; label: string }> = [
  { key: 'morning', label: 'الصباح' },
  { key: 'evening', label: 'المساء' },
  { key: 'after-prayer', label: 'بعد الصلاة' },
];

export default function AzkarScreen() {
  const [activeTab, setActiveTab] = useState<AzkarCollection>('morning');
  const completedAzkar = useAppStore((state) => state.completedAzkar);
  const incrementAzkar = useAppStore((state) => state.incrementAzkar);

  const azkarQuery = useQuery({
    queryKey: ['azkar', activeTab],
    queryFn: () => fetchAzkarCollection(activeTab),
  });

  return (
    <Page>
      <SectionHeader title="الأذكار" subtitle="حصن المسلم مع عدّاد تقدّم محفوظ محلياً" />
      <View style={styles.tabsRow}>
        {tabs.map((tab) => (
          <GhostButton key={tab.key} label={tab.label} onPress={() => setActiveTab(tab.key)} />
        ))}
      </View>

      {azkarQuery.isLoading ? (
        <SurfaceCard>
          <ActivityIndicator color={theme.colors.goldLight} />
        </SurfaceCard>
      ) : (
        azkarQuery.data?.map((entry: Awaited<ReturnType<typeof fetchAzkarCollection>>[number]) => {
          const progress = completedAzkar[entry.id] ?? 0;
          const done = progress >= entry.count;

          return (
            <SurfaceCard key={entry.id} accent={done ? 'emerald' : 'gold'}>
              <Text style={styles.zikrText}>{entry.text}</Text>
              <Text style={styles.virtueText}>{entry.virtue}</Text>
              <View style={styles.counterRow}>
                <Text style={styles.counterText}>{progress} / {entry.count}</Text>
                <GhostButton label={done ? 'أُنجز' : 'تسبيحة'} onPress={() => incrementAzkar(entry.id)} />
              </View>
            </SurfaceCard>
          );
        })
      )}
    </Page>
  );
}

const styles = StyleSheet.create({
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  zikrText: {
    color: theme.colors.cream,
    fontFamily: theme.fonts.arabic,
    fontSize: 23,
    lineHeight: 40,
    textAlign: 'right',
  },
  virtueText: {
    color: theme.colors.creamMuted,
    fontFamily: theme.fonts.body,
    fontSize: 14,
    lineHeight: 23,
    textAlign: 'right',
  },
  counterRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  counterText: {
    color: theme.colors.goldLight,
    fontFamily: theme.fonts.bodyBlack,
    fontSize: 15,
  },
});
