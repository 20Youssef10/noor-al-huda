import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

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

export async function schedulePrayerReminderAsync(prayerLabel: string, body: string, date: Date) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `تذكير ${prayerLabel}`,
      body,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: Math.max(1, Math.floor((date.getTime() - Date.now()) / 1000)),
      repeats: false,
    },
  });
}

export async function cancelScheduledNotificationsAsync() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
