import { QiblaPanel } from '@/components/qibla-panel';
import { SiteShell } from '@/components/site-shell';

export default function QiblaPage() {
  return (
    <SiteShell>
      <section className="section-block">
        <div className="section-heading">
          <p className="eyebrow">Qibla</p>
          <h2>اتجاه القبلة</h2>
        </div>
        <QiblaPanel />
      </section>
    </SiteShell>
  );
}
