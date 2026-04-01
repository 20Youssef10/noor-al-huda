import { SiteShell } from '@/components/site-shell';
import { TrackerDashboard } from '@/components/tracker-dashboard';

export default function TrackerPage() {
  return (
    <SiteShell>
      <section className="section-block">
        <div className="section-heading">
          <p className="eyebrow">Tracker</p>
          <h2>متابعة العبادة</h2>
        </div>
        <TrackerDashboard />
      </section>
    </SiteShell>
  );
}
