import { storage } from '../../lib/mmkv';

export interface StreakData {
  current_streak: number;
  longest_streak: number;
  last_activity_date: string;
  total_days: number;
}

export const defaultStreak: StreakData = {
  current_streak: 0,
  longest_streak: 0,
  last_activity_date: '',
  total_days: 0,
};

export function getHijriDateString(offsetDays = 0, referenceDate = new Date()): string {
  const date = new Date(referenceDate);
  date.setDate(date.getDate() + offsetDays);
  const formatter = new Intl.DateTimeFormat('en-TN-u-ca-islamic', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = formatter.formatToParts(date);
  const lookup = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${lookup.year}-${lookup.month}-${lookup.day}`;
}

export async function recordActivity(type: 'adhkar' | 'quran' | 'hadith') {
  const today = getHijriDateString();
  const stored = storage.getString('streak_data');
  const data: StreakData = stored ? JSON.parse(stored) as StreakData : defaultStreak;

  if (data.last_activity_date === today) {
    return data;
  }

  const yesterday = getHijriDateString(-1);
  const isConsecutive = data.last_activity_date === yesterday;
  const current = isConsecutive ? data.current_streak + 1 : 1;

  const updated: StreakData = {
    current_streak: current,
    longest_streak: Math.max(data.longest_streak, current),
    last_activity_date: today,
    total_days: data.total_days + 1,
  };

  storage.set('streak_data', JSON.stringify(updated));
  storage.set(`last_activity_type:${type}`, today);
  return updated;
}
