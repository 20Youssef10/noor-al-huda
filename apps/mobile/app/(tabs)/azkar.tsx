import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import * as Speech from 'expo-speech';

import { Page, SectionHeader, SurfaceCard, GhostButton } from '../../src/components/ui';
import { fetchAzkarCatalog, fetchAzkarCategory, fetchAzkarCollection } from '../../src/features/azkar/service';
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
  const [search, setSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(12);
  const [selectedCatalogId, setSelectedCatalogId] = useState<number | null>(null);
  const [selectedCatalogTitle, setSelectedCatalogTitle] = useState('');
  const completedAzkar = useAppStore((state) => state.completedAzkar);
  const incrementAzkar = useAppStore((state) => state.incrementAzkar);

  const catalogQuery = useQuery({ queryKey: ['azkar-catalog'], queryFn: fetchAzkarCatalog });

  const azkarQuery = useQuery({
    queryKey: ['azkar', activeTab, selectedCatalogId],
    queryFn: () =>
      selectedCatalogId
        ? fetchAzkarCategory(selectedCatalogId, selectedCatalogTitle || 'مجموعة أذكار')
        : fetchAzkarCollection(activeTab),
  });

  const filteredEntries = useMemo(() => {
    const base = azkarQuery.data ?? [];
    const needle = search.trim();
    if (!needle) {
      return base;
    }
    return base.filter((entry) => entry.text.includes(needle) || entry.virtue.includes(needle));
  }, [azkarQuery.data, search]);

  return (
    <Page>
      <SectionHeader title="الأذكار" subtitle="حصن المسلم مع عدّاد تقدّم محفوظ محلياً" />
      <View style={styles.tabsRow}>
        {tabs.map((tab) => (
          <GhostButton
            key={tab.key}
            label={tab.label}
            onPress={() => {
              setActiveTab(tab.key);
              setSelectedCatalogId(null);
              setSelectedCatalogTitle('');
            }}
          />
        ))}
      </View>

      <TextInput
        style={styles.search}
        value={search}
        onChangeText={setSearch}
        placeholder="ابحث بكلمة داخل الذكر"
        placeholderTextColor={theme.colors.creamFaint}
        textAlign="right"
      />

      {catalogQuery.data ? (
        <View style={styles.catalogRow}>
          {catalogQuery.data.slice(0, 10).map((item) => (
            <GhostButton
              key={item.id}
              label={item.title}
              onPress={() => {
                setSelectedCatalogId(item.id);
                setSelectedCatalogTitle(item.title);
              }}
            />
          ))}
        </View>
      ) : null}

      {azkarQuery.isLoading ? (
        <SurfaceCard>
          <ActivityIndicator color={theme.colors.goldLight} />
        </SurfaceCard>
      ) : (
        <FlatList
          data={filteredEntries.slice(0, visibleCount)}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={styles.list}
          onEndReached={() => setVisibleCount((count) => count + 12)}
          renderItem={({ item }) => {
            const progress = completedAzkar[item.id] ?? 0;
            const done = progress >= item.count;

            return (
              <SurfaceCard key={item.id} accent={done ? 'emerald' : 'gold'}>
                {item.collectionTitle ? <Text style={styles.collectionTitle}>{item.collectionTitle}</Text> : null}
                <Text style={styles.zikrText}>{item.text}</Text>
                <Text style={styles.virtueText}>{item.virtue}</Text>
                <View style={styles.counterRow}>
                  <Text style={styles.counterText}>{progress} / {item.count}</Text>
                  <View style={styles.counterActions}>
                    <GhostButton label="استماع" onPress={() => Speech.speak(item.text, { language: 'ar-SA' })} />
                    <GhostButton label={done ? 'أُنجز' : 'تسبيحة'} onPress={() => incrementAzkar(item.id)} />
                  </View>
                </View>
              </SurfaceCard>
            );
          }}
          ListFooterComponent={
            filteredEntries.length > visibleCount ? (
              <GhostButton label="تحميل المزيد" onPress={() => setVisibleCount((count) => count + 12)} />
            ) : null
          }
        />
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
  search: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceStrong,
    color: theme.colors.cream,
    padding: 14,
    fontFamily: theme.fonts.body,
  },
  catalogRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  list: {
    gap: 12,
  },
  collectionTitle: {
    color: theme.colors.goldLight,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 13,
    textAlign: 'right',
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
  counterActions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  counterText: {
    color: theme.colors.goldLight,
    fontFamily: theme.fonts.bodyBlack,
    fontSize: 15,
  },
});
