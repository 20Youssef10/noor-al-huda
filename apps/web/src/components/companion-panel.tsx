'use client';

import { useState } from 'react';

import { apiBaseUrl } from '@/lib/api';

type Reflection = {
  reflection: string;
  focus: string;
  focus_type: string;
};

export function CompanionPanel() {
  const [payload, setPayload] = useState<Reflection | null>(null);
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    try {
      const response = await fetch(`${apiBaseUrl}/api/companion/daily`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: {
            last_surah: 'البقرة',
            adhkar_completed: ['morning'],
            hadith_topics: ['الصبر'],
            streak_days: 4,
          },
        }),
      });
      setPayload((await response.json()) as Reflection);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="interactive-panel">
      <button className="primary-button" onClick={() => void generate()} disabled={loading}>{loading ? 'جاري الإنشاء...' : 'توليد تأمل اليوم'}</button>
      {payload ? (
        <div className="dua-result">
          <p className="arabic-copy">{payload.reflection}</p>
          <p className="body-copy">تركيز اليوم: {payload.focus}</p>
        </div>
      ) : null}
    </div>
  );
}
