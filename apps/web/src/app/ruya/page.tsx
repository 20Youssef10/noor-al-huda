import { RuyaPanel } from '@/components/ruya-panel';
import { SiteShell } from '@/components/site-shell';

export default function RuyaPage() {
  return (
    <SiteShell>
      <section className="section-block">
        <div className="section-heading">
          <p className="eyebrow">Ruya</p>
          <h2>يومية الرؤى</h2>
        </div>
        <RuyaPanel />
      </section>
    </SiteShell>
  );
}
