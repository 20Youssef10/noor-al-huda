import { DuaGenerator } from '@/components/dua-generator';
import { SiteShell } from '@/components/site-shell';

export default function DuaPage() {
  return (
    <SiteShell>
      <section className="section-block">
        <div className="section-heading">
          <p className="eyebrow">Dua</p>
          <h2>مولد الدعاء</h2>
        </div>
        <DuaGenerator />
      </section>
    </SiteShell>
  );
}
