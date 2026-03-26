import { useQuery } from '@tanstack/react-query';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Accelerometer, Magnetometer } from 'expo-sensors';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { z } from 'zod';

import { jsonRequest } from '../../../lib/api';
import { theme } from '../../../lib/theme';
import { SurfaceCard } from '../../../components/ui';

const qiblaSchema = z.object({
  locationLabel: z.string(),
  qiblaDegrees: z.number(),
  magneticDeclination: z.number().optional(),
});

export function ARQibla({ latitude, longitude }: { latitude: number; longitude: number }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [compassHeading, setCompassHeading] = useState(0);
  const [quality, setQuality] = useState<'green' | 'yellow' | 'red'>('red');
  const arrowRotation = useSharedValue(0);

  const query = useQuery({
    queryKey: ['qibla', latitude, longitude],
    queryFn: () =>
      jsonRequest(`/api/qibla?lat=${latitude}&lng=${longitude}`, qiblaSchema),
  });

  useEffect(() => {
    void requestPermission();
    Magnetometer.setUpdateInterval(100);
    Accelerometer.setUpdateInterval(250);

    const sub = Magnetometer.addListener(({ x, y }) => {
      let angle = Math.atan2(y, x) * (180 / Math.PI);
      if (angle < 0) angle += 360;
      const corrected = (angle + (query.data?.magneticDeclination ?? 0) + 360) % 360;
      setCompassHeading(corrected);
    });

    return () => {
      sub.remove();
    };
  }, [query.data?.magneticDeclination, requestPermission]);

  useEffect(() => {
    if (!query.data) return;
    const delta = ((query.data.qiblaDegrees - compassHeading) + 360) % 360;
    const normalized = delta > 180 ? 360 - delta : delta;
    setQuality(normalized <= 2 ? 'green' : normalized <= 5 ? 'yellow' : 'red');
    arrowRotation.value = withSpring(delta, { damping: 15 });
  }, [arrowRotation, compassHeading, query.data]);

  const arrowStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${arrowRotation.value}deg` }],
  }));

  return (
    <SurfaceCard accent="blue">
      <Text style={styles.title}>بوصلة القبلة المعززة</Text>
      <View style={styles.cameraFrame}>
        {permission?.granted ? <CameraView style={StyleSheet.absoluteFillObject} facing="back" /> : null}
        <Animated.View style={[styles.arrowWrapper, arrowStyle]}>
          <Svg width={140} height={140} viewBox="0 0 140 140">
            <Path d="M70 8L92 64H78V132H62V64H48L70 8Z" fill={quality === 'green' ? '#4CAF50' : quality === 'yellow' ? '#F5B942' : '#F97316'} />
          </Svg>
        </Animated.View>
      </View>
      <Text style={styles.caption}>حرّك الجهاز على شكل الرقم 8 لتحسين المعايرة. الحالة: {quality === 'green' ? 'دقيقة' : quality === 'yellow' ? 'متوسطة' : 'تحتاج معايرة'}</Text>
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  title: { color: theme.colors.goldLight, fontFamily: theme.fonts.display, fontSize: 24, textAlign: 'right' },
  cameraFrame: { height: 300, borderRadius: 24, overflow: 'hidden', backgroundColor: '#111' },
  arrowWrapper: { position: 'absolute', insetInlineStart: '50%', top: '50%', marginStart: -70, marginTop: -70 },
  caption: { color: theme.colors.creamMuted, fontFamily: theme.fonts.body, fontSize: 13, textAlign: 'right' },
});
