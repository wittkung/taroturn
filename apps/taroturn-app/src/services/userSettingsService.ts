// src/services/userSettingsService.ts - User Settings & AI Node Health Service

import { UserSettings, SeekerProfile, AiPersona, AiProviderMode } from '../types/settings';
import { calculateSeekerProfile } from './tarotCalculators';

const SETTINGS_STORAGE_KEY = 'taroturn_user_settings_v1';

export const DEFAULT_PROFILE: SeekerProfile = {
  id: 'default-seeker',
  name: '我自己',
  nickname: '漫游探求者',
  title: '自性化求问者',
  birthdate: '1998-08-08',
  lifePathNumber: 7,
  soulCardId: 9, // The Hermit
  personalityCardId: 9,
  dominantZodiac: '狮子座 (Leo)',
  dominantElement: 'Fire',
  personalMotto: '高举真理明灯，在内省中照亮自己与他人的夜路。',
  createdAt: '2026-08-25T00:00:00.000Z',
  updatedAt: '2026-08-25T00:00:00.000Z',
};

export const DEFAULT_SETTINGS: UserSettings = {
  activeProfileId: 'default-seeker',
  profiles: [DEFAULT_PROFILE],
  profile: DEFAULT_PROFILE,
  ai: {
    providerMode: 'ttagy_local',
    persona: 'jungian',
    showThinking: true,
    enableLongitudinalRag: true,
    ttagy: {
      localEndpoint: 'http://127.0.0.1:8970',
      remoteEndpoint: 'http://[240e:3b7:30b0:1234::1]:8970',
      authToken: '',
      model: 'gemini-3.7-flash',
      effort: 'low',
      timeoutSecs: 40,
    },
    byok: {
      geminiApiKey: '',
      geminiModel: 'gemini-2.5-flash',
      geminiEndpoint: 'https://generativelanguage.googleapis.com/v1beta',
      openaiApiKey: '',
      openaiBaseUrl: 'https://api.deepseek.com/v1',
      openaiModel: 'deepseek-chat',
    },
  },
  ritual: {
    reversalProbability: 0.3,
    shuffleMode: 'quick',
    deckTheme: 'rws_1909',
    autoRevealDelayMs: 200,
  },
  audio: {
    masterVolume: 80,
    soundEffectsEnabled: true,
    singingBowlEnabled: true,
    hapticsEnabled: true,
  },
  theme: 'dark',
  isPro: true,
};

export class UserSettingsService {
  private static listeners: Array<(settings: UserSettings) => void> = [];

  public static getSettings(): UserSettings {
    try {
      const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (!raw) {
        // Initialize default with calculated profile
        const initial = { ...DEFAULT_SETTINGS };
        const calc = calculateSeekerProfile(initial.profile.birthdate);
        const calculatedProfile: SeekerProfile = {
          ...DEFAULT_PROFILE,
          lifePathNumber: calc.lifePathNumber,
          soulCardId: calc.soulCardId,
          personalityCardId: calc.personalityCardId,
          dominantZodiac: calc.dominantZodiac,
          dominantElement: calc.dominantElement,
          personalMotto: calc.soulMotto,
        };
        initial.profiles = [calculatedProfile];
        initial.profile = calculatedProfile;
        initial.activeProfileId = calculatedProfile.id;
        this.saveSettings(initial);
        return initial;
      }
      const parsed = JSON.parse(raw) as Partial<UserSettings> & { profile?: Partial<SeekerProfile> };
      
      // Auto-migration & normalization for multi-profile support
      let profiles: SeekerProfile[] = [];
      if (Array.isArray(parsed.profiles) && parsed.profiles.length > 0) {
        profiles = parsed.profiles.map((p, idx) => {
          const birthdate = p.birthdate || '1998-08-08';
          const calc = calculateSeekerProfile(birthdate);
          return {
            id: p.id || `profile_${Date.now()}_${idx}`,
            name: p.name || p.nickname || (idx === 0 ? '我自己' : `求问者 ${idx + 1}`),
            nickname: p.nickname || p.name || '漫游探求者',
            title: p.title || '自性化求问者',
            birthdate,
            lifePathNumber: p.lifePathNumber ?? calc.lifePathNumber,
            soulCardId: p.soulCardId ?? calc.soulCardId,
            personalityCardId: p.personalityCardId ?? calc.personalityCardId,
            dominantZodiac: p.dominantZodiac || calc.dominantZodiac,
            dominantElement: p.dominantElement || calc.dominantElement,
            personalMotto: p.personalMotto || calc.soulMotto,
            createdAt: p.createdAt || new Date().toISOString(),
            updatedAt: p.updatedAt || new Date().toISOString(),
          };
        });
      } else if (parsed.profile) {
        // Upgrade legacy single profile
        const legacy = parsed.profile;
        const birthdate = legacy.birthdate || '1998-08-08';
        const calc = calculateSeekerProfile(birthdate);
        const migratedProfile: SeekerProfile = {
          id: legacy.id || 'default-seeker',
          name: legacy.name || legacy.nickname || '我自己',
          nickname: legacy.nickname || '漫游探求者',
          title: legacy.title || '自性化求问者',
          birthdate,
          lifePathNumber: legacy.lifePathNumber ?? calc.lifePathNumber,
          soulCardId: legacy.soulCardId ?? calc.soulCardId,
          personalityCardId: legacy.personalityCardId ?? calc.personalityCardId,
          dominantZodiac: legacy.dominantZodiac || calc.dominantZodiac,
          dominantElement: legacy.dominantElement || calc.dominantElement,
          personalMotto: legacy.personalMotto || calc.soulMotto,
          createdAt: legacy.createdAt || new Date().toISOString(),
          updatedAt: legacy.updatedAt || new Date().toISOString(),
        };
        profiles = [migratedProfile];
      } else {
        profiles = [{ ...DEFAULT_PROFILE }];
      }

      let activeProfileId = parsed.activeProfileId || profiles[0].id;
      let activeProfile = profiles.find((p) => p.id === activeProfileId);
      if (!activeProfile) {
        activeProfile = profiles[0];
        activeProfileId = activeProfile.id;
      }

      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        profiles,
        activeProfileId,
        profile: { ...activeProfile },
        ai: {
          ...DEFAULT_SETTINGS.ai,
          ...(parsed.ai || {}),
          ttagy: { ...DEFAULT_SETTINGS.ai.ttagy, ...(parsed.ai?.ttagy || {}) },
          byok: { ...DEFAULT_SETTINGS.ai.byok, ...(parsed.ai?.byok || {}) },
        },
        ritual: { ...DEFAULT_SETTINGS.ritual, ...(parsed.ritual || {}) },
        audio: { ...DEFAULT_SETTINGS.audio, ...(parsed.audio || {}) },
      };
    } catch (err) {
      console.warn('Failed to parse user settings, reverting to default:', err);
      return DEFAULT_SETTINGS;
    }
  }

  public static saveSettings(settings: UserSettings): void {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
      this.notifyListeners(settings);
    } catch (err) {
      console.error('Failed to save user settings:', err);
    }
  }

  /**
   * 切换当前激活的求问者档案
   */
  public static setActiveProfile(profileId: string): SeekerProfile | null {
    const current = this.getSettings();
    const target = current.profiles.find((p) => p.id === profileId);
    if (!target) return null;

    const updated: UserSettings = {
      ...current,
      activeProfileId: target.id,
      profile: { ...target },
    };
    this.saveSettings(updated);
    return target;
  }

  /**
   * 创建新的求问者档案
   */
  public static createProfile(data: {
    name: string;
    nickname?: string;
    title?: string;
    birthdate: string;
  }): SeekerProfile {
    const current = this.getSettings();
    const cleanBirthdate = data.birthdate.trim() || '1998-08-08';
    const calc = calculateSeekerProfile(cleanBirthdate);
    const newId = `profile_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();

    const newProfile: SeekerProfile = {
      id: newId,
      name: data.name.trim() || `求问者 ${current.profiles.length + 1}`,
      nickname: data.nickname?.trim() || data.name.trim() || '探求者',
      title: data.title?.trim() || '自性化求问者',
      birthdate: cleanBirthdate,
      lifePathNumber: calc.lifePathNumber,
      soulCardId: calc.soulCardId,
      personalityCardId: calc.personalityCardId,
      dominantZodiac: calc.dominantZodiac,
      dominantElement: calc.dominantElement,
      personalMotto: calc.soulMotto,
      createdAt: now,
      updatedAt: now,
    };

    const nextProfiles = [...current.profiles, newProfile];
    const updated: UserSettings = {
      ...current,
      profiles: nextProfiles,
      activeProfileId: newProfile.id,
      profile: { ...newProfile },
    };
    this.saveSettings(updated);
    return newProfile;
  }

  /**
   * 更新指定求问者档案信息
   */
  public static updateProfile(id: string, updates: Partial<SeekerProfile>): SeekerProfile | null {
    const current = this.getSettings();
    const idx = current.profiles.findIndex((p) => p.id === id);
    if (idx === -1) return null;

    const existing = current.profiles[idx];
    const newBirthdate = updates.birthdate ?? existing.birthdate;
    const calc = updates.birthdate ? calculateSeekerProfile(newBirthdate) : null;

    const updatedProfile: SeekerProfile = {
      ...existing,
      ...updates,
      id: existing.id, // Immutable ID
      birthdate: newBirthdate,
      lifePathNumber: calc ? calc.lifePathNumber : existing.lifePathNumber,
      soulCardId: calc ? calc.soulCardId : existing.soulCardId,
      personalityCardId: calc ? calc.personalityCardId : existing.personalityCardId,
      dominantZodiac: calc ? calc.dominantZodiac : existing.dominantZodiac,
      dominantElement: calc ? calc.dominantElement : existing.dominantElement,
      personalMotto: calc ? calc.soulMotto : existing.personalMotto,
      updatedAt: new Date().toISOString(),
    };

    const nextProfiles = [...current.profiles];
    nextProfiles[idx] = updatedProfile;

    const updatedSettings: UserSettings = {
      ...current,
      profiles: nextProfiles,
      profile: current.activeProfileId === id ? { ...updatedProfile } : current.profile,
    };
    this.saveSettings(updatedSettings);
    return updatedProfile;
  }

  /**
   * 删除指定求问者档案（最后一人受底线保护禁止删除）
   */
  public static deleteProfile(id: string): boolean {
    const current = this.getSettings();
    if (current.profiles.length <= 1) {
      // 禁止删除唯一档案
      return false;
    }

    const nextProfiles = current.profiles.filter((p) => p.id !== id);
    if (nextProfiles.length === current.profiles.length) {
      return false; // 找不到对应档案
    }

    let nextActiveId = current.activeProfileId;
    if (current.activeProfileId === id) {
      // 自动回退至第一个档案
      nextActiveId = nextProfiles[0].id;
    }
    const nextActiveProfile = nextProfiles.find((p) => p.id === nextActiveId) || nextProfiles[0];

    const updated: UserSettings = {
      ...current,
      profiles: nextProfiles,
      activeProfileId: nextActiveProfile.id,
      profile: { ...nextActiveProfile },
    };
    this.saveSettings(updated);
    return true;
  }

  public static updateProfileBirthdate(birthdate: string): SeekerProfile {
    const current = this.getSettings();
    const updated = this.updateProfile(current.activeProfileId, { birthdate });
    return updated || current.profile;
  }

  public static setAiPersona(persona: AiPersona): void {
    const current = this.getSettings();
    this.saveSettings({
      ...current,
      ai: {
        ...current.ai,
        persona,
      },
    });
  }

  public static setAiProviderMode(mode: AiProviderMode): void {
    const current = this.getSettings();
    this.saveSettings({
      ...current,
      ai: {
        ...current.ai,
        providerMode: mode,
      },
    });
  }

  public static subscribe(listener: (settings: UserSettings) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private static notifyListeners(settings: UserSettings): void {
    for (const listener of this.listeners) {
      try {
        listener(settings);
      } catch (err) {
        console.error('Error in settings listener:', err);
      }
    }
  }

  /**
   * 测通与诊断 TTAgy 守护服务节点（支持 Localhost / IPv6 / Tailscale / 域名）
   */
  public static async pingTtagyNode(
    endpoint: string,
    authToken?: string
  ): Promise<{
    success: boolean;
    latencyMs: number;
    message: string;
    details?: string;
  }> {
    const startTime = performance.now();
    const cleanEndpoint = endpoint.trim().replace(/\/+$/, '');

    // 探测候选路径
    const testUrls = [`${cleanEndpoint}/api/v1/health`, `${cleanEndpoint}/health`, cleanEndpoint];

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (authToken && authToken.trim()) {
      headers['Authorization'] = `Bearer ${authToken.trim()}`;
    }

    for (const url of testUrls) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const res = await fetch(url, {
          method: 'GET',
          headers,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        const latencyMs = Math.round(performance.now() - startTime);

        if (res.ok) {
          return {
            success: true,
            latencyMs,
            message: `连接成功 (RTT: ${latencyMs}ms)`,
            details: `节点状态：在线 (${res.status} OK)`,
          };
        } else if (res.status === 401 || res.status === 403) {
          return {
            success: false,
            latencyMs,
            message: '鉴权未通过 (401/403 Unauthorized)',
            details: '请检查是否已填入正确的安全令牌 (Auth Token)。',
          };
        }
      } catch (err: any) {
        // Continue to fallback candidate
      }
    }

    const totalLatency = Math.round(performance.now() - startTime);
    return {
      success: false,
      latencyMs: totalLatency,
      message: '节点未能接通',
      details:
        '请确认电脑端已启动 TTAgy 守护进程 (监听端口 8970)，且防火墙已放行对应 IPv6/局域网端口。',
    };
  }

  /**
   * 导出全部数据为 JSON 档案
   */
  public static exportFullBackupJson(): string {
    const settings = this.getSettings();
    const rawJournal = localStorage.getItem('taroturn_reading_journal') || '[]';
    const journal = JSON.parse(rawJournal);

    const payload = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      profile: settings.profile,
      settings,
      journal,
    };

    return JSON.stringify(payload, null, 2);
  }

  /**
   * 导入 JSON 备份档案
   */
  public static importBackupJson(jsonStr: string): boolean {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.settings) {
        this.saveSettings(parsed.settings);
      }
      if (parsed.journal && Array.isArray(parsed.journal)) {
        localStorage.setItem('taroturn_reading_journal', JSON.stringify(parsed.journal));
      }
      return true;
    } catch (err) {
      console.error('Failed to import backup JSON:', err);
      return false;
    }
  }
}
