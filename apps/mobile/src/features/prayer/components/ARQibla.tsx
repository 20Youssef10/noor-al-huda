import { useQuery } from '@tanstack/react-query';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Accelerometer, Magnetometer } from 'expo-sensors';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';
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
  const [tilt, setTilt] = useState(0);
  const [quality, setQuality] = useState<'green' | 'yellow' | 'red'>('red');
  const arrowRotation = useSharedValue(0);
  const ringRotation = useSharedValue(0);

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

    const accelSub = Accelerometer.addListener(({ z }) => {
      setTilt(Number((Math.abs(z) * 90).toFixed(1)));
    });

    return () => {
      sub.remove();
      accelSub.remove();
    };
  }, [query.data?.magneticDeclination, requestPermission]);

  useEffect(() => {
    if (!query.data) return;
    const delta = ((query.data.qiblaDegrees - compassHeading) + 360) % 360;
    const normalized = delta > 180 ? 360 - delta : delta;
    setQuality(normalized <= 2 ? 'green' : normalized <= 5 ? 'yellow' : 'red');
    arrowRotation.value = withSpring(delta, { damping: 15 });
    ringRotation.value = withTiming(-compassHeading, { duration: 180 });
  }, [arrowRotation, compassHeading, query.data]);

  const arrowStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${arrowRotation.value}deg` }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${ringRotation.value}deg` }],
  }));

  const bearingText = useMemo(
    () => `${query.data?.qiblaDegrees?.toFixed(1) ?? '--'}°`,
    [query.data?.qiblaDegrees]
  );

  return (
    <SurfaceCard accent="blue">
      <Text style={styles.title}>بوصلة القبلة المعززة</Text>
      <View style={styles.cameraFrame}>
        {permission?.granted ? <CameraView style={StyleSheet.absoluteFillObject} facing="back" /> : <Text style={styles.overlayText}>اسمح للكاميرا لإظهار القبلة المعززة.</Text>}
        <Animated.View style={[styles.ringWrapper, ringStyle]}>
          <Svg width={260} height={260} viewBox="0 0 260 260">
            <Circle cx="130" cy="130" r="112" stroke="rgba(248,243,232,0.25)" strokeWidth="2" fill="none" />
            <Circle cx="130" cy="130" r="86" stroke="rgba(201,168,76,0.18)" strokeWidth="1.5" fill="none" />
          </Svg>
        </Animated.View>
        <Animated.View style={[styles.arrowWrapper, arrowStyle]}>
          <Svg width={140} height={140} viewBox="0 0 140 140">
            <Path d="M70 8L92 64H78V132H62V64H48L70 8Z" fill={quality === 'green' ? '#4CAF50' : quality === 'yellow' ? '#F5B942' : '#F97316'} />
          </Svg>
        </Animated.View>
        <View style={styles.centerBadge}>
          <Text style={styles.centerValue}>{bearingText}</Text>
          <Text style={styles.centerHint}>الموضع الحالي</Text>
        </View>
      </View>
      {query.isError ? <Text style={styles.caption}>تعذر جلب اتجاه القبلة حالياً. جرّب لاحقاً أو حدّث الموقع.</Text> : null}
      <Text style={styles.caption}>حرّك الجهاز على شكل الرقم 8 لتحسين المعايرة. الدقة: {quality === 'green' ? 'ممتازة' : quality === 'yellow' ? 'جيدة' : 'منخفضة'} · ميل الجهاز: {tilt}°</Text>
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  title: { color: theme.colors.goldLight, fontFamily: theme.fonts.display, fontSize: 24, textAlign: 'right' },
  cameraFrame: { height: 300, borderRadius: 24, overflow: 'hidden', backgroundColor: '#111' },
  ringWrapper: { position: 'absolute', insetInlineStart: '50%', top: '50%', marginStart: -130, marginTop: -130 },
  arrowWrapper: { position: 'absolute', insetInlineStart: '50%', top: '50%', marginStart: -70, marginTop: -70 },
  centerBadge: { position: 'absolute', insetInlineStart: '50%', top: '50%', marginStart: -50, marginTop: -32, width: 100, alignItems: 'center' },
  centerValue: { color: theme.colors.goldLight, fontFamily: theme.fonts.bodyBlack, fontSize: 22 },
  centerHint: { color: theme.colors.creamFaint, fontFamily: theme.fonts.body, fontSize: 11 },
  overlayText: { color: theme.colors.cream, fontFamily: theme.fonts.body, fontSize: 14, textAlign: 'center', marginTop: 132 },
  caption: { color: theme.colors.creamMuted, fontFamily: theme.fonts.body, fontSize: 13, textAlign: 'right' },
});
