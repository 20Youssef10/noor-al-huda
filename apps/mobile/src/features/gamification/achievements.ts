export const ACHIEVEMENTS = [
  { id: 'first_day', title_ar: 'الخطوة الأولى', threshold: 1, type: 'streak', icon: '🌱' },
  { id: 'week_warrior', title_ar: 'المداوم أسبوع', threshold: 7, type: 'streak', icon: '🌟' },
  { id: 'month_strong', title_ar: 'صاحب الشهر', threshold: 30, type: 'streak', icon: '🏆' },
  { id: 'khatm_first', title_ar: 'ختمة مباركة', threshold: 1, type: 'khatm', icon: '📖' },
  { id: 'fajr_keeper', title_ar: 'صاحب الفجر', threshold: 7, type: 'fajr', icon: '🌅' },
  { id: 'azkar_100', title_ar: 'المسبحة الذهبية', threshold: 100, type: 'total_azkar', icon: '📿' },
  { id: 'ayah_listener', title_ar: 'محب التلاوة', threshold: 20, type: 'audio_sessions', icon: '🎧' },
  { id: 'hadith_reader', title_ar: 'رفيق الحديث', threshold: 25, type: 'hadith_reads', icon: '📚' },
  { id: 'charity_heart', title_ar: 'قلب معطاء', threshold: 10, type: 'sadaqa', icon: '🤲' },
  { id: 'night_prayer', title_ar: 'أنيس الليل', threshold: 10, type: 'tahajjud', icon: '🌙' },
  { id: 'sem_search', title_ar: 'باحث المعاني', threshold: 15, type: 'semantic_search', icon: '🔎' },
  { id: 'tajweed_student', title_ar: 'طالب التجويد', threshold: 12, type: 'tajweed_sessions', icon: '🎙️' },
  { id: 'dua_writer', title_ar: 'كاتب الدعاء', threshold: 8, type: 'dua_saved', icon: '🕊️' },
  { id: 'kids_mentor', title_ar: 'معلّم الصغار', threshold: 12, type: 'kids_sessions', icon: '⭐' },
  { id: 'tracker_master', title_ar: 'مراقب العبادة', threshold: 40, type: 'tracker_days', icon: '📅' },
] as const;

export type AchievementId = (typeof ACHIEVEMENTS)[number]['id'];
export type AchievementType = (typeof ACHIEVEMENTS)[number]['type'];

export function getUnlockedAchievements(progress: Partial<Record<AchievementType, number>>) {
  return ACHIEVEMENTS.filter((achievement) => (progress[achievement.type] ?? 0) >= achievement.threshold);
}
