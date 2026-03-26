import { Page, SectionHeader, SurfaceCard } from '../../src/components/ui';
import { VoiceCommandButton } from '../../src/features/voice/VoiceCommandButton';
import { StyleSheet, Text } from 'react-native';
import { theme } from '../../src/lib/theme';

export default function VoiceFeatureScreen() {
  return (
    <Page>
      <SectionHeader title="الأوامر الصوتية" subtitle="تحكم وتنقل بالعربية دون لمس" />
      <SurfaceCard accent="blue">
        <Text style={styles.text}>اضغط مطولاً على الزر لتسجيل أمر صوتي، ثم سيحاول التطبيق فهم نيتك وتنفيذها.</Text>
        <VoiceCommandButton />
      </SurfaceCard>
    </Page>
  );
}

const styles = StyleSheet.create({
  text: { color: theme.colors.creamMuted, fontFamily: theme.fonts.body, fontSize: 14, lineHeight: 22, textAlign: 'right' },
});
