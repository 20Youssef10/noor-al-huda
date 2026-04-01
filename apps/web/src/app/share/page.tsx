import { ShareCardWeb } from '@/components/share-card-web';
import { SiteShell } from '@/components/site-shell';

export default function SharePage() {
  return (
    <SiteShell>
      <section className="section-block">
        <div className="section-heading">
          <p className="eyebrow">Share</p>
          <h2>بطاقات المشاركة</h2>
        </div>
        <ShareCardWeb />
      </section>
    </SiteShell>
  );
}
