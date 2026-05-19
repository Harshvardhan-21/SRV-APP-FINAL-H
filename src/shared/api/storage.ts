import AsyncStorage from '@react-native-async-storage/async-storage';

// Safe AsyncStorage wrapper — falls back to in-memory if AsyncStorage unavailable
const AsyncStorageModule = AsyncStorage;

// In-memory fallback for when AsyncStorage is unavailable
const memoryStore: Record<string, string> = {};

const safeGet = async (key: string): Promise<string | null> => {
  try {
    if (AsyncStorageModule) return await AsyncStorageModule.getItem(key);
  } catch {}
  return memoryStore[key] ?? null;
};

const safeSet = async (key: string, value: string): Promise<void> => {
  try {
    if (AsyncStorageModule) {
      await AsyncStorageModule.setItem(key, value);
      return;
    }
  } catch {}
  memoryStore[key] = value;
};

const safeRemove = async (key: string): Promise<void> => {
  try {
    if (AsyncStorageModule) {
      await AsyncStorageModule.removeItem(key);
      return;
    }
  } catch {}
  delete memoryStore[key];
};

const KEYS = {
  ACCESS_TOKEN: 'srv_access_token',
  REFRESH_TOKEN: 'srv_refresh_token',
  USER_PROFILE: 'srv_user_profile',
  USER_ROLE: 'srv_user_role',
  SEEN_NOTIFICATION_IDS: 'srv_seen_notification_ids',
};

export const storage = {
  async setTokens(accessToken: string, refreshToken: string) {
    await Promise.all([
      safeSet(KEYS.ACCESS_TOKEN, accessToken),
      safeSet(KEYS.REFRESH_TOKEN, refreshToken),
    ]);
  },

  async getAccessToken(): Promise<string | null> {
    return safeGet(KEYS.ACCESS_TOKEN);
  },

  async getRefreshToken(): Promise<string | null> {
    return safeGet(KEYS.REFRESH_TOKEN);
  },

  async setUserProfile(profile: object) {
    await safeSet(KEYS.USER_PROFILE, JSON.stringify(profile));
  },

  async getUserProfile<T>(): Promise<T | null> {
    const raw = await safeGet(KEYS.USER_PROFILE);
    return raw ? (JSON.parse(raw) as T) : null;
  },

  async setUserRole(role: string) {
    await safeSet(KEYS.USER_ROLE, role);
  },

  async getUserRole(): Promise<string | null> {
    return safeGet(KEYS.USER_ROLE);
  },

  async clearAll() {
    await Promise.all(Object.values(KEYS).map(safeRemove));
  },

  // ── Notification seen tracking ────────────────────────────────────
  async getSeenNotificationIds(): Promise<Set<string>> {
    const raw = await safeGet(KEYS.SEEN_NOTIFICATION_IDS);
    if (!raw) return new Set();
    try { return new Set(JSON.parse(raw) as string[]); } catch { return new Set(); }
  },

  async markNotificationsAsSeen(ids: string[]): Promise<void> {
    const existing = await this.getSeenNotificationIds();
    ids.forEach(id => existing.add(id));
    await safeSet(KEYS.SEEN_NOTIFICATION_IDS, JSON.stringify([...existing]));
  },
};
