// src/types/settings.ts - User Settings & AI Sanctuary Gateway Configuration

export type AiPersona = 'jungian' | 'hermetic' | 'socratic' | 'pragmatic';

export interface AiPersonaMeta {
  id: AiPersona;
  nameZh: string;
  nameEn: string;
  taglineZh: string;
  descriptionZh: string;
  focusZh: string;
  badgeColor: string;
  iconName: string;
}

export const CANONICAL_AI_PERSONAS: AiPersonaMeta[] = [
  {
    id: 'jungian',
    nameZh: '荣格深度心理学派',
    nameEn: 'Jungian Depth Psychology',
    taglineZh: '潜意识阴影整合 · 自性化原型 · 共时性觉察',
    descriptionZh:
      '将塔罗视为潜意识心智投射的镜子。聚焦于求问者的内在矛盾、压抑的原型阴影与自性化（Individuation）成长路径，温和而直指本质。',
    focusZh: '最适于：个人心智内耗、情感与关系卡点、深层自我探索与破局',
    badgeColor: 'purple',
    iconName: 'Sparkles',
  },
  {
    id: 'hermetic',
    nameZh: '黄金黎明秘传学派',
    nameEn: 'Hermetic Order of the Golden Dawn',
    taglineZh: '卡巴拉生命之树 · 36 占星旬度 · 四要素炼金克合',
    descriptionZh:
      '严格依据古典西方秘传符号学、卡巴拉（Qabalah）22 条路径与 36 黄道旬度（Decans），对牌阵的几何关系与要素克合进行严密推演。',
    focusZh: '最适于：传统塔罗研习者、学术与符号爱好者、宇宙法则与时机洞察',
    badgeColor: 'amber',
    iconName: 'BookOpen',
  },
  {
    id: 'socratic',
    nameZh: '苏格拉底启发觉察派',
    nameEn: 'Socratic Mindfulness & Inquiry',
    taglineZh: '拒绝主观武断 · 启发式反诘 · 唤醒内在明澈',
    descriptionZh:
      '不做绝对论断，不给廉价预言。通过层层递进的苏格拉底式发问与认知澄清，引导求问者在反思中自己找到属于自己的真实答案。',
    focusZh: '最适于：重大抉择前的心态清空、消除盲从、培养自主认知决断力',
    badgeColor: 'emerald',
    iconName: 'HelpCircle',
  },
  {
    id: 'pragmatic',
    nameZh: '现实决策与战略行动派',
    nameEn: 'Pragmatic Strategic & Actionable',
    taglineZh: '直击现实阻抗 · SWOT 动态研判 · 落地行动清单',
    descriptionZh:
      '摒弃空洞玄学套话，将牌面符号转化为现实世界的资源、阻碍、时机与风控策略。输出清晰、分步骤、可落地的实操纲领。',
    focusZh: '最适于：职场晋升抉择、商业投资判断、项目推进瓶颈与现实行动规划',
    badgeColor: 'blue',
    iconName: 'Target',
  },
];

export type AiProviderMode =
  | 'ttagy_local'
  | 'ttagy_remote'
  | 'byok_gemini'
  | 'byok_openai'
  | 'official_cloud';

export interface TtagyConfig {
  nodeId?: string;
  beaconUrl?: string;
  remoteHost?: string;
  remotePort?: number;
  localEndpoint: string;
  remoteEndpoint: string;
  authToken: string;
  model: string;
  effort: 'low' | 'medium' | 'high';
  timeoutSecs: number;
}

export interface ByokConfig {
  geminiApiKey: string;
  geminiModel: string;
  geminiEndpoint: string;
  openaiApiKey: string;
  openaiBaseUrl: string;
  openaiModel: string;
}

export interface AiSanctuarySettings {
  providerMode: AiProviderMode;
  persona: AiPersona;
  showThinking: boolean;
  enableLongitudinalRag: boolean;
  ttagy: TtagyConfig;
  byok: ByokConfig;
}

export interface SeekerProfile {
  id: string; // 唯一 UUID 或固定 ID
  name: string; // 档案自定义名称 / 姓名 (如 "我自己", "林澈", "合伙人")
  nickname: string; // 昵称
  title: string; // 称号
  birthdate: string; // YYYY-MM-DD
  lifePathNumber: number;
  soulCardId: number; // 0-21 Major Arcana Card ID
  personalityCardId: number;
  dominantZodiac: string;
  dominantElement: 'Fire' | 'Water' | 'Air' | 'Earth';
  personalMotto: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RitualSettings {
  reversalProbability: number; // 0.0, 0.3, 0.5
  shuffleMode: 'quick' | 'drag' | 'breath';
  deckTheme: 'rws_1909' | 'midnight_violet' | 'kintsugi_gold';
  autoRevealDelayMs: number;
}

export interface ZenAudioSettings {
  masterVolume: number; // 0-100
  soundEffectsEnabled: boolean;
  singingBowlEnabled: boolean;
  hapticsEnabled: boolean;
}

export interface UserSettings {
  profile: SeekerProfile; // 活跃求问者镜像（保证向下兼容）
  profiles: SeekerProfile[]; // 全部保存的求问者档案列表
  activeProfileId: string; // 当前激活求问者档案 ID
  ai: AiSanctuarySettings;
  ritual: RitualSettings;
  audio: ZenAudioSettings;
  theme: 'dark' | 'light' | 'system';
  isPro: boolean;
}
