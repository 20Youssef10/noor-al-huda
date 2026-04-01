'use client';

import { useState } from 'react';

import { apiBaseUrl } from '@/lib/api';

type VoicePayload = {
  transcript: string;
  intent: string;
  params: Record<string, string | number | boolean>;
  confidence?: number;
};

export function VoicePanel() {
  const [command, setCommand] = useState('');
  const [result, setResult] = useState<VoicePayload | null>(null);

  async function submit() {
    const form = new FormData();
    form.append('text', command);
    const response = await fetch(`${apiBaseUrl}/api/voice/command`, {
      method: 'POST',
      body: form,
    });
    setResult((await response.json()) as VoicePayload);
  }

  return (
    <div className="interactive-panel">
      <input className="text-field" dir="rtl" placeholder="مثال: افتح سورة الملك" value={command} onChange={(e) => setCommand(e.target.value)} />
      <button className="primary-button" onClick={() => void submit()} disabled={!command.trim()}>حلّل الأمر الصوتي</button>
      {result ? (
        <div className="dua-result">
          <p className="body-copy">النص: {result.transcript}</p>
          <p className="body-copy">النية: {result.intent}</p>
          <p className="body-copy">الثقة: {result.confidence ?? 0}</p>
        </div>
      ) : null}
    </div>
  );
}
