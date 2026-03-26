import type { ActionCodeSettings } from 'firebase/auth';

export function buildEmailLinkActionSettings(
  authHost: string,
  androidPackage = 'com.nooralhuda.app',
  iosBundle = 'com.nooralhuda.app'
): ActionCodeSettings {
  return {
    url: `https://${authHost}/auth/email-link`,
    handleCodeInApp: true,
    android: {
      packageName: androidPackage,
      installApp: true,
    },
    iOS: {
      bundleId: iosBundle,
    },
  };
}
