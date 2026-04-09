import { useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

import { theme } from '../../lib/theme';
import { GhostButton, SurfaceCard } from '../../components/ui';

export interface ShareCardProps {
  type: 'ayah' | 'hadith' | 'azkar';
  content_ar: string;
  source: string;
  template_id: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  format: 'story' | 'square';
}

const templateMap: Record<ShareCardProps['template_id'], { background: string; accent: string; text: string }> = {
  1: { background: '#0D3D22', accent: '#D4AF37', text: '#F8F3E8' },
  2: { background: '#F5E8C0', accent: '#7A5933', text: '#2A2016' },
  3: { background: '#101A38', accent: '#F8F3E8', text: '#F8F3E8' },
  4: { background: '#FFFFFF', accent: '#D4AF37', text: '#13100A' },
  5: { background: '#1A6B3C', accent: '#E8C97A', text: '#FFFFFF' },
  6: { background: '#DFC7A6', accent: '#A9603C', text: '#2F2318' },
  7: { background: '#0A1628', accent: '#C9D7F2', text: '#FFFFFF' },
  8: { background: '#EFD5D8', accent: '#B76E79', text: '#351E24' },
  9: { background: '#CBE6D1', accent: '#1A6B3C', text: '#101510' },
  10: { background: '#111111', accent: '#D4AF37', text: '#FFFFFF' },
  11: { background: '#D46A32', accent: '#FFE4A7', text: '#FFFFFF' },
  12: { background: '#FFFFFF', accent: '#C9A84C', text: '#1A1A1A' },
};

export function ShareCardGenerator(props: ShareCardProps) {
  const ref = useRef<ViewShot>(null);
  const [content, setContent] = useState(props.content_ar);
  const [source, setSource] = useState(props.source);
  const [templateId, setTemplateId] = useState<ShareCardProps['template_id']>(props.template_id);
  const [format, setFormat] = useState<ShareCardProps['format']>(props.format);
  const [customBackground, setCustomBackground] = useState('');
  const palette = useMemo(() => templateMap[templateId], [templateId]);
  const height = format === 'story' ? 640 : 420;

  async function captureAndShare() {
    const uri = await ref.current?.capture?.();
    if (uri) {
      await Sharing.shareAsync(uri);
    }
  }

  return (
    <SurfaceCard>
      <View style={styles.controls}>
        <TextInput style={styles.input} value={content} onChangeText={setContent} placeholder="النص" placeholderTextColor={theme.colors.creamFaint} multiline textAlign="right" />
        <TextInput style={styles.input} value={source} onChangeText={setSource} placeholder="المصدر" placeholderTextColor={theme.colors.creamFaint} textAlign="right" />
        <TextInput style={styles.input} value={customBackground} onChangeText={setCustomBackground} placeholder="لون الخلفية #0D3D22" placeholderTextColor={theme.colors.creamFaint} textAlign="left" />
        <View style={styles.chips}>
          {[1,2,3,4,5,6,7,8,9,10,11,12].map((item) => (
            <GhostButton key={item} label={`قالب ${item}`} onPress={() => setTemplateId(item as ShareCardProps['template_id'])} />
          ))}
        </View>
        <View style={styles.chips}>
          <GhostButton label="Story" onPress={() => setFormat('story')} />
          <GhostButton label="Square" onPress={() => setFormat('square')} />
        </View>
      </View>
      <ViewShot ref={ref} options={{ format: 'png', quality: 1 }} style={[styles.card, { backgroundColor: customBackground || palette.background, height }]}> 
        <View style={[styles.border, { borderColor: palette.accent }]}> 
          <Text style={[styles.content, { color: palette.text }]}>{content}</Text>
          <Text style={[styles.source, { color: palette.accent }]}>{source}</Text>
          <Text style={[styles.brand, { color: palette.text }]}>نور الهدى</Text>
        </View>
      </ViewShot>
      <GhostButton label="مشاركة البطاقة" onPress={() => void captureAndShare()} />
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  controls: { gap: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  input: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceStrong,
    color: theme.colors.cream,
    padding: 14,
    fontFamily: theme.fonts.body,
  },
  card: { width: '100%', borderRadius: 28, overflow: 'hidden' },
  border: { flex: 1, margin: 24, borderWidth: 2, borderRadius: 22, padding: 24, justifyContent: 'space-between' },
  content: { fontFamily: theme.fonts.arabic, fontSize: 28, lineHeight: 48, textAlign: 'right' },
  source: { fontFamily: theme.fonts.bodyBold, fontSize: 16, textAlign: 'right' },
  brand: { fontFamily: theme.fonts.display, fontSize: 32, textAlign: 'center' },
});
