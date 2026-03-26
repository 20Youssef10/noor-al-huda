import { storage } from '../../lib/mmkv';
import { defaultStreak, getHijriDateString, recordActivity } from './streak';

describe('streak logic', () => {
  beforeEach(() => {
    storage.remove('streak_data');
  });

  it('returns a formatted hijri date string', () => {
    expect(getHijriDateString(0, new Date('2026-03-26T00:00:00Z'))).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('starts a new streak when there is no prior activity', async () => {
    const result = await recordActivity('quran');
    expect(result.current_streak).toBe(1);
    expect(result.longest_streak).toBe(1);
  });

  it('does not increment twice on the same day', async () => {
    await recordActivity('quran');
    const result = await recordActivity('quran');
    expect(result.current_streak).toBe(1);
  });

  it('uses default shape when storage is empty', () => {
    expect(defaultStreak.current_streak).toBe(0);
  });
});
