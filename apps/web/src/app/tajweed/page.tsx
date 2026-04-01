import { SiteShell } from '@/components/site-shell';
import { TajweedWeb } from '@/components/tajweed-web';

export default function TajweedPage() {
  return (
    <SiteShell>
      <section className="section-block">
        <div className="section-heading">
          <p className="eyebrow">Tajweed</p>
          <h2>مدرب التجويد</h2>
        </div>
        <TajweedWeb />
      </section>
    </SiteShell>
  );
}
