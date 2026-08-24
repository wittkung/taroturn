// utils/auth_storage.ts - Safe Local Storage for JWT Tokens

interface StoragePayload<T> {
  data: T;
  expireAt: number;
}

export class AuthStorage {
  private static readonly KEY = "taroturn_jwt_session";

  static setToken(token: string, ttlMs: number = 7 * 24 * 3600 * 1000): void {
    const payload: StoragePayload<string> = {
      data: token,
      expireAt: Date.now() + ttlMs
    };
    try {
      wx.setStorageSync(this.KEY, payload);
    } catch (e) {
      console.error("[AuthStorage] Failed to save token:", e);
    }
  }

  static getToken(): string | null {
    try {
      const payload = wx.getStorageSync(this.KEY) as StoragePayload<string> | undefined;
      if (!payload || Date.now() > payload.expireAt) {
        this.clear();
        return null;
      }
      return payload.data;
    } catch {
      return null;
    }
  }

  static clear(): void {
    try {
      wx.removeStorageSync(this.KEY);
    } catch (e) {
      console.error("[AuthStorage] Failed to clear token:", e);
    }
  }
}
