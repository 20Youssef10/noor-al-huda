'use client';

import { useEffect, useState } from 'react';

import { apiBaseUrl } from '@/lib/api';

type Entry = { dream: string; reflection: string; createdAt: string };
const KEY = 'noor-web-ruya';

export function RuyaPanel() {
  const [dream, setDream] = useState('');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      setEntries(JSON.parse(window.localStorage.getItem(KEY) ?? '[]'));
    } catch {
      setEntries([]);
    }
  }, []);

  async function save() {
    setLoading(true);
    try {
      const response = await fetch(`${apiBaseUrl}/api/ruya/reflect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dream }),
      });
      const payload = (await response.json()) as { reflection: string };
      const next = [{ dream, reflection: payload.reflection, createdAt: new Date().toISOString() }, ...entries].slice(0, 20);
      setEntries(next);
      window.localStorage.setItem(KEY, JSON.stringify(next));
      setDream('');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="interactive-panel">
      <textarea className="text-field text-area" dir="rtl" placeholder="دوّن رؤياك هنا" value={dream} onChange={(e) => setDream(e.target.value)} />
      <button className="primary-button" onClick={() => void save()} disabled={loading || !dream.trim()}>{loading ? 'جاري المعالجة...' : 'حفظ وتأمل'}</button>
      <div className="result-list">
        {entries.map((entry) => (
          <article key={entry.createdAt} className="result-item">
            <p className="arabic-copy">{entry.dream}</p>
            <p className="body-copy">{entry.reflection}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
