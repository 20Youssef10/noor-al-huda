import { StyleSheet, Text, View } from 'react-native';

import { Page, GhostButton, SectionHeader, SurfaceCard } from '../../src/components/ui';
import { getPrivacyMode, setPrivacyMode, type PrivacyMode } from '../../src/features/privacy/PrivacyManager';
import { theme } from '../../src/lib/theme';
import { useState } from 'react';

const modes: Array<{ key: PrivacyMode; title: string; body: string }> = [
  { key: 'full', title: 'الوضع الكامل', body: 'مزامنة، إشعارات، وخدمات مساعدة حسب الحاجة.' },
  { key: 'partial', title: 'الوضع المتوازن', body: 'بدون تحليلات، مع إبقاء المزامنة المفيدة.' },
  { key: 'private', title: 'الوضع الخاص', body: 'البيانات محلية بالكامل ولا يُسمح إلا بخدمات المحتوى الإسلامي.' },
];

export default function PrivacyFeatureScreen() {
  const [mode, setMode] = useState<PrivacyMode>(getPrivacyMode());

  return (
    <Page>
      <SectionHeader title="إدارة الخصوصية" subtitle="اختر وضعاً واضحاً بلا أنماط مظلمة" />
      {modes.map((item) => (
        <SurfaceCard key={item.key} accent={item.key === mode ? 'emerald' : 'blue'}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.body}>{item.body}</Text>
          <GhostButton
            label={item.key === mode ? 'الوضع الحالي' : 'تفعيل هذا الوضع'}
            onPress={() => {
              setPrivacyMode(item.key);
              setMode(item.key);
            }}
          />
        </SurfaceCard>
      ))}
    </Page>
  );
}

const styles = StyleSheet.create({
  title: { color: theme.colors.goldLight, fontFamily: theme.fonts.display, fontSize: 24, textAlign: 'right' },
  body: { color: theme.colors.creamMuted, fontFamily: theme.fonts.body, fontSize: 14, lineHeight: 22, textAlign: 'right' },
});
