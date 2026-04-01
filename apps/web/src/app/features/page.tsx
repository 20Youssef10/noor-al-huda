import { FeatureCard } from '@/components/feature-card';
import { SiteShell } from '@/components/site-shell';

const features = [
  { href: '/quran', title: 'قارئ القرآن الكامل', desc: 'قائمة السور، قارئ آيات، ومفضلة محلية.' },
  { href: '/radios', title: 'الإذاعات', desc: 'محطات مباشرة مع مشغل ويب.' },
  { href: '/tracker', title: 'متابعة العبادة', desc: 'سجل عبادة وملخصات يومية.' },
  { href: '/settings', title: 'الإعدادات', desc: 'الخصوصية، التصدير، وفحص حالة الخادم.' },
  { href: '/tajweed', title: 'مدرب التجويد', desc: 'تحليل الأداء وإظهار الدرجة.' },
  { href: '/dua', title: 'مولد الدعاء', desc: 'دعاء مخصص بمصادر موثوقة.' },
  { href: '/qibla', title: 'القبلة', desc: 'حساب اتجاه القبلة على الويب.' },
  { href: '/halal', title: 'الماسح الحلال', desc: 'تحليل المنتجات بالباركود.' },
  { href: '/ruya', title: 'يومية الرؤى', desc: 'سجل خاص مع تأمل إسلامي.' },
  { href: '/voice', title: 'الأوامر الصوتية', desc: 'تحليل أوامر عربية كنص أو صوت.' },
  { href: '/share', title: 'بطاقات المشاركة', desc: 'قوالب مشاركة جاهزة.' },
  { href: '/kids', title: 'وضع الأطفال', desc: 'تعلم الحروف والقصص القصيرة.' },
];

export default function FeaturesPage() {
  return (
    <SiteShell>
      <section className="section-block">
        <div className="section-heading">
          <p className="eyebrow">Feature Hub</p>
          <h2>كل ميزات نور الهدى على الويب</h2>
        </div>
        <div className="content-grid three-up">
          {features.map((item) => (
            <a href={item.href} key={item.href}>
              <FeatureCard eyebrow="ويب" title={item.title} description={item.desc} />
            </a>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
