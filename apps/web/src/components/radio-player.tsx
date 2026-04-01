'use client';

import { useState } from 'react';

import type { RadioItem } from '@/lib/types';

export function RadioPlayer({ radios }: { radios: RadioItem[] }) {
  const [active, setActive] = useState<RadioItem | null>(radios[0] ?? null);

  return (
    <div className="radio-shell">
      {active ? (
        <section className="feature-card">
          <p className="feature-eyebrow">يُبث الآن</p>
          <h3>{active.name}</h3>
          <p className="feature-description">{active.country} · {active.description}</p>
          {active.streamUrl ? <audio controls autoPlay src={active.streamUrl} className="audio-player" /> : null}
        </section>
      ) : null}
      <div className="content-grid three-up">
        {radios.map((radio) => (
          <button key={radio.id} className="radio-card" onClick={() => setActive(radio)}>
            <span className="feature-eyebrow">{radio.country}</span>
            <strong>{radio.name}</strong>
            <span>{radio.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
