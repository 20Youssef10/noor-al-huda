import { type TajweedAnalysis, type TajweedError, type TajweedWordResult } from '../types';

const tashkeelRegex = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g;

function stripTashkeel(input: string) {
  return input.replace(tashkeelRegex, '').replace(/\s+/g, ' ').trim();
}

export function levenshtein(left: string, right: string) {
  const rows = left.length + 1;
  const cols = right.length + 1;
  const matrix = Array.from({ length: rows }, () => Array<number>(cols).fill(0));

  for (let i = 0; i < rows; i += 1) matrix[i]![0] = i;
  for (let j = 0; j < cols; j += 1) matrix[0]![j] = j;

  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = left[i - 1] === right[j - 1] ? 0 : 1;
      matrix[i]![j] = Math.min(
        matrix[i - 1]![j]! + 1,
        matrix[i]![j - 1]! + 1,
        matrix[i - 1]![j - 1]! + cost
      );
    }
  }

  return matrix[rows - 1]![cols - 1]!;
}

export function computeTajweedScore(transcribed: string, correctText: string): TajweedAnalysis {
  const cleanTranscribed = stripTashkeel(transcribed);
  const cleanCorrect = stripTashkeel(correctText);

  const spokenWords = cleanTranscribed ? cleanTranscribed.split(' ') : [];
  const correctWords = cleanCorrect ? cleanCorrect.split(' ') : [];
  const words: TajweedWordResult[] = [];
  const errors: TajweedError[] = [];
  const max = Math.max(spokenWords.length, correctWords.length);
  let correctCount = 0;

  for (let index = 0; index < max; index += 1) {
    const expected = correctWords[index] ?? '';
    const got = spokenWords[index] ?? '';

    if (expected && got && expected === got) {
      words.push({ expected, got, status: 'correct' });
      correctCount += 1;
      continue;
    }

    if (expected && !got) {
      words.push({ expected, got: '', status: 'missing' });
      errors.push({
        type: 'missing_word',
        position: index,
        expected,
        got: '',
        description_ar: 'تم إسقاط كلمة من الآية.'
      });
      continue;
    }

    if (!expected && got) {
      words.push({ expected: '', got, status: 'extra' });
      errors.push({
        type: 'extra_word',
        position: index,
        expected: '',
        got,
        description_ar: 'هناك كلمة زائدة عن نص الآية.'
      });
      continue;
    }

    words.push({ expected, got, status: 'changed' });
  }

  const joinedCorrect = correctWords.join(' ');
  const joinedSpoken = spokenWords.join(' ');
  const distance = levenshtein(joinedCorrect, joinedSpoken);
  const accuracy = correctWords.length ? Math.max(0, Math.round((correctCount / correctWords.length) * 100)) : 0;

  const tajweedErrors = runRuleChecks(correctText, transcribed);
  const scorePenalty = Math.min(55, distance + errors.length * 5 + tajweedErrors.length * 6);
  const score = Math.max(0, Math.min(100, accuracy + 30 - scorePenalty));
  const allErrors = [...errors, ...tajweedErrors];

  return {
    score,
    accuracy,
    words,
    errors: allErrors,
    encouragement_ar:
      score >= 90 ? 'ممتاز! تلاوة قوية ومتقنة.' :
      score >= 70 ? 'أداء جميل، ومع بعض المراجعة ستتحسن أكثر.' :
      'استمر في التدريب الهادئ، والتكرار سيزيد إتقانك بإذن الله.'
  };
}

function runRuleChecks(correctText: string, transcribed: string): TajweedError[] {
  const errors: TajweedError[] = [];
  const cleanCorrect = stripTashkeel(correctText);
  const cleanTranscribed = stripTashkeel(transcribed);
  const rules: Array<{ type: TajweedError['type']; regex: RegExp; description_ar: string }> = [
    { type: 'ghunna', regex: /ن\s*[بم]/g, description_ar: 'تحقق من الغنة عند النون أو الميم قبل الباء أو الميم.' },
    { type: 'madd', regex: /[اوي]{2,}/g, description_ar: 'راجع مقدار المد في هذا الموضع.' },
    { type: 'qalqala', regex: /[قطبجد](?=\s|$)/g, description_ar: 'قد تحتاج القلقلة في هذا الموضع.' },
    { type: 'idgham', regex: /ن\s*[يرملون]/g, description_ar: 'تحقق من الإدغام في هذا الموضع.' },
    { type: 'ikhfa', regex: /ن\s*[تثجدذزسشصضطظفقك]/g, description_ar: 'تحقق من الإخفاء في هذا الموضع.' },
  ];

  for (const rule of rules) {
    const matches = [...cleanCorrect.matchAll(rule.regex)];
    for (const match of matches) {
      const segment = match[0];
      if (segment && !cleanTranscribed.includes(segment)) {
        errors.push({
          type: rule.type,
          position: match.index ?? 0,
          expected: segment,
          got: '',
          description_ar: rule.description_ar,
        });
      }
    }
  }

  return errors;
}
