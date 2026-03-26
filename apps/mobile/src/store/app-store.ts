import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { fallbackLocation } from '../data/fallback';
import { type Bookmark, type UserSettings } from '../types/domain';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

type AppState = {
  settings: UserSettings;
  bookmarks: Bookmark[];
  completedAzkar: Record<string, number>;
  activeRadioId: string | null;
  lastReadSurahId: number | null;
  syncStatus: SyncStatus;
  syncMessage: string | null;
  setLocation: (location: UserSettings['location']) => void;
  setCalculationMethod: (calculationMethod: string) => void;
  setNotificationsEnabled: (notificationsEnabled: boolean) => void;
  setActiveRadioId: (activeRadioId: string | null) => void;
  setLastReadSurahId: (surahId: number) => void;
  replaceSettings: (settings: UserSettings) => void;
  replaceBookmarks: (bookmarks: Bookmark[]) => void;
  toggleBookmark: (bookmark: Bookmark) => void;
  incrementAzkar: (entryId: string) => void;
  setSyncState: (syncStatus: SyncStatus, syncMessage?: string | null) => void;
};

export function bookmarkKey(bookmark: Pick<Bookmark, 'surahId' | 'ayahNumber'>) {
  return `${bookmark.surahId}:${bookmark.ayahNumber}`;
}

export function serializeBookmarks(bookmarks: Bookmark[]) {
  return JSON.stringify(
    [...bookmarks]
      .map((bookmark) => ({
        ...bookmark,
        key: bookmarkKey(bookmark),
      }))
      .sort((left, right) => left.key.localeCompare(right.key))
  );
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
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
      setLocation: (location) =>
        set((state) => ({
          settings: { ...state.settings, location },
        })),
      setCalculationMethod: (calculationMethod) =>
        set((state) => ({
          settings: { ...state.settings, calculationMethod },
        })),
      setNotificationsEnabled: (notificationsEnabled) =>
        set((state) => ({
          settings: { ...state.settings, notificationsEnabled },
        })),
      setActiveRadioId: (activeRadioId) => set({ activeRadioId }),
      setLastReadSurahId: (lastReadSurahId) => set({ lastReadSurahId }),
      replaceSettings: (settings) => set({ settings }),
      replaceBookmarks: (bookmarks) => set({ bookmarks }),
      toggleBookmark: (bookmark) =>
        set((state) => {
          const exists = state.bookmarks.some(
            (item) =>
              item.surahId === bookmark.surahId && item.ayahNumber === bookmark.ayahNumber
          );

          return {
            bookmarks: exists
              ? state.bookmarks.filter(
                  (item) =>
                    !(
                      item.surahId === bookmark.surahId &&
                      item.ayahNumber === bookmark.ayahNumber
                    )
                )
              : [bookmark, ...state.bookmarks],
          };
        }),
      incrementAzkar: (entryId) =>
        set((state) => ({
          completedAzkar: {
            ...state.completedAzkar,
            [entryId]: (state.completedAzkar[entryId] ?? 0) + 1,
          },
        })),
      setSyncState: (syncStatus, syncMessage = null) => set({ syncStatus, syncMessage }),
    }),
    {
      name: 'noor-al-huda-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        settings: state.settings,
        bookmarks: state.bookmarks,
        completedAzkar: state.completedAzkar,
        lastReadSurahId: state.lastReadSurahId,
      }),
    }
  )
);
