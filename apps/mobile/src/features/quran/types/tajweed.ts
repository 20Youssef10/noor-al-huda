export interface WordResult {
  expected: string;
  got: string;
  status: 'correct' | 'missing' | 'extra' | 'changed';
}

export interface TajweedError {
  type: 'ghunna' | 'madd' | 'qalqala' | 'idgham' | 'ikhfa' | 'extra_word' | 'missing_word';
  position: number;
  expected: string;
  got: string;
  description_ar: string;
}

export interface TajweedAnalysis {
  score: number;
  accuracy: number;
  words: WordResult[];
  errors: TajweedError[];
  encouragement_ar: string;
}
