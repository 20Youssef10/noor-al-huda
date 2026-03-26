import { Link } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Page, SectionHeader, SurfaceCard } from '../../src/components/ui';
import { theme } from '../../src/lib/theme';

const cards = [
  { href: '/features/tajweed', title: 'مدرب التجويد', subtitle: 'تحليل تلاوة بالذكاء الاصطناعي' },
  { href: '/features/search', title: 'البحث الدلالي', subtitle: 'اكتشف الآيات بالمعنى' },
  { href: '/features/dua', title: 'مولد الدعاء', subtitle: 'دعاء شخصي مع مصادر' },
  { href: '/features/qibla', title: 'قبلة معززة', subtitle: 'بوصلة AR واتجاه مباشر' },
  { href: '/features/halal', title: 'ماسح الحلال', subtitle: 'تحقق من مكونات المنتجات' },
  { href: '/features/tracker', title: 'متابعة العبادة', subtitle: 'تتبع الصيام والورد والصدقة' },
  { href: '/features/ruya', title: 'يومية الرؤى', subtitle: 'سجل خاص وتأمل إسلامي' },
  { href: '/features/khatm', title: 'الختمة الجماعية', subtitle: 'تعاون حيّ لإتمام القرآن' },
  { href: '/features/kids', title: 'وضع الأطفال', subtitle: 'تعلم آمن وممتع للصغار' },
  { href: '/features/share', title: 'بطاقات المشاركة', subtitle: 'تصميمات جاهزة للنشر' },
  { href: '/features/privacy', title: 'الخصوصية', subtitle: 'تحكم كامل في نمط بياناتك' },
  { href: '/features/voice', title: 'الأوامر الصوتية', subtitle: 'تنقل وتحكم بالعربية' },
];

export default function FeaturesHubScreen() {
  return (
    <Page>
      <SectionHeader title="مركز الميزات" subtitle="الخصائص المتقدمة في نور الهدى" />
      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        {cards.map((card) => (
          <Link href={card.href as never} key={card.href} asChild>
            <SurfaceCard accent="blue">
              <Text style={styles.title}>{card.title}</Text>
              <Text style={styles.subtitle}>{card.subtitle}</Text>
            </SurfaceCard>
          </Link>
        ))}
      </ScrollView>
    </Page>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: 12,
  },
  title: {
    color: theme.colors.goldLight,
    fontFamily: theme.fonts.display,
    fontSize: 24,
    textAlign: 'right',
  },
  subtitle: {
    color: theme.colors.creamMuted,
    fontFamily: theme.fonts.body,
    fontSize: 13,
    lineHeight: 21,
    textAlign: 'right',
  },
});
