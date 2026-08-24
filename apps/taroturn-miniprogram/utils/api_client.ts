// utils/api_client.ts - Production WeChat HttpClient with 401 Auto-Retry

import { AuthStorage } from "./auth_storage";

export class TaroturnApiClient {
  private static isRefreshing = false;
  private static retryQueue: Array<(token: string) => void> = [];
  public static baseUrl = "https://api.taroturn.com";

  static async request<T>(options: WechatMiniprogram.RequestOption): Promise<T> {
    const token = AuthStorage.getToken();
    const url = options.url.startsWith("http") ? options.url : `${this.baseUrl}${options.url}`;
    const headers = {
      ...(options.header || {}),
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };

    return new Promise((resolve, reject) => {
      wx.request({
        ...options,
        url,
        header: headers,
        success: async (res) => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(res.data as T);
          } else if (res.statusCode === 401) {
            // Token expired or invalid, enter silent refresh
            this.handle401Retry(options, resolve, reject);
          } else {
            reject(res);
          }
        },
        fail: reject
      });
    });
  }

  private static async handle401Retry(
    options: WechatMiniprogram.RequestOption,
    resolve: (value: any) => void,
    reject: (reason: any) => void
  ): Promise<void> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      try {
        const newToken = await this.performWechatLogin();
        AuthStorage.setToken(newToken);
        this.retryQueue.forEach((cb) => cb(newToken));
        this.retryQueue = [];

        // Retry current request with new token
        const retryRes = await this.request(options);
        resolve(retryRes);
      } catch (err) {
        AuthStorage.clear();
        reject(err);
      } finally {
        this.isRefreshing = false;
      }
    } else {
      this.retryQueue.push((newToken) => {
        options.header = { ...options.header, Authorization: `Bearer ${newToken}` };
        this.request(options).then(resolve).catch(reject);
      });
    }
  }

  private static async performWechatLogin(): Promise<string> {
    return new Promise((resolve, reject) => {
      wx.login({
        timeout: 5000,
        success: (res) => {
          if (!res.code) {
            return reject(new Error("wx.login failed: No code returned"));
          }
          wx.request({
            url: `${this.baseUrl}/api/v1/auth/wechat`,
            method: "POST",
            data: { code: res.code },
            success: (authRes: any) => {
              if (authRes.statusCode === 200 && authRes.data.token) {
                resolve(authRes.data.token);
              } else {
                reject(authRes);
              }
            },
            fail: reject
          });
        },
        fail: reject
      });
    });
  }
}
