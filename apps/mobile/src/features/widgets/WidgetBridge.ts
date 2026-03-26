import { NativeModules } from 'react-native';

import { storage } from '../../lib/mmkv';
import { type PrayerTimesData } from '../../types/domain';

type WidgetBridgeModule = {
  updateWidget?: (payload: string) => Promise<void> | void;
};

const widgetBridge = NativeModules.WidgetBridge as WidgetBridgeModule | undefined;

export async function updatePrayerWidget(payload: PrayerTimesData) {
  storage.set('widget_prayer_data', JSON.stringify(payload));
  await widgetBridge?.updateWidget?.(JSON.stringify(payload));
}
