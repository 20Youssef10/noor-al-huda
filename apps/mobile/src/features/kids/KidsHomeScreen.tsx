import * as Speech from 'expo-speech';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../../lib/theme';
import { Page, SurfaceCard } from '../../components/ui';

const letters = ['ا','ب','ت','ث','ج','ح','خ','د','ذ','ر','ز','س','ش','ص','ض','ط','ظ','ع','غ','ف','ق','ك','ل','م','ن','هـ','و','ي'];

export function KidsHomeScreen() {
  const [stars, setStars] = useState(0);

  return (
    <Page>
      <SurfaceCard accent="emerald">
        <Text style={styles.title}>وضع الأطفال</Text>
        <Text style={styles.subtitle}>نجومك اليوم: {stars} ⭐</Text>
      </SurfaceCard>
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
    </Page>
  );
}

const styles = StyleSheet.create({
  title: { color: theme.colors.goldLight, fontFamily: theme.fonts.display, fontSize: 28, textAlign: 'right' },
  subtitle: { color: theme.colors.cream, fontFamily: theme.fonts.bodyBold, fontSize: 16, textAlign: 'right' },
  grid: { gap: 12 },
  letterCard: { flex: 1, minWidth: 70, margin: 6, aspectRatio: 1, borderRadius: 18, backgroundColor: '#234A66', alignItems: 'center', justifyContent: 'center' },
  letter: { color: '#fff', fontFamily: theme.fonts.display, fontSize: 38 },
});
