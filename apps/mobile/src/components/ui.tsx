import { LinearGradient } from 'expo-linear-gradient';
import { type PropsWithChildren, type ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { gradients, theme } from '../lib/theme';

export function Page({ children }: PropsWithChildren) {
  return (
    <LinearGradient colors={gradients.hero} style={styles.page}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </LinearGradient>
  );
}

export function SurfaceCard({
  children,
  accent = 'gold',
}: PropsWithChildren<{ accent?: 'gold' | 'emerald' | 'blue' }>) {
  const accentStyle =
    accent === 'emerald'
      ? styles.cardEmerald
      : accent === 'blue'
        ? styles.cardBlue
        : styles.cardGold;

  return <View style={[styles.card, accentStyle]}>{children}</View>;
}

export function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionHeaderText}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      </View>
      {action}
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  tone = 'gold',
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  tone?: 'gold' | 'emerald';
  disabled?: boolean;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.button,
        tone === 'emerald' ? styles.buttonEmerald : styles.buttonGold,
        disabled ? styles.buttonDisabled : null,
      ]}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

export function GhostButton({
  label,
  onPress,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable disabled={disabled} onPress={onPress} style={[styles.ghostButton, disabled ? styles.ghostButtonDisabled : null]}>
      <Text style={[styles.ghostButtonText, disabled ? styles.ghostButtonTextDisabled : null]}>{label}</Text>
    </Pressable>
  );
}

export function Badge({ label }: { label: string }) {
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );
}

export function MetricTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <View style={styles.metricTile}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      {hint ? <Text style={styles.metricHint}>{hint}</Text> : null}
    </View>
  );
}

export function TextField({
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
}) {
  return (
    <TextInput
      placeholder={placeholder}
      placeholderTextColor={theme.colors.creamFaint}
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      textAlign="right"
      autoCapitalize="none"
    />
  );
}

export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <SurfaceCard accent="blue">
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyMessage}>{message}</Text>
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 26,
    paddingBottom: 42,
    gap: 18,
  },
  card: {
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    backgroundColor: theme.colors.surface,
    gap: 12,
    ...theme.shadow.card,
  },
  cardGold: {
    borderColor: 'rgba(201,168,76,0.22)',
  },
  cardEmerald: {
    borderColor: 'rgba(42,157,92,0.22)',
  },
  cardBlue: {
    borderColor: 'rgba(79,142,247,0.22)',
  },
  sectionHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  sectionHeaderText: {
    flex: 1,
    gap: 4,
  },
  sectionTitle: {
    color: theme.colors.goldLight,
    fontFamily: theme.fonts.display,
    fontSize: 28,
    textAlign: 'right',
  },
  sectionSubtitle: {
    color: theme.colors.creamFaint,
    fontFamily: theme.fonts.body,
    fontSize: 13,
    textAlign: 'right',
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonGold: {
    backgroundColor: theme.colors.gold,
  },
  buttonEmerald: {
    backgroundColor: theme.colors.emerald,
  },
  buttonText: {
    color: '#1A140A',
    fontFamily: theme.fonts.bodyBold,
    fontSize: 14,
  },
  buttonDisabled: {
    opacity: 0.48,
  },
  ghostButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  ghostButtonDisabled: {
    opacity: 0.46,
  },
  ghostButtonText: {
    color: theme.colors.cream,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 13,
  },
  ghostButtonTextDisabled: {
    color: theme.colors.creamFaint,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: 'rgba(201,168,76,0.16)',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    color: theme.colors.goldLight,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 12,
  },
  metricTile: {
    borderRadius: 18,
    padding: 14,
    backgroundColor: theme.colors.surfaceStrong,
    gap: 6,
    flex: 1,
    minWidth: 140,
  },
  metricLabel: {
    color: theme.colors.creamFaint,
    fontFamily: theme.fonts.body,
    fontSize: 12,
    textAlign: 'right',
  },
  metricValue: {
    color: theme.colors.cream,
    fontFamily: theme.fonts.bodyBlack,
    fontSize: 20,
    textAlign: 'right',
  },
  metricHint: {
    color: theme.colors.goldLight,
    fontFamily: theme.fonts.body,
    fontSize: 12,
    textAlign: 'right',
  },
  input: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: 'rgba(255,255,255,0.05)',
    color: theme.colors.cream,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: theme.fonts.body,
  },
  emptyTitle: {
    color: theme.colors.cream,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 16,
    textAlign: 'right',
  },
  emptyMessage: {
    color: theme.colors.creamMuted,
    fontFamily: theme.fonts.body,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'right',
  },
});
