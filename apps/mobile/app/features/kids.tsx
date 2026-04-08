import { AppState } from 'react-native';
import { useEffect, useState } from 'react';

import { KidsHomeScreen } from '../../src/features/kids/KidsHomeScreen';
import { KidsPinGate } from '../../src/features/kids/KidsPinGate';
import { storage } from '../../src/lib/mmkv';

export default function KidsFeatureScreen() {
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') {
        setUnlocked(false);
      }
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    const lastLockedAt = storage.getString('kids_mode_locked_at');
    if (lastLockedAt) {
      const elapsed = Date.now() - Number(lastLockedAt);
      if (elapsed > 0) {
        setUnlocked(false);
      }
    }
  }, []);

  return unlocked ? <KidsHomeScreen /> : <KidsPinGate onUnlocked={() => setUnlocked(true)} />;
}
