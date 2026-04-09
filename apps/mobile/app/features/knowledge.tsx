import * as Speech from 'expo-speech';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';

import { GhostButton, Page, SectionHeader, SurfaceCard } from '../../src/components/ui';
import { ebookLibrary, faqItems, livestreamChannels, namesOfAllah, profileSections, prophetBiography, ruqyahCollection, yearlyMilestones } from '../../src/features/knowledge/data';
import { theme } from '../../src/lib/theme';

export default function KnowledgeFeatureScreen() {
  return (
    <Page>
      <SectionHeader title="المعرفة الإسلامية" subtitle="أسماء الله، الرقية، الأسئلة، الكتب، والبث المباشر" />

      <SurfaceCard accent="emerald">
        <Text style={styles.sectionTitle}>أسماء الله الحسنى</Text>
        {namesOfAllah.map((item) => (
          <View key={item.id} style={styles.block}>
            <Text style={styles.blockTitle}>{item.name}</Text>
            <Text style={styles.bodyText}>{item.meaning}</Text>
            <Text style={styles.highlightText}>{item.virtue}</Text>
          </View>
        ))}
      </SurfaceCard>

      <SurfaceCard accent="blue">
        <Text style={styles.sectionTitle}>الرقية الشرعية</Text>
        {ruqyahCollection.map((item) => (
          <View key={item.id} style={styles.block}>
            <Text style={styles.blockTitle}>{item.title}</Text>
            <Text style={styles.bodyText}>{item.text}</Text>
            <GhostButton label="استماع" onPress={() => Speech.speak(item.text, { language: 'ar-SA' })} />
          </View>
        ))}
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>فقه وسؤال وجواب</Text>
        {faqItems.map((item) => (
          <View key={item.id} style={styles.block}>
            <Text style={styles.highlightText}>{item.category}</Text>
            <Text style={styles.blockTitle}>{item.question}</Text>
            <Text style={styles.bodyText}>{item.answer}</Text>
          </View>
        ))}
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>مكتبة الكتب المختارة</Text>
        {ebookLibrary.map((item) => (
          <View key={item.id} style={styles.block}>
            <Text style={styles.blockTitle}>{item.title}</Text>
            <Text style={styles.bodyText}>{item.description}</Text>
            <Text style={styles.highlightText}>{item.type.toUpperCase()}</Text>
          </View>
        ))}
      </SurfaceCard>

      <SurfaceCard accent="blue">
        <Text style={styles.sectionTitle}>قنوات وبث مباشر</Text>
        {livestreamChannels.map((item) => (
          <GhostButton key={item.id} label={item.title} onPress={() => void Linking.openURL(item.url)} />
        ))}
      </SurfaceCard>

      <SurfaceCard accent="emerald">
        <Text style={styles.sectionTitle}>{prophetBiography.title}</Text>
        <Text style={styles.bodyText}>{prophetBiography.summary}</Text>
        <Text style={styles.highlightText}>{prophetBiography.lessons.join(' • ')}</Text>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>متابعة الحفظ والالتزام</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
          {yearlyMilestones.map((item) => (
            <View key={item.month} style={styles.metricCard}>
              <Text style={styles.blockTitle}>{item.month}</Text>
              <Text style={styles.bodyText}>صفحات القرآن: {item.quranPages}</Text>
              <Text style={styles.bodyText}>أيام الذكر: {item.azkarDays}</Text>
            </View>
          ))}
        </ScrollView>
      </SurfaceCard>

      <SurfaceCard accent="blue">
        <Text style={styles.sectionTitle}>الملف الشخصي</Text>
        {profileSections.map((item) => (
          <View key={item.id} style={styles.block}>
            <Text style={styles.blockTitle}>{item.title}</Text>
            <Text style={styles.bodyText}>{item.description}</Text>
          </View>
        ))}
      </SurfaceCard>
    </Page>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { color: theme.colors.goldLight, fontFamily: theme.fonts.display, fontSize: 26, textAlign: 'right' },
  block: { borderRadius: 18, padding: 14, backgroundColor: theme.colors.surfaceStrong, gap: 8 },
  blockTitle: { color: theme.colors.cream, fontFamily: theme.fonts.bodyBold, fontSize: 16, textAlign: 'right' },
  bodyText: { color: theme.colors.creamMuted, fontFamily: theme.fonts.body, fontSize: 14, lineHeight: 23, textAlign: 'right' },
  highlightText: { color: theme.colors.goldLight, fontFamily: theme.fonts.bodyBold, fontSize: 13, textAlign: 'right' },
  row: { gap: 12 },
  metricCard: { width: 220, borderRadius: 18, padding: 14, backgroundColor: theme.colors.surfaceStrong, gap: 8 },
});
