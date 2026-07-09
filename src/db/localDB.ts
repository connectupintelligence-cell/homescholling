import type { DailyPlanning, WeeklyMythology } from '../types';

const DB_NAME = 'HomeschoolingAgendaDB';
const DB_VERSION = 1;

export class LocalDB {
  private db: IDBDatabase | null = null;

  init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('Failed to open IndexedDB');
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = () => {
        const db = request.result;
        
        // Planning store with date as key
        if (!db.objectStoreNames.contains('planning')) {
          db.createObjectStore('planning', { keyPath: 'date' });
        }
        
        // Mythology store with week ID as key (e.g. YYYY-Www)
        if (!db.objectStoreNames.contains('mythology')) {
          db.createObjectStore('mythology', { keyPath: 'id' });
        }
        
        // Config store with a simple key-value structure
        if (!db.objectStoreNames.contains('config')) {
          db.createObjectStore('config', { keyPath: 'key' });
        }
      };
    });
  }

  private getStore(storeName: string, mode: IDBTransactionMode): IDBObjectStore {
    if (!this.db) {
      throw new Error('Database not initialized. Call init() first.');
    }
    const transaction = this.db.transaction(storeName, mode);
    return transaction.objectStore(storeName);
  }

  // --- PLANNING METHODS ---
  async getPlanning(date: string): Promise<DailyPlanning | null> {
    return new Promise((resolve, reject) => {
      try {
        const store = this.getStore('planning', 'readonly');
        const request = store.get(date);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  async savePlanning(planning: DailyPlanning): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const store = this.getStore('planning', 'readwrite');
        const request = store.put(planning);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  async getAllPlannings(): Promise<DailyPlanning[]> {
    return new Promise((resolve, reject) => {
      try {
        const store = this.getStore('planning', 'readonly');
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  // --- MYTHOLOGY METHODS ---
  async getWeeklyMythology(weekId: string): Promise<WeeklyMythology | null> {
    return new Promise((resolve, reject) => {
      try {
        const store = this.getStore('mythology', 'readonly');
        const request = store.get(weekId);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  async saveWeeklyMythology(myth: WeeklyMythology): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const store = this.getStore('mythology', 'readwrite');
        const request = store.put(myth);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  // --- CONFIG / GENERIC STORAGE ---
  async getConfig<T>(key: string): Promise<T | null> {
    return new Promise((resolve, reject) => {
      try {
        const store = this.getStore('config', 'readonly');
        const request = store.get(key);
        request.onsuccess = () => {
          resolve(request.result ? (request.result.value as T) : null);
        };
        request.onerror = () => reject(request.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  async saveConfig<T>(key: string, value: T): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const store = this.getStore('config', 'readwrite');
        const request = store.put({ key, value });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      } catch (err) {
        reject(err);
      }
    });
  }
}

export const localDB = new LocalDB();
