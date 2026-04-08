import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

import { type AppLocation, type PrayerName } from '../types/domain';
import { computePrayerDateMap } from '../features/prayer/service';

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
  options?: { includeAzanLabel?: boolean }
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
        sound: true,
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
