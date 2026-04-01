import { SiteShell } from '@/components/site-shell';

export default function KhatmPage() {
  return (
    <SiteShell>
      <section className="section-block">
        <div className="section-heading">
          <p className="eyebrow">Khatm</p>
          <h2>الختمة الجماعية</h2>
        </div>
        <div className="content-grid two-up">
          <article className="feature-card">
            <p className="feature-eyebrow">إنشاء</p>
            <h3>أنشئ حلقة ختمة</h3>
            <p className="feature-description">استخدم الواجهة الخلفية الحالية وفعّلها مع تسجيل الدخول عند الحاجة.</p>
          </article>
          <article className="feature-card">
            <p className="feature-eyebrow">انضمام</p>
            <h3>انضم عبر رمز</h3>
            <p className="feature-description">واجهة ويب متوافقة مع رمز الدعوة لتوسعة الختمات من الهاتف إلى المتصفح.</p>
          </article>
        </div>
      </section>
    </SiteShell>
  );
}
