'use client';

import { useState } from 'react';

const templates = [
  'dark-green',
  'golden-parchment',
  'night-sky',
  'marble-white',
  'emerald-gradient',
  'desert-sand',
  'midnight-blue',
  'rose-gold',
  'forest-green',
  'classic-black',
  'sunset-orange',
  'pure-white',
];

export function ShareCardWeb() {
  const [template, setTemplate] = useState(templates[0]);
  const [content, setContent] = useState('رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا');

  async function share() {
    if (navigator.share) {
      await navigator.share({ text: `${content}

نور الهدى` });
    }
  }

  return (
    <div className="interactive-panel">
      <div className="chip-row">
        {templates.slice(0, 6).map((item) => (
          <button key={item} className={`ghost-button ${template === item ? 'active-chip' : ''}`} onClick={() => setTemplate(item)}>{item}</button>
        ))}
      </div>
      <textarea className="text-field text-area" dir="rtl" value={content} onChange={(e) => setContent(e.target.value)} />
      <div className={`share-preview ${template}`}>
        <p className="arabic-copy">{content}</p>
        <span>نور الهدى</span>
      </div>
      <button className="primary-button" onClick={() => void share()}>مشاركة النص</button>
    </div>
  );
}
