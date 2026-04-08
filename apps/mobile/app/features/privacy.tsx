import * as FileSystemLegacy from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Page, GhostButton, SectionHeader, SurfaceCard } from '../../src/components/ui';
import { getPrivacyMode, setPrivacyMode, type PrivacyMode } from '../../src/features/privacy/PrivacyManager';
import { storage } from '../../src/lib/mmkv';
import { theme } from '../../src/lib/theme';
import { useState } from 'react';

const modes: Array<{ key: PrivacyMode; title: string; body: string }> = [
  { key: 'full', title: 'الوضع الكامل', body: 'مزامنة، إشعارات، وخدمات مساعدة حسب الحاجة.' },
  { key: 'partial', title: 'الوضع المتوازن', body: 'بدون تحليلات، مع إبقاء المزامنة المفيدة.' },
  { key: 'private', title: 'الوضع الخاص', body: 'البيانات محلية بالكامل ولا يُسمح إلا بخدمات المحتوى الإسلامي.' },
];

export default function PrivacyFeatureScreen() {
  const [mode, setMode] = useState<PrivacyMode>(getPrivacyMode());

  async function exportLocalData() {
    const payload = {
      privacyMode: getPrivacyMode(),
      recentSearches: storage.getString('recent_searches'),
      streakData: storage.getString('streak_data'),
      unlockedAchievements: storage.getString('unlocked_achievements'),
    };
    const baseDir = FileSystemLegacy.cacheDirectory ?? FileSystemLegacy.documentDirectory;
    if (!baseDir) {
      throw new Error('تعذر الوصول إلى مسار تخزين مناسب لتصدير البيانات.');
    }
    const path = `${baseDir}noor-al-huda-export.json`;
    await FileSystemLegacy.writeAsStringAsync(path, JSON.stringify(payload, null, 2));
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(path);
    }
  }

  function wipeLocalData() {
    storage.clearAll();
    Alert.alert('تم الحذف', 'أُزيلت جميع البيانات المحلية المحفوظة من الجهاز.');
    setMode('full');
  }

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
      <SurfaceCard>
        <SectionHeader title="بياناتك المحلية" subtitle="تصدير أو حذف فوري بدون تعقيد" />
        <GhostButton label="تصدير البيانات المحلية" onPress={() => void exportLocalData()} />
        <GhostButton label="حذف جميع البيانات المحلية" onPress={wipeLocalData} />
      </SurfaceCard>
    </Page>
  );
}

const styles = StyleSheet.create({
  title: { color: theme.colors.goldLight, fontFamily: theme.fonts.display, fontSize: 24, textAlign: 'right' },
  body: { color: theme.colors.creamMuted, fontFamily: theme.fonts.body, fontSize: 14, lineHeight: 22, textAlign: 'right' },
});
