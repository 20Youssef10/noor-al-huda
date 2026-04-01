import { HalalPanel } from '@/components/halal-panel';
import { SiteShell } from '@/components/site-shell';

export default function HalalPage() {
  return (
    <SiteShell>
      <section className="section-block">
        <div className="section-heading">
          <p className="eyebrow">Halal</p>
          <h2>ماسح المنتجات الحلال</h2>
        </div>
        <HalalPanel />
      </section>
    </SiteShell>
  );
}
