import { RadioPlayer } from '@/components/radio-player';
import { SiteShell } from '@/components/site-shell';
import { apiJson } from '@/lib/api';
import type { RadioItem } from '@/lib/types';

export default async function RadiosPage() {
  const radios = await apiJson<RadioItem[]>('/api/radios').catch(() => []);

  return (
    <SiteShell>
      <section className="section-block">
        <div className="section-heading">
          <p className="eyebrow">Radios</p>
          <h2>إذاعات القرآن والبث المباشر</h2>
        </div>
        <RadioPlayer radios={radios} />
      </section>
    </SiteShell>
  );
}
