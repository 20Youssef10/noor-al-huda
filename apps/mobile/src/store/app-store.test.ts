import { fallbackLocation } from '../data/fallback';
import { bookmarkKey, serializeBookmarks, useAppStore } from './app-store';

describe('app store helpers', () => {
  beforeEach(() => {
    useAppStore.setState({
      settings: {
        location: fallbackLocation,
        calculationMethod: 'ummAlQura',
        reciter: 'Mishary Rashid Alafasy',
        notificationsEnabled: true,
      },
      bookmarks: [],
      completedAzkar: {},
      activeRadioId: null,
      lastReadSurahId: 1,
      syncStatus: 'idle',
      syncMessage: null,
    });
  });

  it('creates stable bookmark keys', () => {
    expect(bookmarkKey({ surahId: 2, ayahNumber: 255 })).toBe('2:255');
  });

  it('serializes bookmarks in a deterministic order', () => {
    const first = { surahId: 112, surahName: 'الإخلاص', ayahNumber: 1, createdAt: '2026-01-01T00:00:00.000Z' };
    const second = { surahId: 2, surahName: 'البقرة', ayahNumber: 255, createdAt: '2026-01-02T00:00:00.000Z' };

    const serialized = serializeBookmarks([first, second]);

    expect(serialized.indexOf('112:1')).toBeLessThan(serialized.indexOf('2:255'));
  });

  it('toggles bookmarks on and off', () => {
    const bookmark = {
      surahId: 2,
      surahName: 'البقرة',
      ayahNumber: 255,
      createdAt: '2026-01-01T00:00:00.000Z',
    };

    useAppStore.getState().toggleBookmark(bookmark);
    expect(useAppStore.getState().bookmarks).toHaveLength(1);

    useAppStore.getState().toggleBookmark(bookmark);
    expect(useAppStore.getState().bookmarks).toHaveLength(0);
  });
});
