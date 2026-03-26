import { type PrayerName } from '../types/domain';

export const prayerLabels: Record<PrayerName, string> = {
  fajr: 'الفجر',
  sunrise: 'الشروق',
  dhuhr: 'الظهر',
  asr: 'العصر',
  maghrib: 'المغرب',
  isha: 'العشاء',
};

export function arabicNumber(value: number): string {
  return new Intl.NumberFormat('ar-EG').format(value);
}

export function formatClock(input: Date): string {
  return new Intl.DateTimeFormat('ar-EG', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(input);
}

export function formatFullDate(input: Date): string {
  return new Intl.DateTimeFormat('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(input);
}

export function formatMinutes(minutes: number): string {
  if (minutes <= 0) {
    return 'الآن';
  }

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  if (hours === 0) {
    return `${arabicNumber(rest)} دقيقة`;
  }

  return `${arabicNumber(hours)}س ${arabicNumber(rest)}د`;
}

export function toTitleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
