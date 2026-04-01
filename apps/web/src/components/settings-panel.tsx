'use client';

import { useEffect, useState } from 'react';

import { apiBaseUrl } from '@/lib/api';

type PrivacyMode = 'full' | 'partial' | 'private';

const KEY = 'noor-web-privacy-mode';

export function SettingsPanel() {
  const [mode, setMode] = useState<PrivacyMode>('full');
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    const saved = window.localStorage.getItem(KEY) as PrivacyMode | null;
    if (saved) setMode(saved);

    void fetch(`${apiBaseUrl}/api/health`, { cache: 'no-store' })
      .then((response) => setStatus(response.ok ? 'connected' : 'error'))
      .catch(() => setStatus('error'));
  }, []);

  function update(next: PrivacyMode) {
    setMode(next);
    window.localStorage.setItem(KEY, next);
  }

  function exportData() {
    const payload = {
      privacyMode: mode,
      tracker: JSON.parse(window.localStorage.getItem('noor-web-worship-log') ?? '[]'),
      bookmarks: JSON.parse(window.localStorage.getItem('noor-web-bookmarks') ?? '[]'),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'noor-al-huda-web-data.json';
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function wipeData() {
    window.localStorage.removeItem('noor-web-worship-log');
    window.localStorage.removeItem('noor-web-bookmarks');
    window.localStorage.removeItem(KEY);
    setMode('full');
  }

  return (
    <div className="settings-shell">
      <section className="feature-card">
        <p className="feature-eyebrow">الخصوصية</p>
        <h3>اختر أسلوب استخدامك</h3>
        <div className="chip-row">
          {(['full', 'partial', 'private'] as const).map((item) => (
            <button key={item} className={`ghost-button ${mode === item ? 'active-chip' : ''}`} onClick={() => update(item)}>
              {item === 'full' ? 'كامل' : item === 'partial' ? 'متوازن' : 'خاص'}
            </button>
          ))}
        </div>
      </section>
      <section className="feature-card">
        <p className="feature-eyebrow">الخلفية</p>
        <h3>حالة الاتصال</h3>
        <p className="body-copy">{status === 'connected' ? 'الخادم متصل ويعمل.' : status === 'error' ? 'تعذر الوصول إلى الخادم حالياً.' : 'جارٍ التحقق...'}</p>
      </section>
      <section className="feature-card">
        <p className="feature-eyebrow">البيانات المحلية</p>
        <h3>تصدير أو حذف</h3>
        <div className="inline-field-row">
          <button className="primary-button" onClick={exportData}>تصدير JSON</button>
          <button className="ghost-button" onClick={wipeData}>حذف كل البيانات المحلية</button>
        </div>
      </section>
    </div>
  );
}
