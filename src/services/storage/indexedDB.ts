import { FieldObservation, UserPreferences, Mission } from '../../types';

const DB_NAME = 'sidequest_db';
const DB_VERSION = 1;
const STORES = {
  EXPEDITIONS: 'expeditions',
  SETTINGS: 'settings',
  ACTIVE_QUEST: 'active_quest',
  MILESTONES: 'milestones'
};

class StorageService {
  private db: IDBDatabase | null = null;
  private isMemoryFallback = false;
  private memoryStore: Map<string, any> = new Map();

  async init(): Promise<void> {
    if (typeof window === 'undefined' || !window.indexedDB) {
      this.isMemoryFallback = true;
      return;
    }

    return new Promise((resolve) => {
      try {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(STORES.EXPEDITIONS)) {
            db.createObjectStore(STORES.EXPEDITIONS, { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
            db.createObjectStore(STORES.SETTINGS);
          }
          if (!db.objectStoreNames.contains(STORES.ACTIVE_QUEST)) {
            db.createObjectStore(STORES.ACTIVE_QUEST);
          }
          if (!db.objectStoreNames.contains(STORES.MILESTONES)) {
            db.createObjectStore(STORES.MILESTONES);
          }
        };

        request.onsuccess = (event) => {
          this.db = (event.target as IDBOpenDBRequest).result;
          resolve();
        };

        request.onerror = () => {
          console.warn('IndexedDB failed to open, falling back to local memory store.');
          this.isMemoryFallback = true;
          resolve();
        };
      } catch (err) {
        console.warn('IndexedDB exception, falling back to local memory store:', err);
        this.isMemoryFallback = true;
        resolve();
      }
    });
  }

  // --- Expeditions ---
  async saveExpedition(observation: FieldObservation): Promise<void> {
    if (this.isMemoryFallback || !this.db) {
      const list = this.memoryStore.get(STORES.EXPEDITIONS) || [];
      const updated = [observation, ...list.filter((x: FieldObservation) => x.id !== observation.id)];
      this.memoryStore.set(STORES.EXPEDITIONS, updated);
      try {
        localStorage.setItem(`sidequest_${STORES.EXPEDITIONS}`, JSON.stringify(updated));
      } catch (_) {}
      return;
    }

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(STORES.EXPEDITIONS, 'readwrite');
      const store = tx.objectStore(STORES.EXPEDITIONS);
      store.put(observation);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async getExpeditions(): Promise<FieldObservation[]> {
    if (this.isMemoryFallback || !this.db) {
      if (this.memoryStore.has(STORES.EXPEDITIONS)) {
        return this.memoryStore.get(STORES.EXPEDITIONS);
      }
      try {
        const raw = localStorage.getItem(`sidequest_${STORES.EXPEDITIONS}`);
        if (raw) return JSON.parse(raw);
      } catch (_) {}
      return [];
    }

    return new Promise((resolve) => {
      const tx = this.db!.transaction(STORES.EXPEDITIONS, 'readonly');
      const store = tx.objectStore(STORES.EXPEDITIONS);
      const req = store.getAll();
      req.onsuccess = () => {
        const results = req.result as FieldObservation[];
        results.sort((a, b) => b.timestamp - a.timestamp);
        resolve(results);
      };
      req.onerror = () => resolve([]);
    });
  }

  // --- Active Quest (for browser refresh mid-quest) ---
  async saveActiveQuest(data: { mission: Mission; startedAt: number; durationMinutes: number } | null): Promise<void> {
    if (this.isMemoryFallback || !this.db) {
      if (data) {
        this.memoryStore.set(STORES.ACTIVE_QUEST, data);
        try { localStorage.setItem(`sidequest_${STORES.ACTIVE_QUEST}`, JSON.stringify(data)); } catch (_) {}
      } else {
        this.memoryStore.delete(STORES.ACTIVE_QUEST);
        try { localStorage.removeItem(`sidequest_${STORES.ACTIVE_QUEST}`); } catch (_) {}
      }
      return;
    }

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(STORES.ACTIVE_QUEST, 'readwrite');
      const store = tx.objectStore(STORES.ACTIVE_QUEST);
      if (data) {
        store.put(data, 'current');
      } else {
        store.delete('current');
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async getActiveQuest(): Promise<{ mission: Mission; startedAt: number; durationMinutes: number } | null> {
    if (this.isMemoryFallback || !this.db) {
      if (this.memoryStore.has(STORES.ACTIVE_QUEST)) {
        return this.memoryStore.get(STORES.ACTIVE_QUEST);
      }
      try {
        const raw = localStorage.getItem(`sidequest_${STORES.ACTIVE_QUEST}`);
        if (raw) return JSON.parse(raw);
      } catch (_) {}
      return null;
    }

    return new Promise((resolve) => {
      const tx = this.db!.transaction(STORES.ACTIVE_QUEST, 'readonly');
      const store = tx.objectStore(STORES.ACTIVE_QUEST);
      const req = store.get('current');
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  }

  // --- Preferences ---
  async savePreferences(prefs: UserPreferences): Promise<void> {
    if (this.isMemoryFallback || !this.db) {
      this.memoryStore.set(STORES.SETTINGS, prefs);
      try { localStorage.setItem(`sidequest_${STORES.SETTINGS}`, JSON.stringify(prefs)); } catch (_) {}
      return;
    }

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(STORES.SETTINGS, 'readwrite');
      const store = tx.objectStore(STORES.SETTINGS);
      store.put(prefs, 'user_prefs');
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async getPreferences(): Promise<UserPreferences | null> {
    if (this.isMemoryFallback || !this.db) {
      if (this.memoryStore.has(STORES.SETTINGS)) {
        return this.memoryStore.get(STORES.SETTINGS);
      }
      try {
        const raw = localStorage.getItem(`sidequest_${STORES.SETTINGS}`);
        if (raw) return JSON.parse(raw);
      } catch (_) {}
      return null;
    }

    return new Promise((resolve) => {
      const tx = this.db!.transaction(STORES.SETTINGS, 'readonly');
      const store = tx.objectStore(STORES.SETTINGS);
      const req = store.get('user_prefs');
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  }

  // --- Milestones ---
  async saveUnlockedMilestones(unlockedIds: string[]): Promise<void> {
    if (this.isMemoryFallback || !this.db) {
      this.memoryStore.set(STORES.MILESTONES, unlockedIds);
      try { localStorage.setItem(`sidequest_${STORES.MILESTONES}`, JSON.stringify(unlockedIds)); } catch (_) {}
      return;
    }

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(STORES.MILESTONES, 'readwrite');
      const store = tx.objectStore(STORES.MILESTONES);
      store.put(unlockedIds, 'unlocked');
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async getUnlockedMilestones(): Promise<string[]> {
    if (this.isMemoryFallback || !this.db) {
      if (this.memoryStore.has(STORES.MILESTONES)) {
        return this.memoryStore.get(STORES.MILESTONES);
      }
      try {
        const raw = localStorage.getItem(`sidequest_${STORES.MILESTONES}`);
        if (raw) return JSON.parse(raw);
      } catch (_) {}
      return [];
    }

    return new Promise((resolve) => {
      const tx = this.db!.transaction(STORES.MILESTONES, 'readonly');
      const store = tx.objectStore(STORES.MILESTONES);
      const req = store.get('unlocked');
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  }

  // --- Clear all data ---
  async clearAllData(): Promise<void> {
    this.memoryStore.clear();
    try {
      localStorage.removeItem(`sidequest_${STORES.EXPEDITIONS}`);
      localStorage.removeItem(`sidequest_${STORES.ACTIVE_QUEST}`);
      localStorage.removeItem(`sidequest_${STORES.SETTINGS}`);
      localStorage.removeItem(`sidequest_${STORES.MILESTONES}`);
    } catch (_) {}

    if (this.db) {
      return new Promise((resolve) => {
        const tx = this.db!.transaction([STORES.EXPEDITIONS, STORES.SETTINGS, STORES.ACTIVE_QUEST, STORES.MILESTONES], 'readwrite');
        tx.objectStore(STORES.EXPEDITIONS).clear();
        tx.objectStore(STORES.SETTINGS).clear();
        tx.objectStore(STORES.ACTIVE_QUEST).clear();
        tx.objectStore(STORES.MILESTONES).clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      });
    }
  }
}

export const storageService = new StorageService();
