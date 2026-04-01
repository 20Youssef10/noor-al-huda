import { CompanionPanel } from '@/components/companion-panel';
import { SiteShell } from '@/components/site-shell';

export default function CompanionPage() {
  return (
    <SiteShell>
      <section className="section-block">
        <div className="section-heading">
          <p className="eyebrow">Companion</p>
          <h2>الرفيق الروحي اليومي</h2>
        </div>
        <CompanionPanel />
      </section>
    </SiteShell>
  );
}
