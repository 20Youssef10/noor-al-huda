import { useQuery } from '@tanstack/react-query';
import Constants from 'expo-constants';
import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { GhostButton, Page, SectionHeader, SurfaceCard } from '../../src/components/ui';
import { useAuthUser } from '../../src/features/auth/service';
import { fetchBackendHealth } from '../../src/lib/health';
import { theme, gradients } from '../../src/lib/theme';
import { useAppStore } from '../../src/store/app-store';

const calculationMethods = {
  ummAlQura: 'أم القرى',
  egyptian: 'الهيئة المصرية',
  karachi: 'كراتشي',
} as const;

export default function SettingsScreen() {
  const settings = useAppStore((state) => state.settings);
  const bookmarks = useAppStore((state) => state.bookmarks);
  const lastReadSurahId = useAppStore((state) => state.lastReadSurahId);
  const syncMessage = useAppStore((state) => state.syncMessage);
  const syncStatus = useAppStore((state) => state.syncStatus);
  const setCalculationMethod = useAppStore((state) => state.setCalculationMethod);
  const setReciter = useAppStore((state) => state.setReciter);
  const setNotificationsEnabled = useAppStore((state) => state.setNotificationsEnabled);
  const { user } = useAuthUser();

  const healthQuery = useQuery({
    queryKey: ['backend-health'],
    queryFn: fetchBackendHealth,
    staleTime: 5 * 60_000,
  });

  return (
    <Page>
      <SectionHeader title="الإعدادات والاستعداد للنشر" subtitle="مراجعة سريعة للحساب والخادم والبناء" />

      <SurfaceCard accent="emerald">
        <SectionHeader title="الملف الشخصي" subtitle={user ? (user.isAnonymous ? 'جلسة ضيف' : user.email ?? 'حساب موثق') : 'غير مسجل'} />
        <Text style={styles.bodyText}>الموقع: {settings.location.label}</Text>
        <Text style={styles.bodyText}>طريقة الحساب: {calculationMethods[settings.calculationMethod as keyof typeof calculationMethods] ?? settings.calculationMethod}</Text>
        <Text style={styles.bodyText}>القارئ المختار: {settings.reciter}</Text>
        <Text style={styles.bodyText}>الإشعارات: {settings.notificationsEnabled ? 'مفعلة' : 'غير مفعلة'}</Text>
        <Text style={styles.bodyText}>الإشارات المرجعية: {bookmarks.length}</Text>
        <Text style={styles.bodyText}>المزامنة: {syncStatus}</Text>
        {syncMessage ? <Text style={styles.bodyText}>{syncMessage}</Text> : null}
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeader title="إعدادات الاستخدام" subtitle="تخصيص الصلاة والإشعارات وعرض التطبيق" />
        <Text style={styles.bodyText}>بدّل طريقة الحساب حسب منطقتك الجغرافية، وتحكم في الإشعارات سريعاً.</Text>
        <View style={styles.quickLinks}>
          <GhostButton label={`الحساب: ${calculationMethods.ummAlQura}`} onPress={() => setCalculationMethod('ummAlQura')} />
          <GhostButton label={`الحساب: ${calculationMethods.egyptian}`} onPress={() => setCalculationMethod('egyptian')} />
          <GhostButton label={`الحساب: ${calculationMethods.karachi}`} onPress={() => setCalculationMethod('karachi')} />
          <GhostButton
            label={settings.notificationsEnabled ? 'إيقاف الإشعارات' : 'تفعيل الإشعارات'}
            onPress={() => setNotificationsEnabled(!settings.notificationsEnabled)}
          />
          <GhostButton label="القارئ: مشاري العفاسي" onPress={() => setReciter('مشاري العفاسي')} />
          <GhostButton label="القارئ: السديس" onPress={() => setReciter('عبدالرحمن السديس')} />
        </View>
      </SurfaceCard>

      <SurfaceCard accent="blue">
        <SectionHeader title="الخادم والربط" subtitle="Cloudflare Worker + Firebase" />
        <Text style={styles.bodyText}>
          حالة الخادم: {healthQuery.data?.ok ? 'متصل' : healthQuery.isLoading ? 'جارٍ الفحص...' : 'غير متاح'}
        </Text>
        <Text style={styles.bodyText}>الخدمة: {healthQuery.data?.service ?? 'noor-al-huda-api'}</Text>
        <Text style={styles.bodyText}>Firebase: {healthQuery.data?.firebaseProjectId ?? 'noor-al-huda-260326'}</Text>
        <GhostButton label="إعادة فحص الاتصال" onPress={() => void healthQuery.refetch()} />
      </SurfaceCard>

      <SurfaceCard accent="blue">
        <SectionHeader title="حالة المحتوى" subtitle="مصادر البيانات المباشرة داخل التطبيق" />
        <Text style={styles.bodyText}>القرآن: Quran.com</Text>
        <Text style={styles.bodyText}>الأذكار: Hisn Muslim</Text>
        <Text style={styles.bodyText}>الإذاعات: MP3Quran</Text>
        <Text style={styles.bodyText}>البطاقة اليومية: Quran + HadeethEnc</Text>
        <Text style={styles.bodyText}>إذا ظهر محتوى افتراضي فهذا يعني فشل الشبكة أو فشل المصدر الخارجي مؤقتاً.</Text>
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeader title="معلومات البناء" subtitle="جاهزية التطبيق للإصدار" />
        <Text style={styles.bodyText}>الإصدار: {Constants.expoConfig?.version ?? '1.0.0'}</Text>
        <Text style={styles.bodyText}>الحزمة Android: {Constants.expoConfig?.android?.package ?? 'com.nooralhuda.app'}</Text>
        <Text style={styles.bodyText}>المعرّف iOS: {Constants.expoConfig?.ios?.bundleIdentifier ?? 'com.nooralhuda.app'}</Text>
        <Text style={styles.bodyText}>آخر سورة: {lastReadSurahId ?? 'لا يوجد'}</Text>
        {lastReadSurahId ? (
          <Link href={`/quran/${lastReadSurahId}`} asChild>
            <GhostButton label="فتح آخر سورة" onPress={() => undefined} />
          </Link>
        ) : null}
        <Link href="/features" asChild>
          <GhostButton label="فتح مركز الميزات المتقدمة" onPress={() => undefined} />
        </Link>
      </SurfaceCard>

      <SurfaceCard accent="blue">
        <SectionHeader title="روابط سريعة" subtitle="اختصارات مباشرة للميزات الموسعة" />
        <View style={styles.quickLinks}>
          <Link href="/features/search" asChild>
            <GhostButton label="البحث الدلالي" onPress={() => undefined} />
          </Link>
          <Link href="/features/dua" asChild>
            <GhostButton label="مولد الدعاء" onPress={() => undefined} />
          </Link>
          <Link href="/features/hadith" asChild>
            <GhostButton label="مكتبة الحديث" onPress={() => undefined} />
          </Link>
          <Link href="/features/companion" asChild>
            <GhostButton label="الرفيق اليومي" onPress={() => undefined} />
          </Link>
          <Link href="/features/qibla" asChild>
            <GhostButton label="القبلة" onPress={() => undefined} />
          </Link>
          <Link href="/features/halal" asChild>
            <GhostButton label="ماسح الحلال" onPress={() => undefined} />
          </Link>
          <Link href="/features/tracker" asChild>
            <GhostButton label="متابعة العبادة" onPress={() => undefined} />
          </Link>
          <Link href="/features/khatm" asChild>
            <GhostButton label="الختمة الجماعية" onPress={() => undefined} />
          </Link>
          <Link href="/features/kids" asChild>
            <GhostButton label="وضع الأطفال" onPress={() => undefined} />
          </Link>
          <Link href="/features/ruya" asChild>
            <GhostButton label="يومية الرؤى" onPress={() => undefined} />
          </Link>
          <Link href="/features/share" asChild>
            <GhostButton label="بطاقات المشاركة" onPress={() => undefined} />
          </Link>
          <Link href="/features/privacy" asChild>
            <GhostButton label="الخصوصية" onPress={() => undefined} />
          </Link>
          <Link href="/features/voice" asChild>
            <GhostButton label="الأوامر الصوتية" onPress={() => undefined} />
          </Link>
        </View>
      </SurfaceCard>
    </Page>
  );
}

const styles = StyleSheet.create({
  bodyText: {
    color: theme.colors.creamMuted,
    fontFamily: theme.fonts.body,
    fontSize: 14,
    lineHeight: 23,
    textAlign: 'right',
  },
  quickLinks: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
});
