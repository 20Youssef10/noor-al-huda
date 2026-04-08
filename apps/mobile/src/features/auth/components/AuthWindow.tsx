import { Image, StyleSheet, Text, View } from 'react-native';

import { GhostButton, PrimaryButton, SurfaceCard, TextField } from '../../../components/ui';
import { theme } from '../../../lib/theme';

type AuthWindowProps = {
  authLoading: boolean;
  email: string;
  name: string;
  password: string;
  onChangeEmail: (value: string) => void;
  onChangeName: (value: string) => void;
  onChangePassword: (value: string) => void;
  onRegister: () => void;
  onLogin: () => void;
  onGuest: () => void;
  onResetPassword: () => void;
  onMagicLink: () => void;
  onGoogle: () => void;
  googleEnabled: boolean;
  googleLoading: boolean;
  googleInfo?: string | null;
  googleError?: string | null;
  googleReady?: boolean;
};

export function AuthWindow({
  authLoading,
  email,
  name,
  password,
  onChangeEmail,
  onChangeName,
  onChangePassword,
  onRegister,
  onLogin,
  onGuest,
  onResetPassword,
  onMagicLink,
  onGoogle,
  googleEnabled,
  googleLoading,
  googleInfo,
  googleError,
  googleReady,
}: AuthWindowProps) {
  return (
    <SurfaceCard accent="blue">
      <View style={styles.logoRow}>
        <Image source={require('../../../../assets/icon.png')} style={styles.logo} resizeMode="cover" />
        <View style={styles.logoTextWrap}>
          <Text style={styles.logoTitle}>بوابة نور الهدى</Text>
          <Text style={styles.logoSubtitle}>سجّل الدخول لمزامنة قراءتك وإعداداتك والوصول الهادئ إلى كل أدوات التطبيق.</Text>
        </View>
      </View>

      <View style={styles.providerRow}>
        <Text style={styles.providerChip}>Email</Text>
        <Text style={styles.providerChip}>{googleEnabled ? 'Google' : 'Google لاحقاً'}</Text>
        <Text style={styles.providerChip}>Guest</Text>
      </View>

      {googleEnabled ? (
        <PrimaryButton
          label={googleLoading ? 'جارٍ فتح Google...' : 'المتابعة باستخدام Google'}
          tone="emerald"
          disabled={authLoading || googleLoading || !googleReady}
          onPress={onGoogle}
        />
      ) : null}

      {googleInfo ? <Text style={styles.helperText}>{googleInfo}</Text> : null}
      {googleError ? <Text style={styles.errorText}>{googleError}</Text> : null}

      <View style={styles.formStack}>
        <TextField value={name} onChangeText={onChangeName} placeholder="الاسم (اختياري)" />
        <TextField value={email} onChangeText={onChangeEmail} placeholder="البريد الإلكتروني" />
        <TextField value={password} onChangeText={onChangePassword} placeholder="كلمة المرور" secureTextEntry />

        <View style={styles.actionRow}>
          <PrimaryButton label={authLoading ? '...' : 'إنشاء حساب'} onPress={onRegister} disabled={authLoading || !email.trim() || !password.trim()} />
          <GhostButton label="تسجيل الدخول" onPress={onLogin} disabled={authLoading || !email.trim() || !password.trim()} />
          <GhostButton label="الدخول كضيف" onPress={onGuest} disabled={authLoading} />
        </View>

        <GhostButton label="إرسال رابط إعادة تعيين كلمة المرور" onPress={onResetPassword} disabled={authLoading || !email.trim()} />
        <GhostButton label="إرسال رابط دخول بدون كلمة مرور" onPress={onMagicLink} disabled={authLoading || !email.trim()} />

        <Text style={styles.helperText}>
          يمكن أيضاً الدخول برابط بريدي بدون كلمة مرور. افتح الرابط على نفس الجهاز لإكمال الجلسة تلقائياً.
        </Text>
      </View>
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  logoRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 14,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 22,
  },
  logoTextWrap: {
    flex: 1,
    gap: 6,
  },
  logoTitle: {
    color: theme.colors.goldLight,
    fontFamily: theme.fonts.display,
    fontSize: 28,
    textAlign: 'right',
  },
  logoSubtitle: {
    color: theme.colors.creamMuted,
    fontFamily: theme.fonts.body,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'right',
  },
  providerRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  providerChip: {
    color: theme.colors.goldLight,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 12,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.2)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  formStack: {
    gap: 10,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  helperText: {
    color: theme.colors.creamFaint,
    fontFamily: theme.fonts.body,
    fontSize: 13,
    lineHeight: 21,
    textAlign: 'right',
  },
  errorText: {
    color: '#F6A6A6',
    fontFamily: theme.fonts.body,
    fontSize: 13,
    lineHeight: 21,
    textAlign: 'right',
  },
});
