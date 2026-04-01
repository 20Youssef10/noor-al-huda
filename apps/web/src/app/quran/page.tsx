import Link from 'next/link';

import { SiteShell } from '@/components/site-shell';
import { apiJson } from '@/lib/api';
import type { SurahSummary } from '@/lib/types';

export default async function QuranPage() {
  const surahs = await apiJson<SurahSummary[]>('/api/quran/surahs').catch(() => []);

  return (
    <SiteShell>
      <section className="section-block">
        <div className="section-heading">
          <p className="eyebrow">Quran</p>
          <h2>قارئ القرآن الكامل</h2>
        </div>
        <div className="content-grid two-up">
          {surahs.map((surah) => (
            <Link key={surah.id} href={`/quran/${surah.id}`} className="feature-card">
              <p className="feature-eyebrow">{surah.id}</p>
              <h3>{surah.name}</h3>
              <p className="feature-description">{surah.transliteration} · {surah.versesCount} آية</p>
            </Link>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
