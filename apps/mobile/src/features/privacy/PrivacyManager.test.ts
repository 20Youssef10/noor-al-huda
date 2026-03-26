import { storage } from '../../lib/mmkv';
import { canAnalytics, canRequestUrl, canSync, getPrivacyMode, setPrivacyMode } from './PrivacyManager';

describe('privacy manager', () => {
  beforeEach(() => {
    storage.remove('privacy_mode');
  });

  it('defaults to full mode', () => {
    expect(getPrivacyMode()).toBe('full');
    expect(canSync()).toBe(true);
    expect(canAnalytics()).toBe(true);
  });

  it('blocks non-islamic URLs in private mode', () => {
    setPrivacyMode('private');
    expect(canRequestUrl('https://api.quran.com/api/v4/chapters')).toBe(true);
    expect(canRequestUrl('https://example.com/metrics')).toBe(false);
  });
});
