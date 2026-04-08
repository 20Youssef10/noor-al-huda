import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { Link } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { EmptyState, GhostButton, Page, SectionHeader } from '../../src/components/ui';
import { fetchHadithCollections, fetchHadithPage } from '../../src/features/hadith/service';
import { theme } from '../../src/lib/theme';

export default function HadithFeatureScreen() {
  const [collectionId, setCollectionId] = useState('5');
  const [search, setSearch] = useState('');

  const collectionsQuery = useQuery({
    queryKey: ['hadith-collections'],
    queryFn: fetchHadithCollections,
  });

  const hadithQuery = useInfiniteQuery({
    queryKey: ['hadith-pages', collectionId],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => fetchHadithPage(collectionId, pageParam),
    getNextPageParam: (lastPage) => (lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined),
  });

  const items = useMemo(() => hadithQuery.data?.pages.flatMap((page) => page.items) ?? [], [hadithQuery.data]);
  const filtered = useMemo(() => {
    const needle = search.trim();
    if (!needle) {
      return items;
    }
    return items.filter((item) => item.title.includes(needle));
  }, [items, search]);

  return (
    <Page>
      <SectionHeader title="مكتبة الحديث" subtitle="كتب ومجموعات مع بحث وتمرير لا نهائي" />
      <TextInput
        style={styles.search}
        value={search}
        onChangeText={setSearch}
        placeholder="ابحث بكلمة من عنوان الحديث"
        placeholderTextColor={theme.colors.creamFaint}
        textAlign="right"
      />
      <View style={styles.collectionsRow}>
        {(collectionsQuery.data ?? []).map((item) => (
          <GhostButton key={item.id} label={`${item.title} (${item.count})`} onPress={() => setCollectionId(item.id)} />
        ))}
      </View>
      {hadithQuery.isLoading ? (
        <ActivityIndicator color={theme.colors.goldLight} />
      ) : filtered.length ? (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          onEndReached={() => {
            if (hadithQuery.hasNextPage && !hadithQuery.isFetchingNextPage) {
              void hadithQuery.fetchNextPage();
            }
          }}
          renderItem={({ item }) => (
            <Link href={`/hadith/${item.id}`} asChild>
              <Pressable style={styles.card}>
                <Text style={styles.title}>{item.title}</Text>
              </Pressable>
            </Link>
          )}
          ListFooterComponent={hadithQuery.isFetchingNextPage ? <ActivityIndicator color={theme.colors.goldLight} /> : null}
        />
      ) : (
        <EmptyState title="لا توجد نتائج" message="جرّب مجموعة أخرى أو كلمة بحث مختلفة." />
      )}
    </Page>
  );
}

const styles = StyleSheet.create({
  search: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceStrong,
    color: theme.colors.cream,
    padding: 14,
    fontFamily: theme.fonts.body,
  },
  collectionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  list: {
    gap: 12,
  },
  card: {
    borderRadius: 20,
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.18)',
  },
  title: {
    color: theme.colors.cream,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 15,
    textAlign: 'right',
    lineHeight: 24,
  },
});
