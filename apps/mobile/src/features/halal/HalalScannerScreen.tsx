import { useState } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useQueryClient } from '@tanstack/react-query';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { z } from 'zod';

import { jsonRequest } from '../../lib/api';
import { putCachedContent } from '../../lib/sqlite';
import { theme } from '../../lib/theme';
import { Page, SurfaceCard } from '../../components/ui';

const verdictSchema = z.object({
  found: z.boolean(),
  name: z.string().optional(),
  verdict: z.enum(['haram', 'doubtful', 'likely_halal']).optional(),
  haram_ingredients: z.array(z.string()).optional(),
  doubtful_ingredients: z.array(z.string()).optional(),
  ingredients_raw: z.string().optional(),
  disclaimer: z.string().optional(),
});

export function HalalScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [payload, setPayload] = useState<z.infer<typeof verdictSchema> | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleScan(barcode: string) {
    if (busy) return;
    setBusy(true);
    try {
      const result = await jsonRequest(`/api/halal/scan?barcode=${barcode}`, verdictSchema);
      setPayload(result);
      await putCachedContent('halal_scans', barcode, { ...result, scanned_at: new Date().toISOString() });
    } catch (error) {
      Alert.alert('تعذر التحليل', error instanceof Error ? error.message : 'حدث خطأ أثناء تحليل المنتج.');
    } finally {
      setTimeout(() => setBusy(false), 1500);
    }
  }

  return (
    <Page>
      <SurfaceCard accent="blue">
        <Text style={styles.title}>ماسح المنتجات الحلال</Text>
        <View style={styles.cameraBox}>
          {permission?.granted ? (
            <CameraView
              style={StyleSheet.absoluteFillObject}
              onBarcodeScanned={({ data }) => void handleScan(data)}
            />
          ) : (
            <Text onPress={() => void requestPermission()} style={styles.caption}>اسمح للكاميرا للبدء بالمسح.</Text>
          )}
          <View style={styles.scanLine} />
        </View>
        {payload ? (
          <View style={styles.resultBox}>
            <Text style={[styles.badge, payload.verdict === 'haram' ? styles.red : payload.verdict === 'doubtful' ? styles.yellow : styles.green]}>
              {payload.verdict === 'haram' ? 'غير حلال' : payload.verdict === 'doubtful' ? 'يحتاج تحقق' : 'غالباً حلال'}
            </Text>
            <Text style={styles.productName}>{payload.name ?? 'منتج غير معروف'}</Text>
            <Text style={styles.caption}>{payload.disclaimer}</Text>
          </View>
        ) : null}
      </SurfaceCard>
    </Page>
  );
}

const styles = StyleSheet.create({
  title: { color: theme.colors.goldLight, fontFamily: theme.fonts.display, fontSize: 24, textAlign: 'right' },
  cameraBox: { height: 320, borderRadius: 22, overflow: 'hidden', backgroundColor: '#111' },
  scanLine: { position: 'absolute', top: '50%', left: 24, right: 24, height: 2, backgroundColor: '#F97316' },
  resultBox: { gap: 8 },
  badge: { alignSelf: 'flex-end', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, overflow: 'hidden', color: '#fff', fontFamily: theme.fonts.bodyBold },
  red: { backgroundColor: '#B91C1C' },
  yellow: { backgroundColor: '#CA8A04' },
  green: { backgroundColor: '#15803D' },
  productName: { color: theme.colors.cream, fontFamily: theme.fonts.bodyBlack, fontSize: 18, textAlign: 'right' },
  caption: { color: theme.colors.creamFaint, fontFamily: theme.fonts.body, fontSize: 13, textAlign: 'right' },
});
