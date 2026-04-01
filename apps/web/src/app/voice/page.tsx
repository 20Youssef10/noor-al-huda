import { SiteShell } from '@/components/site-shell';
import { VoicePanel } from '@/components/voice-panel';

export default function VoicePage() {
  return (
    <SiteShell>
      <section className="section-block">
        <div className="section-heading">
          <p className="eyebrow">Voice</p>
          <h2>الأوامر الصوتية</h2>
        </div>
        <VoicePanel />
      </section>
    </SiteShell>
  );
}
