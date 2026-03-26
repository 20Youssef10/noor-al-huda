import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';

import { theme } from '../../lib/theme';

export function AchievementUnlockToast({
  visible,
  title,
  icon,
}: {
  visible: boolean;
  title: string;
  icon: string;
}) {
  const offset = useSharedValue(140);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      offset.value = withSequence(withSpring(0), withTiming(0, { duration: 1800 }), withTiming(140));
      opacity.value = withSequence(withTiming(1), withTiming(1, { duration: 1800 }), withTiming(0));
    }
  }, [offset, opacity, visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: offset.value }],
  }));

  return (
    <Animated.View pointerEvents="none" style={[styles.wrapper, animatedStyle]}>
      <Text style={styles.icon}>{icon}</Text>
      <View style={styles.textBlock}>
        <Text style={styles.label}>إنجاز جديد</Text>
        <Text style={styles.title}>{title}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    insetInlineStart: 20,
    insetInlineEnd: 20,
    bottom: 24,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 16,
    backgroundColor: 'rgba(201,168,76,0.96)',
    flexDirection: 'row-reverse',
    gap: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 10,
  },
  icon: {
    fontSize: 28,
  },
  textBlock: {
    flex: 1,
  },
  label: {
    color: '#1B150F',
    fontFamily: theme.fonts.bodyBold,
    fontSize: 12,
    textAlign: 'right',
  },
  title: {
    color: '#1B150F',
    fontFamily: theme.fonts.bodyBlack,
    fontSize: 16,
    textAlign: 'right',
  },
});
