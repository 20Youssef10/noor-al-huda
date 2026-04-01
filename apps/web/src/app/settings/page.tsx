import { SettingsPanel } from '@/components/settings-panel';
import { SiteShell } from '@/components/site-shell';

export default function SettingsPage() {
  return (
    <SiteShell>
      <section className="section-block">
        <div className="section-heading">
          <p className="eyebrow">Settings</p>
          <h2>إعدادات الويب</h2>
        </div>
        <SettingsPanel />
      </section>
    </SiteShell>
  );
}
