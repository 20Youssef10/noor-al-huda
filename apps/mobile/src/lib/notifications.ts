import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

import { type AppLocation, type PrayerName } from '../types/domain';
import { computePrayerDateMap } from '../features/prayer/service';
import { getCachedContent, putCachedContent } from './sqlite';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const notificationCategories = [
  {
    identifier: 'prayer-reminders',
    actions: [
      { identifier: 'open-prayer', buttonTitle: 'فتح الصلاة' },
      { identifier: 'dismiss', buttonTitle: 'لاحقاً', options: { isDestructive: false } },
    ],
  },
  {
    identifier: 'azkar-reminders',
    actions: [
      { identifier: 'open-azkar', buttonTitle: 'فتح الأذكار' },
      { identifier: 'dismiss', buttonTitle: 'إخفاء' },
    ],
  },
];

const prayerLabels: Record<PrayerName, string> = {
  fajr: 'الفجر',
  sunrise: 'الشروق',
  dhuhr: 'الظهر',
  asr: 'العصر',
  maghrib: 'المغرب',
  isha: 'العشاء',
};

export async function configureNotificationCategoriesAsync() {
  await Notifications.setNotificationCategoryAsync('prayer-reminders', notificationCategories[0]!.actions);
  await Notifications.setNotificationCategoryAsync('azkar-reminders', notificationCategories[1]!.actions);
}

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!Device.isDevice) {
    return null;
  }

  const current = await Notifications.getPermissionsAsync();
  let status = current.status;

  if (status !== 'granted') {
    const next = await Notifications.requestPermissionsAsync();
    status = next.status;
  }

  if (status !== 'granted') {
    return null;
  }

  const projectId = (Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined)?.eas?.projectId;
  const token = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
  return token.data;
}

export async function ensureLocalNotificationsPermissionAsync() {
  const current = await Notifications.getPermissionsAsync();
  let status = current.status;

  if (status !== 'granted') {
    const next = await Notifications.requestPermissionsAsync();
    status = next.status;
  }

  return status === 'granted';
}

export async function schedulePrayerReminderAsync(prayerLabel: string, body: string, date: Date) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `تذكير ${prayerLabel}`,
      body,
      sound: true,
      categoryIdentifier: 'prayer-reminders',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: Math.max(1, Math.floor((date.getTime() - Date.now()) / 1000)),
      repeats: false,
    },
  });
}

export async function scheduleDailyPrayerNotifications(
  location: AppLocation,
  calculationMethod: string,
  options?: { includeAzanLabel?: boolean; adhanSound?: 'default' | 'adhan' }
) {
  const map = computePrayerDateMap(new Date(), location, calculationMethod);
  const entries = Object.entries(map) as Array<[PrayerName, Date]>;

  await configureNotificationCategoriesAsync();

  for (const [name, date] of entries) {
    if (date.getTime() <= Date.now()) {
      continue;
    }
    await Notifications.scheduleNotificationAsync({
      content: {
        title: options?.includeAzanLabel ? `أذان ${prayerLabels[name]}` : `حان وقت ${prayerLabels[name]}`,
        body: `حان الآن وقت ${prayerLabels[name]} في ${location.label}.`,
        sound: options?.adhanSound === 'adhan' ? 'adhan.wav' : true,
        categoryIdentifier: 'prayer-reminders',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date,
      },
    });
  }
}

export async function cancelScheduledNotificationsAsync() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function cacheNotificationPayload(bucket: string, key: string, payload: unknown) {
  await putCachedContent(`notifications:${bucket}`, key, payload);
}

export async function getCachedNotificationPayload<T>(bucket: string, key: string) {
  return getCachedContent<T>(`notifications:${bucket}`, key);
}

export async function scheduleHourlyDhikrNotifications(
  entries: Array<{ id: string; text: string }>,
  everyMinutes: number,
  count = 10
) {
  if (!entries.length) return;
  await configureNotificationCategoriesAsync();
  await cacheNotificationPayload('hourly-dhikr', 'latest', entries);

  for (let index = 0; index < count; index += 1) {
    const entry = entries[index % entries.length]!;
    const seconds = Math.max(60, everyMinutes * 60 * (index + 1));
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'ورد الساعة',
        body: entry.text,
        sound: true,
        categoryIdentifier: 'azkar-reminders',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds,
        repeats: false,
      },
    });
  }
}

export async function scheduleMorningEveningAzkarNotifications(options?: { morningHour?: number; eveningHour?: number }) {
  const morning = new Date();
  morning.setHours(options?.morningHour ?? 7, 0, 0, 0);
  const evening = new Date();
  evening.setHours(options?.eveningHour ?? 18, 0, 0, 0);
  const now = Date.now();
  const tasks = [
    { when: morning, title: 'أذكار الصباح', body: 'ابدأ يومك بورد الصباح.' },
    { when: evening, title: 'أذكار المساء', body: 'اختم يومك بورد المساء.' },
  ].filter((item) => item.when.getTime() > now);

  for (const item of tasks) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: item.title,
        body: item.body,
        sound: true,
        categoryIdentifier: 'azkar-reminders',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: item.when,
      },
    });
  }
}
