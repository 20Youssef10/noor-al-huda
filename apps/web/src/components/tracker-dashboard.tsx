'use client';

import { useMemo, useState } from 'react';

const STORAGE_KEY = 'noor-web-worship-log';

type TrackerEntry = {
  date: string;
  activity: string;
  value: number;
};

const activities = [
  { id: 'fast_fard', label: 'صيام فرض' },
  { id: 'fast_nafl', label: 'صيام نفل' },
  { id: 'tahajjud', label: 'قيام الليل' },
  { id: 'sadaqah', label: 'صدقة' },
  { id: 'azkar_morning', label: 'أذكار الصباح' },
  { id: 'azkar_evening', label: 'أذكار المساء' },
  { id: 'quran_pages', label: 'صفحات القرآن' },
];

function readEntries(): TrackerEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]') as TrackerEntry[];
  } catch {
    return [];
  }
}

function writeEntries(entries: TrackerEntry[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function TrackerDashboard() {
  const [entries, setEntries] = useState<TrackerEntry[]>(() => readEntries());

  const summary = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const todayCount = entries.filter((entry) => entry.date === today).length;
    const quranPages = entries.filter((entry) => entry.activity === 'quran_pages').reduce((sum, item) => sum + item.value, 0);
    return { todayCount, quranPages, total: entries.length };
  }, [entries]);

  function addEntry(activity: string) {
    const next = [
      {
        date: new Date().toISOString().slice(0, 10),
        activity,
        value: activity === 'quran_pages' ? 2 : 1,
      },
      ...entries,
    ].slice(0, 60);
    setEntries(next);
    writeEntries(next);
  }

  return (
    <div className="tracker-shell">
      <section className="content-grid three-up">
        <article className="metric-card"><span>اليوم</span><strong>{summary.todayCount}</strong></article>
        <article className="metric-card"><span>إجمالي السجل</span><strong>{summary.total}</strong></article>
        <article className="metric-card"><span>صفحات القرآن</span><strong>{summary.quranPages}</strong></article>
      </section>
      <section className="feature-card">
        <p className="feature-eyebrow">قائمة اليوم</p>
        <h3>سجّل عبادتك بسرعة</h3>
        <div className="chip-row">
          {activities.map((activity) => (
            <button key={activity.id} className="ghost-button" onClick={() => addEntry(activity.id)}>{activity.label}</button>
          ))}
        </div>
      </section>
      <section className="heatmap-grid">
        {entries.slice(0, 35).map((entry, index) => (
          <div key={`${entry.date}-${entry.activity}-${index}`} className="heat-cell">
            <span>{entry.date.slice(5)}</span>
            <strong>{entry.activity}</strong>
          </div>
        ))}
      </section>
    </div>
  );
}
