// utils/sound_manager.ts - Low-Latency Audio Pool & Haptic Feedback

export class HapticFeedback {
  private static lastVibrateTime = 0;

  static trigger(type: "heavy" | "medium" | "light" = "medium", throttleMs = 40): void {
    const now = Date.now();
    if (now - this.lastVibrateTime < throttleMs) return;
    this.lastVibrateTime = now;

    wx.vibrateShort({
      type: type,
      fail: () => {
        // Fallback for older devices
        wx.vibrateShort({ type: "medium" });
      }
    });
  }
}

export class SoundManager {
  private static pool: Map<string, WechatMiniprogram.InnerAudioContext> = new Map();
  public static isMuted = false;

  static preload(soundKey: string, url: string): void {
    if (this.pool.has(soundKey)) return;
    try {
      const ctx = wx.createInnerAudioContext({ useWebAudioImplement: true });
      ctx.src = encodeURI(url);
      ctx.onError((res) => console.error(`[SoundError] ${soundKey}:`, res));
      this.pool.set(soundKey, ctx);
    } catch (e) {
      console.warn(`[SoundManager] Failed to preload sound ${soundKey}:`, e);
    }
  }

  static play(soundKey: string): void {
    if (this.isMuted) return;
    const ctx = this.pool.get(soundKey);
    if (ctx) {
      ctx.stop();
      ctx.seek(0);
      ctx.play();
    }
  }

  static releaseAll(): void {
    this.pool.forEach((ctx) => ctx.destroy());
    this.pool.clear();
  }
}
