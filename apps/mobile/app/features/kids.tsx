import { useState } from 'react';

import { KidsHomeScreen } from '../../src/features/kids/KidsHomeScreen';
import { KidsPinGate } from '../../src/features/kids/KidsPinGate';

export default function KidsFeatureScreen() {
  const [unlocked, setUnlocked] = useState(false);

  return unlocked ? <KidsHomeScreen /> : <KidsPinGate onUnlocked={() => setUnlocked(true)} />;
}
