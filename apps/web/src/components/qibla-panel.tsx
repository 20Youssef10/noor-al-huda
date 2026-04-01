'use client';

import { useState } from 'react';

import { apiBaseUrl } from '@/lib/api';

export function QiblaPanel() {
  const [result, setResult] = useState<{ qiblaDegrees: number; locationLabel: string } | null>(null);

  async function calculate() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (position) => {
      const response = await fetch(
        `${apiBaseUrl}/api/qibla?lat=${position.coords.latitude}&lng=${position.coords.longitude}`,
        { cache: 'no-store' }
      );
      setResult((await response.json()) as { qiblaDegrees: number; locationLabel: string });
    });
  }

  return (
    <div className="interactive-panel">
      <button className="primary-button" onClick={() => void calculate()}>احسب اتجاه القبلة</button>
      {result ? (
        <div className="dua-result">
          <p className="feature-eyebrow">الاتجاه</p>
          <h3>{result.qiblaDegrees.toFixed(1)}°</h3>
          <p className="body-copy">{result.locationLabel}</p>
        </div>
      ) : null}
    </div>
  );
}
