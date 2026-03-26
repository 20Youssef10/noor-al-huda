import { ACHIEVEMENTS, getUnlockedAchievements } from './achievements';

describe('achievements', () => {
  it('defines 15 achievements', () => {
    expect(ACHIEVEMENTS).toHaveLength(15);
  });

  it('returns unlocked achievements based on progress map', () => {
    const unlocked = getUnlockedAchievements({ streak: 7, total_azkar: 20 });
    expect(unlocked.map((item) => item.id)).toContain('first_day');
    expect(unlocked.map((item) => item.id)).toContain('week_warrior');
    expect(unlocked.map((item) => item.id)).not.toContain('month_strong');
  });
});
