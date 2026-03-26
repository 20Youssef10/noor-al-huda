import * as SQLite from 'expo-sqlite';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AchievementUnlockToast } from '../gamification/AchievementUnlockToast';
import { getUnlockedAchievements } from '../gamification/achievements';
import { getHijriDateString } from '../gamification/streak';
import { getCurrentUser, syncWorshipAggregate } from '../../lib/firebase';
import { storage } from '../../lib/mmkv';
import { theme } from '../../lib/theme';
import { Page, PrimaryButton, SectionHeader, SurfaceCard } from '../../components/ui';

const ACTIVITIES = [
  { key: 'fast_fard', label: 'صيام فرض' },
  { key: 'fast_nafl', label: 'صيام نفل' },
  { key: 'tahajjud', label: 'قيام الليل' },
  { key: 'sadaqah', label: 'صدقة' },
  { key: 'azkar_morning', label: 'أذكار الصباح' },
  { key: 'azkar_evening', label: 'أذكار المساء' },
] as const;

export function WorshipTrackerScreen() {
  const [entries, setEntries] = useState<Array<{ hijri_date: string; activity: string; value: number }>>([]);
  const [toast, setToast] = useState<{ title: string; icon: string } | null>(null);

  useEffect(() => {
    const run = async () => {
      const db = await SQLite.openDatabaseAsync('noor-al-huda.db');
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS worship_log (
          id TEXT PRIMARY KEY DEFAULT (hex(randomblob(8))),
          hijri_date TEXT NOT NULL,
          activity TEXT NOT NULL,
          value REAL DEFAULT 1,
          note TEXT,
          created_at INTEGER DEFAULT (unixepoch())
        );
        CREATE INDEX IF NOT EXISTS idx_worship_date ON worship_log(hijri_date);
      `);
      const rows = await db.getAllAsync<{ hijri_date: string; activity: string; value: number }>('SELECT hijri_date, activity, value FROM worship_log ORDER BY created_at DESC LIMIT 40');
      setEntries(rows);
    };
    void run();
  }, []);

  const today = getHijriDateString();
  const grouped = useMemo(() => {
    const map = new Map<string, number>();
    for (const entry of entries) {
      map.set(entry.hijri_date, (map.get(entry.hijri_date) ?? 0) + 1);
    }
    return Array.from(map.entries()).slice(0, 30);
  }, [entries]);

  const aggregate = useMemo(() => {
    return {
      total_actions: entries.length,
      tahajjud_count: entries.filter((entry) => entry.activity === 'tahajjud').length,
      fasting_count: entries.filter((entry) => entry.activity === 'fast_fard' || entry.activity === 'fast_nafl').length,
      quran_pages: entries.filter((entry) => entry.activity === 'quran_pages').reduce((total, entry) => total + entry.value, 0),
    };
  }, [entries]);

  useEffect(() => {
    const unlocked = getUnlockedAchievements({
      tracker_days: grouped.length,
      tahajjud: aggregate.tahajjud_count,
      sadaqa: entries.filter((entry) => entry.activity === 'sadaqah').length,
    });
    const seen = new Set(JSON.parse(storage.getString('unlocked_achievements') || '[]'));
    const latest = unlocked.find((item) => !seen.has(item.id));
    if (latest) {
      seen.add(latest.id);
      storage.set('unlocked_achievements', JSON.stringify([...seen]));
      setToast({ title: latest.title_ar, icon: latest.icon });
      setTimeout(() => setToast(null), 2600);
    }
  }, [aggregate.tahajjud_count, entries, grouped.length]);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.isAnonymous) return;
    const weekKey = `week-${grouped[0]?.[0] ?? today}`;
    void syncWorshipAggregate(user.uid, weekKey, aggregate);
  }, [aggregate, grouped, today]);

  async function toggleActivity(activity: string) {
    const db = await SQLite.openDatabaseAsync('noor-al-huda.db');
    await db.runAsync('INSERT INTO worship_log (hijri_date, activity, value) VALUES (?, ?, ?)', today, activity, 1);
    const rows = await db.getAllAsync<{ hijri_date: string; activity: string; value: number }>('SELECT hijri_date, activity, value FROM worship_log ORDER BY created_at DESC LIMIT 40');
    setEntries(rows);
  }

  return (
    <Page>
      <SectionHeader title="متابعة العبادة" subtitle={`اليوم الهجري: ${today}`} />
      <SurfaceCard accent="emerald">
        <Text style={styles.heading}>قائمة اليوم</Text>
        <View style={styles.grid}>
          {ACTIVITIES.map((activity) => (
            <Pressable key={activity.key} onPress={() => void toggleActivity(activity.key)} style={styles.checkCard}>
              <Text style={styles.checkText}>{activity.label}</Text>
            </Pressable>
          ))}
        </View>
      </SurfaceCard>
      <SurfaceCard>
        <Text style={styles.heading}>خريطة النشاط</Text>
        <View style={styles.heatmap}>
          {grouped.map(([date, count]) => (
            <View key={date} style={[styles.heatCell, { opacity: Math.min(1, 0.25 + count * 0.18) }]}>
              <Text style={styles.heatText}>{date.split('-').slice(1).join('/')}</Text>
            </View>
          ))}
        </View>
      </SurfaceCard>
      <AchievementUnlockToast visible={Boolean(toast)} title={toast?.title ?? ''} icon={toast?.icon ?? '⭐'} />
    </Page>
  );
}

const styles = StyleSheet.create({
  heading: { color: theme.colors.goldLight, fontFamily: theme.fonts.bodyBold, fontSize: 16, textAlign: 'right' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  checkCard: { paddingHorizontal: 14, paddingVertical: 12, borderRadius: 16, backgroundColor: theme.colors.surfaceStrong },
  checkText: { color: theme.colors.cream, fontFamily: theme.fonts.bodyBold, fontSize: 13 },
  heatmap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  heatCell: { width: 72, height: 48, borderRadius: 12, backgroundColor: theme.colors.emerald, alignItems: 'center', justifyContent: 'center' },
  heatText: { color: theme.colors.cream, fontFamily: theme.fonts.body, fontSize: 11 },
});
