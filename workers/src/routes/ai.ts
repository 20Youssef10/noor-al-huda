import { Hono } from 'hono';
import { z } from 'zod';

import { fallbackDailyContent } from '../data/fallback';
import { readCache, writeCache } from '../services/cache';
import { computeHalalVerdict } from '../services/halal';
import { queueBackgroundTask } from '../services/runtime';
import { computeTajweedScore } from '../services/tajweed';
import { getSurahList } from '../services/quran';
import { type Env } from '../types';

const duaInputSchema = z.object({
  situation: z.string().min(3),
  language: z.enum(['ar', 'en']).default('ar'),
});

const companionSchema = z.object({
  history: z.object({
    last_surah: z.string(),
    adhkar_completed: z.array(z.string()),
    hadith_topics: z.array(z.string()),
    streak_days: z.number().min(0),
  }),
});

type FileLike = { arrayBuffer(): Promise<ArrayBuffer> };

function isFileLike(value: unknown): value is FileLike {
  if (typeof value !== 'object' || value === null || !('arrayBuffer' in value)) {
    return false;
  }

  return typeof Reflect.get(value, 'arrayBuffer') === 'function';
}

const searchSchema = z.object({
  q: z.string().min(1),
  limit: z.coerce.number().min(1).max(20).default(10),
});

const duaResultSchema = z.object({
  dua: z.string(),
  sources: z.array(z.string()),
});

const companionResultSchema = z.object({
  reflection: z.string(),
  focus: z.string(),
  focus_type: z.string(),
});

export const aiRoutes = new Hono<{ Bindings: Env }>();

aiRoutes.post('/dua/generate', async (c) => {
  const { situation } = duaInputSchema.parse(await c.req.json());
  const fallback = {
    dua: `اللهم يا واسع الرحمة، أصلح أمري في ${situation}، واهد قلبي لما تحب وترضى، واجعل لي من أمري فرجاً ومخرجاً [سورة البقرة: 286].`,
    sources: ['سورة البقرة: 286', 'صحيح البخاري 6368'],
  };

  if (!c.env.AI) {
    return c.json(fallback);
  }

  const systemPrompt = `أنت عالم إسلامي متخصص في الأدعية والأذكار.
مهمتك: عندما يصف المستخدم موقفه، اكتب دعاءً مناسباً باللغة العربية الفصحى
مستنداً حصراً إلى الأدعية القرآنية والأحاديث النبوية الصحيحة.
لكل جملة في الدعاء، أضف المصدر بين قوسين مربعين.
اختتم بتنبيه: "هذا اجتهاد للإلهام، والرجوع لعالم دين متخصص أفضل".
أجب بـ JSON فقط: { "dua": "نص الدعاء", "sources": ["مصدر١","مصدر٢"] }`;

  const response = await c.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `الموقف: ${situation}` },
    ],
    max_tokens: 600,
    temperature: 0.4,
  }) as { response?: string };

  try {
    const raw = response.response?.trim() ?? '{}';
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    return c.json(duaResultSchema.parse(JSON.parse(jsonMatch?.[0] ?? '{}')));
  } catch {
    return c.json(fallback);
  }
});

aiRoutes.post('/companion/daily', async (c) => {
  const { history } = companionSchema.parse(await c.req.json());
  const cacheKey = `companion:v2:daily:${new Date().toISOString().split('T')[0]}`;
  const cached = await readCache(c.env, 'PRAYER_CACHE', cacheKey);
  if (cached) {
    return c.json(cached);
  }

  const fallback = {
    reflection: `واصل ما بدأته هذا الأسبوع مع ${history.last_surah}. ثباتك في الأذكار وطلب العلم علامة خير. اجعل اليوم مساحة لنية صادقة وقلب حاضر.`,
    focus: history.adhkar_completed.length ? 'حافظ اليوم على ورد القرآن بعد الفجر.' : 'ابدأ يومك بأذكار الصباح ثم صفحة من القرآن.',
    focus_type: history.adhkar_completed.length ? 'quran' : 'azkar',
  };

  if (!c.env.AI) {
    await writeCache(c.env, 'PRAYER_CACHE', cacheKey, fallback, 86400);
    return c.json(fallback);
  }

  const prompt = `أنت رفيق روحي إسلامي لطيف ومشجع.
بناءً على ما قرأه المسلم هذا الأسبوع، اكتب:
1. ثلاث جمل تأملية مشجعة مرتبطة بما قرأه
2. توصية لعبادة واحدة يركز عليها اليوم
أجب بـ JSON: { "reflection": "...", "focus": "...", "focus_type": "quran|azkar|hadith|sadaqa" }
المعلومات: ${JSON.stringify(history)}`;

  const result = await c.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 300,
    temperature: 0.6,
  }) as { response?: string };

  let payload = fallback;
  try {
    payload = companionResultSchema.parse(JSON.parse(result.response?.match(/\{[\s\S]*\}/)?.[0] ?? '{}'));
  } catch {
    payload = fallback;
  }

  queueBackgroundTask(c, writeCache(c.env, 'PRAYER_CACHE', cacheKey, payload, 86400));
  return c.json(payload);
});

aiRoutes.get('/quran/search', async (c) => {
  const { q, limit } = searchSchema.parse(c.req.query());
  const list = await getSurahList(c.env);

  if (!c.env.AI) {
    const queryText = q.toLowerCase();
    const lexicalResults = list
      .filter((surah) => surah.name.includes(q) || surah.transliteration.toLowerCase().includes(queryText))
      .slice(0, limit)
      .map((surah, index) => ({
        surah: surah.id,
        ayah: 1,
        text_ar: `${surah.name} — نتيجة مطابقة اسمية`,
        surah_name: surah.name,
        score: Number((1 - index * 0.05).toFixed(2)),
      }));
    return c.json({ query: q, results: lexicalResults });
  }

  const rawData = await createSemanticEmbedding(c.env, q);
  const queryVector = Array.isArray(rawData?.[0])
    ? rawData[0]
    : Array.isArray(rawData)
      ? rawData as unknown as number[]
      : null;

  if (!queryVector) {
    return c.json({ query: q, results: [] });
  }

  let matches: Array<{ score: number; metadata?: Record<string, unknown> }> = [];

  if (c.env.QURAN_VECTORS) {
    try {
      const results = await c.env.QURAN_VECTORS.query(queryVector, {
        topK: limit,
        returnMetadata: 'all',
      });
      matches = results.matches;
    } catch {
      matches = [];
    }
  }

  if (!matches.length) {
    const queryText = q.toLowerCase();
    const lexicalResults = list
      .filter((surah) => surah.name.includes(q) || surah.transliteration.toLowerCase().includes(queryText))
      .slice(0, limit)
      .map((surah, index) => ({
        surah: surah.id,
        ayah: 1,
        text_ar: `${surah.name} — نتيجة مطابقة اسمية`,
        surah_name: surah.name,
        score: Number((1 - index * 0.05).toFixed(2)),
      }));
    return c.json({ query: q, results: lexicalResults });
  }

  const ayat = matches.map((match) => ({
    surah: Number(match.metadata?.surah ?? 0),
    ayah: Number(match.metadata?.ayah ?? 0),
    text_ar: String(match.metadata?.text_ar ?? ''),
    surah_name: String(match.metadata?.surah_name_ar ?? ''),
    score: match.score,
  }));

  return c.json({ query: q, results: ayat });
});

async function createSemanticEmbedding(env: Env, text: string) {
  if (env.AI) {
    try {
      const embeddingResult = await env.AI.run('@cf/baai/bge-base-en-v1.5', { text }) as { data?: number[][] | number[] };
      if (embeddingResult.data) {
        return embeddingResult.data;
      }
    } catch {
      return null;
    }
  }

  return null;
}

aiRoutes.post('/ruya/reflect', async (c) => {
  const body = z.object({ dream: z.string().min(3) }).parse(await c.req.json());
  const fallback = {
    reflection: 'ابدأ بذكر الله عند الاستيقاظ، ولا تحدّث برؤياك إلا من تثق بعلمه ونصحه. الرؤى باب لطيف لكن تأويلها علم دقيق. إن كانت الرؤيا مزعجة فاستعذ بالله منها ولا تشغل قلبك بها. الرجوع لعالم متخصص إذا أثرت الرؤيا نفسياً.'
  };

  if (!c.env.AI) {
    return c.json(fallback);
  }

  const prompt = `أنت عالم إسلامي يرشد حول موضوع الرؤى.
وصف الرؤيا: "${body.dream}"
اكتب تأملاً إسلامياً مختصراً يذكّر بالآداب الإسلامية للرؤى دون تفسيرها.`;

  const result = await c.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 220,
    temperature: 0.3,
  }) as { response?: string };

  return c.json({ reflection: result.response?.trim() || fallback.reflection });
});

aiRoutes.post('/voice/command', async (c) => {
  const form = await c.req.formData();
  const transcriptFallback = String(form.get('text') ?? '').trim();
  let text = transcriptFallback;

  const audio = form.get('audio');
  if (isFileLike(audio) && c.env.AI) {
    const buffer = await audio.arrayBuffer();
    const stt = await c.env.AI.run('@cf/openai/whisper', {
      audio: [...new Uint8Array(buffer)],
    }) as { text?: string };
    text = stt.text?.trim() ?? transcriptFallback;
  }

  const fallbackIntent = parseFallbackVoiceIntent(text);
  if (!c.env.AI || !text) {
    return c.json({ transcript: text, ...fallbackIntent });
  }

  const intentPrompt = `حول هذا الأمر الصوتي إلى intent منظم.\n${text}\nأجب بـ JSON فقط: { "intent": "...", "params": {...}, "confidence": 0.0 }`;
  const llm = await c.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
    messages: [{ role: 'user', content: intentPrompt }],
    max_tokens: 150,
    temperature: 0.1,
  }) as { response?: string };

  try {
    const parsed = JSON.parse(llm.response?.match(/\{[\s\S]*\}/)?.[0] ?? '{}');
    return c.json({ transcript: text, ...parsed });
  } catch {
    return c.json({ transcript: text, ...fallbackIntent });
  }
});

aiRoutes.post('/tajweed/analyze', async (c) => {
  const form = await c.req.formData();
  const surah = Number(form.get('surah') ?? 1);
  const ayah = Number(form.get('ayah') ?? 1);
  const audio = form.get('audio');
  let transcribed = String(form.get('transcript') ?? '').trim();

  if (isFileLike(audio) && c.env.AI) {
    const arrayBuffer = await audio.arrayBuffer();
    const whisperResult = await c.env.AI.run('@cf/openai/whisper', {
      audio: [...new Uint8Array(arrayBuffer)],
    }) as { text?: string };
    transcribed = whisperResult.text?.trim() ?? transcribed;
  }

  const correctText = (await c.env.QURAN_CACHE.get(`ayah:${surah}:${ayah}:ar`)) ?? fallbackDailyContent.ayah.text;
  const analysis = computeTajweedScore(transcribed, correctText);

  if (c.env.MEDIA_BUCKET) {
    queueBackgroundTask(c,
      c.env.MEDIA_BUCKET.put(
        `tajweed/${crypto.randomUUID()}.json`,
        JSON.stringify({ surah, ayah, transcribed, analysis, ts: Date.now() })
      )
    );
  }

  return c.json(analysis);
});

aiRoutes.get('/halal/scan', async (c) => {
  const barcode = z.string().min(4).parse(c.req.query('barcode'));
  const cacheKey = `halal:${barcode}`;
  const cached = await readCache<ReturnType<typeof computeHalalVerdict>>(c.env, 'QURAN_CACHE', cacheKey);
  if (cached) {
    return c.json(cached);
  }

  const response = await fetch(
    `https://world.openfoodfacts.org/api/v2/product/${barcode}?fields=product_name,ingredients_text,allergens`
  );
  const data = await response.json() as {
    product?: { product_name?: string; ingredients_text?: string };
    status?: number;
  };

  if (data.status !== 1 || !data.product) {
    return c.json({ found: false });
  }

  const result = computeHalalVerdict(data.product.product_name ?? 'منتج', data.product.ingredients_text ?? '');
  queueBackgroundTask(c, writeCache(c.env, 'QURAN_CACHE', cacheKey, result, 604800));
  return c.json(result);
});

function parseFallbackVoiceIntent(text: string) {
  if (!text) {
    return { intent: 'UNKNOWN', params: {}, confidence: 0 };
  }

  if (text.includes('أوقف') || text.includes('وقف')) {
    return { intent: 'STOP_AUDIO', params: {}, confidence: 0.7 };
  }
  if (text.includes('إذاعة')) {
    return { intent: 'PLAY_RADIO', params: {}, confidence: 0.6 };
  }
  if (text.includes('أذكار الصباح')) {
    return { intent: 'OPEN_AZKAR', params: { type: 'morning' }, confidence: 0.72 };
  }
  if (text.includes('وقت') && text.includes('الصلاة')) {
    return { intent: 'PRAYER_TIME', params: { prayer: 'next' }, confidence: 0.75 };
  }

  return { intent: 'UNKNOWN', params: { raw: text }, confidence: 0.3 };
}
