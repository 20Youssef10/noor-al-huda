'use client';

import { useState } from 'react';

import { apiBaseUrl } from '@/lib/api';

type TajweedAnalysis = {
  score: number;
  accuracy: number;
  encouragement_ar: string;
  words: Array<{ expected: string; got: string; status: string }>;
};

export function TajweedWeb() {
  const [surah, setSurah] = useState('1');
  const [ayah, setAyah] = useState('1');
  const [transcript, setTranscript] = useState('');
  const [result, setResult] = useState<TajweedAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  async function analyze() {
    setLoading(true);
    try {
      const form = new FormData();
      form.append('surah', surah);
      form.append('ayah', ayah);
      form.append('transcript', transcript);
      const response = await fetch(`${apiBaseUrl}/api/tajweed/analyze`, {
        method: 'POST',
        body: form,
      });
      setResult((await response.json()) as TajweedAnalysis);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="interactive-panel">
      <div className="inline-field-row three-fields">
        <input className="text-field" value={surah} onChange={(e) => setSurah(e.target.value)} />
        <input className="text-field" value={ayah} onChange={(e) => setAyah(e.target.value)} />
      </div>
      <textarea className="text-field text-area" dir="rtl" placeholder="اكتب تلاوتك كما نطقتها أو أضف ملفاً لاحقاً" value={transcript} onChange={(e) => setTranscript(e.target.value)} />
      <button className="primary-button" onClick={() => void analyze()} disabled={loading || !transcript.trim()}>{loading ? 'جاري التحليل...' : 'تحليل الأداء'}</button>
      {result ? (
        <div className="dua-result">
          <p className="feature-eyebrow">النتيجة</p>
          <h3>{result.score}/100</h3>
          <p className="body-copy">الدقة: {result.accuracy}%</p>
          <p className="arabic-copy">{result.encouragement_ar}</p>
        </div>
      ) : null}
    </div>
  );
}
