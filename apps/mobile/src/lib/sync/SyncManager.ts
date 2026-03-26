import NetInfo from '@react-native-community/netinfo';
import { collection, doc, getDocs, query, where, writeBatch } from 'firebase/firestore';

import { db } from '../firebase';
import { storage } from '../mmkv';

export interface SyncableRecord {
  id: string;
  updated_at: number;
  synced_at: number;
  deleted: boolean;
}

export interface SQLiteSyncAdapter<T extends SyncableRecord> {
  listUnsynced(limit: number): Promise<T[]>;
  getById(id: string): Promise<T | null>;
  upsert(record: T): Promise<void>;
  markSynced(ids: string[], timestamp: number): Promise<void>;
}

export class SyncManager<T extends SyncableRecord> {
  constructor(
    private readonly collectionName: string,
    private readonly adapter: SQLiteSyncAdapter<T>
  ) {}

  async pull(userId: string) {
    if (!db) return;
    const lastSync = storage.getNumber(`sync:last:${this.collectionName}`) ?? 0;
    const snapshot = await getDocs(
      query(collection(db, 'users', userId, this.collectionName), where('updated_at', '>', lastSync))
    );

    for (const entry of snapshot.docs) {
      const remote = entry.data() as T;
      const local = await this.adapter.getById(remote.id);
      if (!local || remote.updated_at > local.updated_at) {
        await this.adapter.upsert(remote);
      }
    }

    storage.set(`sync:last:${this.collectionName}`, Date.now());
  }

  async push(userId: string) {
    if (!db) return;
    const unsynced = await this.adapter.listUnsynced(100);
    if (!unsynced.length) {
      return;
    }

    const batch = writeBatch(db);
    for (const record of unsynced) {
      batch.set(doc(db, 'users', userId, this.collectionName, record.id), record);
    }

    await batch.commit();
    await this.adapter.markSynced(unsynced.map((record) => record.id), Date.now());
  }

  async autoSync(userId: string) {
    const state = await NetInfo.fetch();
    if (!state.isConnected) {
      return;
    }

    await this.pull(userId);
    await this.push(userId);
  }
}
