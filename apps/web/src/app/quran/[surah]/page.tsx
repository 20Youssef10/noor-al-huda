import { notFound } from 'next/navigation';

import { QuranReader } from '@/components/quran-reader';
import { SiteShell } from '@/components/site-shell';
import { apiJson } from '@/lib/api';
import type { SurahDetail } from '@/lib/types';

export default async function SurahPage({ params }: { params: { surah: string } }) {
  const detail = await apiJson<SurahDetail>(`/api/quran/surah/${params.surah}`).catch(() => null);
  if (!detail) notFound();

  return (
    <SiteShell>
      <section className="section-block">
        <QuranReader detail={detail} />
      </section>
    </SiteShell>
  );
}
