import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../../lib/theme';

export function VoiceCommandButton() {
  return (
    <View style={styles.wrapper}>
      <View style={styles.button}>
        <Text style={styles.buttonText}>🎤</Text>
      </View>
      <Text style={styles.transcript}>الأوامر الصوتية الكاملة متاحة داخل التطبيق المحمول.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'flex-end', gap: 8 },
  button: { width: 64, height: 64, borderRadius: 32, backgroundColor: theme.colors.gold, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#1B150F', fontFamily: theme.fonts.bodyBlack, fontSize: 18 },
  transcript: { color: theme.colors.creamFaint, fontFamily: theme.fonts.body, fontSize: 12, textAlign: 'right' },
});
