import { fallbackLocation } from '../../data/fallback';
import { buildLocalPrayerData } from './service';

describe('buildLocalPrayerData', () => {
  it('returns a complete local prayer payload', () => {
    const result = buildLocalPrayerData(new Date('2026-03-26T09:00:00Z'), fallbackLocation, 'ummAlQura');

    expect(result.locationLabel).toBe(fallbackLocation.label);
    expect(result.source).toBe('local');
    expect(result.prayers.fajr).toBeTruthy();
    expect(result.prayers.isha).toBeTruthy();
    expect(result.qiblaDegrees).toBeGreaterThanOrEqual(0);
    expect(result.qiblaDegrees).toBeLessThanOrEqual(360);
  });
});
