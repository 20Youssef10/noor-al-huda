export type ThemeId =
  | 'default_dark'
  | 'ramadan'
  | 'eid'
  | 'hajj'
  | 'muharram'
  | 'mawlid'
  | 'fajr'
  | 'dhuhr'
  | 'asr'
  | 'maghrib'
  | 'isha';

export interface ThemeConfig {
  id: ThemeId;
  primary: string;
  gold: string;
  accent: string;
  backgroundPattern: string;
  fontScale: number;
  specialGreeting?: string;
}

export const SEASONAL_THEMES: Record<ThemeId, ThemeConfig> = {
  default_dark: { id: 'default_dark', primary: '#13100A', gold: '#C9A84C', accent: '#E8C97A', backgroundPattern: 'none', fontScale: 1 },
  ramadan: { id: 'ramadan', primary: '#1A4B2E', gold: '#D4AF37', accent: '#E8C97A', backgroundPattern: 'crescent_stars', fontScale: 1.05, specialGreeting: 'رمضان كريم 🌙' },
  eid: { id: 'eid', primary: '#2D1B4E', gold: '#FFD700', accent: '#FF6B9D', backgroundPattern: 'geometric_festive', fontScale: 1, specialGreeting: 'عيد مبارك 🎉' },
  hajj: { id: 'hajj', primary: '#46321A', gold: '#D4AF37', accent: '#F5E8C0', backgroundPattern: 'kaaba_lines', fontScale: 1, specialGreeting: 'تقبل الله من الحجاج' },
  muharram: { id: 'muharram', primary: '#1D2438', gold: '#C9A84C', accent: '#B4C5E4', backgroundPattern: 'calm_lines', fontScale: 1 },
  mawlid: { id: 'mawlid', primary: '#355C7D', gold: '#FFD166', accent: '#F8F3E8', backgroundPattern: 'lantern', fontScale: 1.02, specialGreeting: 'صلوا على النبي ﷺ' },
  fajr: { id: 'fajr', primary: '#274472', gold: '#F5D67B', accent: '#F8F3E8', backgroundPattern: 'morning', fontScale: 1 },
  dhuhr: { id: 'dhuhr', primary: '#DDB967', gold: '#6A4E1E', accent: '#FFF7DD', backgroundPattern: 'sunbeam', fontScale: 1 },
  asr: { id: 'asr', primary: '#B26A3B', gold: '#F6D6A8', accent: '#FFF5E8', backgroundPattern: 'desert', fontScale: 1 },
  maghrib: { id: 'maghrib', primary: '#7A2E3A', gold: '#F4C95D', accent: '#FFE9D6', backgroundPattern: 'sunset', fontScale: 1.03 },
  isha: { id: 'isha', primary: '#0E1B2A', gold: '#C9A84C', accent: '#D5E6FF', backgroundPattern: 'night_sky', fontScale: 1 },
};
