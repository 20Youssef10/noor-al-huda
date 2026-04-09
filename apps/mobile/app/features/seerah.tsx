import { StyleSheet, Text, View } from 'react-native';

import { Page, SectionHeader, SurfaceCard } from '../../src/components/ui';
import { prophetStories } from '../../src/data/islamicHistory';
import { theme } from '../../src/lib/theme';

export default function SeerahScreen() {
  return (
    <Page>
      <SectionHeader title="السيرة والقصص" subtitle="سيرة النبي ﷺ وقصص الأنبياء" />
      <SurfaceCard accent="emerald">
        <Text style={styles.featureTitle}>السيرة النبوية وقصص الأنبياء</Text>
        {prophetStories.map((story) => (
          <View key={story.id} style={styles.storyCard}>
            <Text style={styles.storyTitle}>{story.title}</Text>
            <Text style={styles.storySummary}>{story.summary}</Text>
            <Text style={styles.storyLessons}>الدروس: {story.lessons.join(' • ')}</Text>
          </View>
        ))}
      </SurfaceCard>
    </Page>
  );
}

const styles = StyleSheet.create({
  featureTitle: { color: theme.colors.goldLight, fontFamily: theme.fonts.display, fontSize: 28, textAlign: 'right' },
  storyCard: { borderRadius: 18, padding: 14, backgroundColor: theme.colors.surfaceStrong, gap: 8 },
  storyTitle: { color: theme.colors.cream, fontFamily: theme.fonts.bodyBold, fontSize: 17, textAlign: 'right' },
  storySummary: { color: theme.colors.creamMuted, fontFamily: theme.fonts.body, fontSize: 14, lineHeight: 23, textAlign: 'right' },
  storyLessons: { color: theme.colors.goldLight, fontFamily: theme.fonts.bodyBold, fontSize: 13, textAlign: 'right' },
});
