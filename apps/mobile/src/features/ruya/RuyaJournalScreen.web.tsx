import { StyleSheet, Text } from 'react-native';

import { Page, SectionHeader, SurfaceCard } from '../../components/ui';
import { theme } from '../../lib/theme';

export function RuyaJournalScreen() {
  return (
    <Page>
      <SectionHeader title="يومية الرؤى" subtitle="التشفير المحلي الكامل متاح داخل التطبيق المحمول." />
      <SurfaceCard accent="blue">
        <Text style={styles.title}>وضع الويب</Text>
        <Text style={styles.body}>حفظ الرؤى المشفر محلياً يعتمد على SQLite وملفات الجهاز، لذلك تظهر هنا معاينة معلوماتية فقط.</Text>
      </SurfaceCard>
    </Page>
  );
}

const styles = StyleSheet.create({
  title: { color: theme.colors.goldLight, fontFamily: theme.fonts.display, fontSize: 24, textAlign: 'right' },
  body: { color: theme.colors.creamMuted, fontFamily: theme.fonts.body, fontSize: 14, lineHeight: 22, textAlign: 'right' },
});
