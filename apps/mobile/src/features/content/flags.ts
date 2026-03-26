import * as Crypto from 'expo-crypto';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

import { db } from '../../lib/firebase';
import { storage } from '../../lib/mmkv';

async function getAnonymousDeviceId() {
  const stored = storage.getString('anonymous_device_id');
  if (stored) return stored;
  const seed = `${Date.now()}-${Math.random()}`;
  const hashed = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, seed);
  storage.set('anonymous_device_id', hashed);
  return hashed;
}

export async function flagContent(contentId: string, reason: 'weak' | 'fabricated' | 'wrong_source') {
  if (!db) return;
  await addDoc(collection(db, 'content_flags'), {
    content_id: contentId,
    reason,
    reporter_device_id: await getAnonymousDeviceId(),
    flagged_at: serverTimestamp(),
  });
  storage.set(`flagged_${contentId}`, 'true');
}
