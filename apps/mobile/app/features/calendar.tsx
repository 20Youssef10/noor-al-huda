import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Page, SectionHeader, SurfaceCard } from '../../src/components/ui';
import { islamicEvents } from '../../src/data/islamicHistory';
import { theme } from '../../src/lib/theme';

function getHijriDateParts() {
  const formatter = new Intl.DateTimeFormat('ar-TN-u-ca-islamic', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });
  return formatter.format(new Date());
}

export default function HijriCalendarScreen() {
  return (
    <Page>
      <SectionHeader title="التقويم الهجري" subtitle={getHijriDateParts()} />
      <SurfaceCard accent="emerald">
        <Text style={styles.title}>المناسبات الإسلامية</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.eventRow}>
          {islamicEvents.map((event) => (
            <View key={event.id} style={styles.eventCard}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Text style={styles.eventDate}>{event.hijriDay}/{event.hijriMonth}</Text>
              <Text style={styles.eventText}>{event.description}</Text>
            </View>
          ))}
        </ScrollView>
      </SurfaceCard>
    </Page>
  );
}

const styles = StyleSheet.create({
  title: { color: theme.colors.goldLight, fontFamily: theme.fonts.display, fontSize: 26, textAlign: 'right' },
  eventRow: { gap: 12 },
  eventCard: { width: 220, borderRadius: 20, padding: 16, backgroundColor: theme.colors.surfaceStrong, gap: 8 },
  eventTitle: { color: theme.colors.cream, fontFamily: theme.fonts.bodyBold, fontSize: 16, textAlign: 'right' },
  eventDate: { color: theme.colors.goldLight, fontFamily: theme.fonts.bodyBlack, fontSize: 14, textAlign: 'right' },
  eventText: { color: theme.colors.creamMuted, fontFamily: theme.fonts.body, fontSize: 13, lineHeight: 22, textAlign: 'right' },
});
