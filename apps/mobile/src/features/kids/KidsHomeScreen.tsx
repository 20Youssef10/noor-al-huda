import * as Speech from 'expo-speech';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { prophetStories } from '../../data/islamicHistory';
import { theme } from '../../lib/theme';
import { Page, SurfaceCard } from '../../components/ui';

const letters = ['ا','ب','ت','ث','ج','ح','خ','د','ذ','ر','ز','س','ش','ص','ض','ط','ظ','ع','غ','ف','ق','ك','ل','م','ن','هـ','و','ي'];
const shortSurahs = [
  { id: 1, title: 'الفاتحة', excerpt: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ' },
  { id: 112, title: 'الإخلاص', excerpt: 'قُلْ هُوَ اللَّهُ أَحَدٌ' },
  { id: 113, title: 'الفلق', excerpt: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ' },
  { id: 114, title: 'الناس', excerpt: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ' },
];

export function KidsHomeScreen() {
  const [stars, setStars] = useState(0);
  const [tab, setTab] = useState<'letters' | 'surahs' | 'stories' | 'rewards'>('letters');
  const [activeStoryId, setActiveStoryId] = useState(prophetStories[0]?.id ?? 'muhammad');
  const activeStory = useMemo(
    () => prophetStories.find((item) => item.id === activeStoryId) ?? prophetStories[0],
    [activeStoryId]
  );

  return (
    <Page>
      <SurfaceCard accent="emerald">
        <Text style={styles.title}>وضع الأطفال</Text>
        <Text style={styles.subtitle}>نجومك اليوم: {stars} ⭐</Text>
        <View style={styles.tabsRow}>
          <Pressable style={styles.tabChip} onPress={() => setTab('letters')}><Text style={styles.tabText}>الحروف</Text></Pressable>
          <Pressable style={styles.tabChip} onPress={() => setTab('surahs')}><Text style={styles.tabText}>السور</Text></Pressable>
          <Pressable style={styles.tabChip} onPress={() => setTab('stories')}><Text style={styles.tabText}>القصص</Text></Pressable>
          <Pressable style={styles.tabChip} onPress={() => setTab('rewards')}><Text style={styles.tabText}>المكافآت</Text></Pressable>
        </View>
      </SurfaceCard>
      {tab === 'letters' ? (
        <FlatList
          data={letters}
          numColumns={4}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.grid}
          renderItem={({ item }) => (
            <Pressable
              accessibilityLabel={`حرف ${item}`}
              onPress={() => {
                Speech.speak(item, { language: 'ar' });
                setStars((value) => value + 1);
              }}
              style={styles.letterCard}
            >
              <Text style={styles.letter}>{item}</Text>
            </Pressable>
          )}
        />
      ) : null}
      {tab === 'surahs' ? (
        <View style={styles.storyList}>
          {shortSurahs.map((surah) => (
            <SurfaceCard key={surah.id} accent="blue">
              <Text style={styles.storyTitle}>{surah.title}</Text>
              <Text style={styles.storySummary}>{surah.excerpt}</Text>
              <Pressable style={styles.listenButton} onPress={() => {
                Speech.speak(surah.excerpt, { language: 'ar-SA' });
                setStars((value) => value + 1);
              }}>
                <Text style={styles.listenText}>استمع</Text>
              </Pressable>
            </SurfaceCard>
          ))}
        </View>
      ) : null}
      {tab === 'stories' && activeStory ? (
        <View style={styles.storyList}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
            {prophetStories.map((story) => (
              <Pressable key={story.id} style={styles.tabChip} onPress={() => setActiveStoryId(story.id)}>
                <Text style={styles.tabText}>{story.title}</Text>
              </Pressable>
            ))}
          </ScrollView>
          <SurfaceCard accent="blue">
            <Text style={styles.storyTitle}>{activeStory.title}</Text>
            <Text style={styles.storySummary}>{activeStory.summary}</Text>
            <Text style={styles.storySummary}>الدروس: {activeStory.lessons.join(' • ')}</Text>
          </SurfaceCard>
        </View>
      ) : null}
      {tab === 'rewards' ? (
        <View style={styles.rewardGrid}>
          {Array.from({ length: Math.max(stars, 8) }, (_, index) => (
            <View key={index} style={styles.rewardTile}><Text style={styles.rewardText}>⭐</Text></View>
          ))}
        </View>
      ) : null}
    </Page>
  );
}

const styles = StyleSheet.create({
  title: { color: theme.colors.goldLight, fontFamily: theme.fonts.display, fontSize: 28, textAlign: 'right' },
  subtitle: { color: theme.colors.cream, fontFamily: theme.fonts.bodyBold, fontSize: 16, textAlign: 'right' },
  tabsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tabChip: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: 'rgba(201,168,76,0.15)' },
  tabText: { color: theme.colors.goldLight, fontFamily: theme.fonts.bodyBold, fontSize: 12 },
  grid: { gap: 12 },
  storyList: { gap: 12 },
  letterCard: { flex: 1, minWidth: 70, margin: 6, aspectRatio: 1, borderRadius: 18, backgroundColor: '#234A66', alignItems: 'center', justifyContent: 'center' },
  letter: { color: '#fff', fontFamily: theme.fonts.display, fontSize: 38 },
  storyTitle: { color: theme.colors.goldLight, fontFamily: theme.fonts.display, fontSize: 24, textAlign: 'right' },
  storySummary: { color: theme.colors.cream, fontFamily: theme.fonts.body, fontSize: 14, lineHeight: 24, textAlign: 'right' },
  listenButton: { alignSelf: 'flex-start', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: theme.colors.gold },
  listenText: { color: '#1A140A', fontFamily: theme.fonts.bodyBold, fontSize: 13 },
  rewardGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  rewardTile: { width: 64, height: 64, borderRadius: 18, backgroundColor: 'rgba(201,168,76,0.15)', alignItems: 'center', justifyContent: 'center' },
  rewardText: { fontSize: 28 },
});
