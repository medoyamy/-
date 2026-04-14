import { get, set, del, clear } from 'idb-keyval';
import { safeStringify } from './mapUtils';

/**
 * Professional Storage Utility
 * Uses IndexedDB (via idb-keyval) for large/non-essential data (high quota)
 * Uses localStorage for small, critical, synchronous data (low quota)
 */

// --- Synchronous (localStorage) ---
// Use ONLY for small strings like IDs, city names, etc.
export const syncStorage = {
  get: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.error(`SyncStorage GET failed for ${key}`, safeStringify(e));
      return null;
    }
  },
  set: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      if (e instanceof DOMException && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
        console.warn(`SyncStorage SET failed for ${key} (Quota Exceeded). Attempting to clear non-essential localStorage...`);
        // Emergency clear of non-critical localStorage
        const criticalKeys = ['active_profile_id', 'current_city', 'current_region'];
        Object.keys(localStorage).forEach(k => {
          if (!criticalKeys.includes(k)) localStorage.removeItem(k);
        });
        // Retry once
        try {
          localStorage.setItem(key, value);
        } catch (retryErr) {
          console.error(`SyncStorage FATAL: Could not set ${key} even after clear.`, safeStringify(retryErr));
        }
      } else {
        console.error(`SyncStorage SET failed for ${key}`, safeStringify(e));
      }
    }
  },
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error(`SyncStorage REMOVE failed for ${key}`, safeStringify(e));
    }
  },
  clear: (): void => {
    try {
      localStorage.clear();
    } catch (e) {
      console.error('SyncStorage CLEAR failed', safeStringify(e));
    }
  }
};

// --- Asynchronous (IndexedDB) ---
// Use for EVERYTHING ELSE (Carts, Posts, Stories, Large Configs)
export const asyncStorage = {
  get: async <T>(key: string): Promise<T | null> => {
    try {
      return await get(key);
    } catch (e) {
      console.error(`AsyncStorage GET failed for ${key}`, safeStringify(e));
      return null;
    }
  },
  set: async (key: string, value: any): Promise<void> => {
    try {
      await set(key, value);
    } catch (e) {
      console.error(`AsyncStorage SET failed for ${key}`, safeStringify(e));
    }
  },
  remove: async (key: string): Promise<void> => {
    try {
      await del(key);
    } catch (e) {
      console.error(`AsyncStorage REMOVE failed for ${key}`, safeStringify(e));
    }
  },
  clear: async (): Promise<void> => {
    try {
      await clear();
    } catch (e) {
      console.error('AsyncStorage CLEAR failed', safeStringify(e));
    }
  }
};

/**
 * Hard Reset Utility
 * Clears both localStorage and IndexedDB
 */
export const hardResetStorage = async (): Promise<void> => {
  syncStorage.clear();
  await asyncStorage.clear();
  window.location.reload();
};
