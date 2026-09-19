import { get, set, del, keys } from 'idb-keyval';

export const StorageKeys = {
  USER_PROFILE: 'aegis_user_profile',
  WORKOUT_SESSIONS: 'aegis_workout_sessions',
  CUSTOM_EXERCISES: 'aegis_custom_exercises',
  WEEKLY_SPLIT: 'aegis_weekly_split',
  DAILY_NUTRITION_PREFIX: 'aegis_nutrition_',
  DAILY_WATER_PREFIX: 'aegis_water_',
  SUPPLEMENT_PROTOCOLS: 'aegis_supplement_protocols',
  DAILY_SUPPLEMENT_PREFIX: 'aegis_supp_log_',
  BIOMARKER_RECORDS: 'aegis_biomarkers',
  TROPHIES: 'aegis_trophies',
  BODYWEIGHT_HISTORY: 'aegis_bodyweight',
  APP_SETTINGS: 'aegis_settings'
};

export async function saveItem<T>(key: string, value: T): Promise<void> {
  try {
    await set(key, value);
  } catch (err) {
    console.warn(`[IndexedDB] set failed for ${key}, falling back to localStorage:`, err);
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (localErr) {
      console.error(`[LocalStorage] save failed:`, localErr);
    }
  }
}

export async function getItem<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const val = await get<T>(key);
    if (val !== undefined && val !== null) {
      return val;
    }
  } catch (err) {
    console.warn(`[IndexedDB] get failed for ${key}, falling back to localStorage:`, err);
  }

  // Fallback to localStorage
  try {
    const local = localStorage.getItem(key);
    if (local !== null) {
      return JSON.parse(local) as T;
    }
  } catch (localErr) {
    console.warn(`[LocalStorage] parse failed for ${key}:`, localErr);
  }

  return defaultValue;
}

export async function removeItem(key: string): Promise<void> {
  try {
    await del(key);
  } catch (e) {
    console.warn('IDB del failed', e);
  }
  try {
    localStorage.removeItem(key);
  } catch (e) {
    // ignore
  }
}

export async function exportAllLocalData(): Promise<string> {
  const backup: Record<string, any> = {};
  const allKeys = Object.values(StorageKeys);
  for (const k of allKeys) {
    backup[k] = await getItem(k, null);
  }
  return JSON.stringify(backup, null, 2);
}

export async function importLocalData(jsonString: string): Promise<boolean> {
  try {
    const parsed = JSON.parse(jsonString);
    for (const [k, v] of Object.entries(parsed)) {
      if (v !== null) {
        await saveItem(k, v);
      }
    }
    return true;
  } catch (e) {
    console.error('Failed to import backup JSON:', e);
    return false;
  }
}
