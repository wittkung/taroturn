// src/services/zenAudioEngine.ts - WebAudio 432Hz Soundscape & Low-Latency SFX Engine

export class ZenAudioEngine {
  private static instance: ZenAudioEngine;
  private ctx: AudioContext | null = null;

  public static get(): ZenAudioEngine {
    if (!ZenAudioEngine.instance) {
      ZenAudioEngine.instance = new ZenAudioEngine();
    }
    return ZenAudioEngine.instance;
  }

  public async init(): Promise<void> {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      await this.ctx.resume();
    }
  }

  public playSyntheticSFX(type: "flip" | "shuffle" | "bell"): void {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (type === "flip") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
    } else if (type === "bell") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(432, this.ctx.currentTime); // 432Hz Harmonic
      gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.5);
    } else {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(220, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
    }

    osc.connect(gain).connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 1.5);
  }
}
