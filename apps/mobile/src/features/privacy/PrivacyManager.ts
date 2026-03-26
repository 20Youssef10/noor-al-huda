import { storage } from '../../lib/mmkv';

export type PrivacyMode = 'full' | 'partial' | 'private';

const KEY = 'privacy_mode';
const ISLAMIC_HOSTS = [
  'api.aladhan.com',
  'api.quran.com',
  'www.mp3quran.net',
  'www.hisnmuslim.com',
  'dorar.net',
  'world.openfoodfacts.org',
  'noor-al-huda-api.shinzero.workers.dev',
];

export function getPrivacyMode(): PrivacyMode {
  return (storage.getString(KEY) as PrivacyMode | undefined) ?? 'full';
}

export function setPrivacyMode(mode: PrivacyMode) {
  storage.set(KEY, mode);
}

export function canSync() {
  return getPrivacyMode() !== 'private';
}

export function canAnalytics() {
  return getPrivacyMode() === 'full';
}

export function requiresAccount() {
  return false;
}

export function canRequestUrl(url: string) {
  if (getPrivacyMode() !== 'private') {
    return true;
  }

  try {
    const parsed = new URL(url);
    return ISLAMIC_HOSTS.some((host) => parsed.host.includes(host));
  } catch {
    return false;
  }
}
