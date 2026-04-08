import { useEffect, useMemo, useState } from 'react';
import { GoogleSignin, isErrorWithCode, statusCodes } from '@react-native-google-signin/google-signin';
import { type User } from 'firebase/auth';

import { mapFirebaseAuthError, mapGoogleAuthError } from './error-messages';
import {
  canHandleEmailLink,
  completePasswordlessSignIn,
  continueAsGuest,
  getCurrentUser,
  googleAuthConfig,
  hasGoogleAuthConfig,
  loginWithEmail,
  loginWithGoogleIdToken,
  logoutUser,
  reloadCurrentUser,
  registerWithEmail,
  sendPasswordResetLink,
  sendPasswordlessSignInLink,
  sendVerificationEmailToCurrentUser,
  subscribeToAuth,
} from '../../lib/firebase';

export function useAuthUser() {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const unsubscribe = subscribeToAuth((nextUser) => {
      setUser(nextUser);
      setInitializing(false);
    });

    return unsubscribe;
  }, []);

  return {
    initializing,
    revision,
    user,
    refresh: async () => {
      await reloadCurrentUser();
      setUser(getCurrentUser());
      setRevision((value) => value + 1);
    },
  };
}

export function useGoogleSignIn() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [stage, setStage] = useState<'idle' | 'opening' | 'verifying' | 'done'>('idle');

  const enabled = hasGoogleAuthConfig;
  const config = useMemo(
    () => ({
      webClientId: googleAuthConfig.webClientId,
      iosClientId: googleAuthConfig.iosClientId,
      offlineAccess: false,
      profileImageSize: 120,
      scopes: ['profile', 'email'],
      ...(googleAuthConfig.androidClientId ? { androidClientId: googleAuthConfig.androidClientId } : {}),
    } as Parameters<typeof GoogleSignin.configure>[0] & { androidClientId?: string }),
    []
  );

  useEffect(() => {
    if (!enabled) {
      setInfo('إعداد Google Sign-In غير مكتمل حالياً لهذا المشروع.');
      return;
    }

    GoogleSignin.configure(config);
    setInfo('Google Sign-In جاهز على هذا الجهاز.');
  }, [config, enabled]);

  return {
    enabled,
    loading,
    error,
    info,
    stage,
    ready: enabled,
    canStart: enabled && !loading,
    signIn: async () => {
      if (!enabled) {
        throw new Error('Google Sign-In غير مهيأ بعد لهذا التطبيق.');
      }

      setError(null);
      setInfo('جارٍ فتح تسجيل الدخول عبر Google...');
      setStage('opening');
      setLoading(true);

      try {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        const response = await GoogleSignin.signIn() as unknown;
        const googleUser = extractGoogleUser(response);

        if (isCancelledGoogleResponse(response)) {
          setInfo('تم إلغاء تسجيل الدخول قبل الاكتمال.');
          setStage('idle');
          return;
        }

        if (!googleUser) {
          throw new Error('تعذر إكمال تسجيل الدخول عبر Google.');
        }

        const idToken = googleUser.idToken;
        if (!idToken) {
          throw new Error('لم يتم استلام Google ID token من خدمة Google.');
        }

        setStage('verifying');
        setInfo('جارٍ ربط حساب Google مع Firebase...');
        await loginWithGoogleIdToken(idToken);
        setInfo('تم ربط حساب Google بنجاح.');
        setStage('done');
      } catch (nextError) {
        if (isErrorWithCode(nextError)) {
          switch (nextError.code) {
            case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
              setError('خدمات Google Play غير متوفرة أو تحتاج إلى تحديث.');
              break;
            case statusCodes.IN_PROGRESS:
              setError('توجد محاولة تسجيل دخول جارية بالفعل.');
              break;
            case statusCodes.SIGN_IN_CANCELLED:
              setInfo('تم إلغاء تسجيل الدخول قبل الاكتمال.');
              break;
            default:
              setError(mapGoogleAuthError(nextError.message));
              break;
          }
        } else {
          setError(mapGoogleAuthError(nextError instanceof Error ? nextError.message : undefined));
        }
        setStage('idle');
      } finally {
        setLoading(false);
      }
    },
  };
}

async function logoutEverywhere() {
  try {
    if (GoogleSignin.hasPreviousSignIn()) {
      await GoogleSignin.signOut();
    }
  } catch {
    // Ignore native Google logout failures and continue Firebase sign-out.
  }

  await logoutUser();
}

export const authActions = {
  canHandleEmailLink,
  completePasswordlessSignIn,
  continueAsGuest,
  loginWithEmail,
  loginWithGoogleIdToken,
  logoutUser: logoutEverywhere,
  registerWithEmail,
  sendPasswordResetLink,
  sendPasswordlessSignInLink,
  sendVerificationEmailToCurrentUser,
};

export { mapFirebaseAuthError, mapGoogleAuthError };

function isCancelledGoogleResponse(response: unknown) {
  return Boolean(
    response &&
      typeof response === 'object' &&
      'type' in response &&
      (response as { type?: unknown }).type === 'cancelled'
  );
}

function extractGoogleUser(response: unknown): { idToken: string | null } | null {
  if (!response || typeof response !== 'object') {
    return null;
  }

  if ('type' in response) {
    const typed = response as { type?: unknown; data?: unknown };
    if (typed.type === 'success' && typed.data && typeof typed.data === 'object' && 'idToken' in typed.data) {
      return typed.data as { idToken: string | null };
    }
    return null;
  }

  if ('idToken' in response) {
    return response as { idToken: string | null };
  }

  return null;
}
