import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ar } from '../i18n/ar';
import { theme } from '../../lib/theme';

export type VerificationLevel =
  | 'sahih_bukhari_muslim'
  | 'sahih'
  | 'hasan'
  | 'daif'
  | 'fabricated'
  | 'community_review'
  | 'unverified';

export interface VerificationBadgeData {
  level: VerificationLevel;
  source: string;
  verified_by: string;
  verified_at: string;
}

const badgeMap: Record<VerificationLevel, { label: string; tone: string; warning?: string }> = {
  sahih_bukhari_muslim: { label: 'صحيح - البخاري/مسلم', tone: '#1A6B3C' },
  sahih: { label: ar.verification.sahih, tone: '#1A6B3C' },
  hasan: { label: ar.verification.hasan, tone: '#8B6B12' },
  daif: { label: ar.verification.daif, tone: '#B35C00', warning: 'هذا حديث ضعيف، لا ينبغي العمل به دون بيان.' },
  fabricated: { label: ar.verification.fabricated, tone: '#8B1A1A', warning: 'هذا محتوى موضوع أو غير مقبول ولا يُعرض عادة.' },
  community_review: { label: ar.verification.community_review, tone: '#5C4C9E' },
  unverified: { label: ar.verification.unverified, tone: '#57606F' },
};

export function VerificationBadge({ badge }: { badge: VerificationBadgeData }) {
  const [expanded, setExpanded] = useState(false);
  const meta = useMemo(() => badgeMap[badge.level], [badge.level]);

  return (
    <View style={styles.wrapper}>
      <Pressable
        accessibilityLabel={`حالة التوثيق ${meta.label}`}
        onPress={() => setExpanded((value) => !value)}
        style={[styles.badge, { borderColor: meta.tone, backgroundColor: `${meta.tone}22` }]}
      >
        <Text style={[styles.badgeText, { color: meta.tone }]}>{meta.label}</Text>
      </Pressable>
      {expanded ? (
        <View style={styles.panel}>
          <Text style={styles.panelText}>المصدر: {badge.source}</Text>
          <Text style={styles.panelText}>راجعه: {badge.verified_by}</Text>
          <Text style={styles.panelText}>آخر تحديث: {badge.verified_at}</Text>
          {meta.warning ? <Text style={styles.warningText}>{meta.warning}</Text> : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'flex-end',
    gap: 8,
  },
  badge: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: {
    fontFamily: theme.fonts.bodyBold,
    fontSize: 12,
  },
  panel: {
    width: '100%',
    borderRadius: 16,
    padding: 12,
    backgroundColor: theme.colors.surfaceStrong,
    gap: 6,
  },
  panelText: {
    color: theme.colors.creamMuted,
    fontFamily: theme.fonts.body,
    fontSize: 13,
    textAlign: 'right',
  },
  warningText: {
    color: '#F7B267',
    fontFamily: theme.fonts.bodyBold,
    fontSize: 13,
    textAlign: 'right',
  },
});
