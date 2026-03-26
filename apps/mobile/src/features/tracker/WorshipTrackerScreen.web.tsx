import { StyleSheet, Text, View } from 'react-native';

import { Page, SectionHeader, SurfaceCard } from '../../components/ui';
import { theme } from '../../lib/theme';

export function WorshipTrackerScreen() {
  return (
    <Page>
      <SectionHeader title="متابعة العبادة" subtitle="نسخة الويب تعرض ملخصاً فقط، بينما التخزين المحلي الكامل متاح على التطبيق." />
      <SurfaceCard accent="emerald">
        <Text style={styles.title}>التتبع اليومي</Text>
        <Text style={styles.body}>سجل العبادة الكامل وخرائط النشاط الشهرية تعمل محلياً على Android وiOS باستخدام SQLite.</Text>
      </SurfaceCard>
    </Page>
  );
}

const styles = StyleSheet.create({
  title: { color: theme.colors.goldLight, fontFamily: theme.fonts.display, fontSize: 24, textAlign: 'right' },
  body: { color: theme.colors.creamMuted, fontFamily: theme.fonts.body, fontSize: 14, lineHeight: 22, textAlign: 'right' },
});
