// apps/taroturn-miniprogram/core/card_deck.ts - SSOT Canonical Card Deck & CSP Logic

export interface Card {
  id: number;
  nameZh: string;
  nameEn: string;
  arcana: "Major" | "Minor";
  suit?: "Wands" | "Cups" | "Swords" | "Pentacles";
  number: number;
  element: "Fire" | "Water" | "Air" | "Earth";
  astrologicalDecan?: string;
  kabbalisticSephirah?: string;
  facets: {
    generalUpright: string[];
    generalReversed: string[];
    loveUpright: string;
    loveReversed: string;
    careerUpright: string;
    careerReversed: string;
    shadowAspect: string;
  };
}

export interface SpreadSlot {
  slotId: number;
  titleZh: string;
  titleEn: string;
  meaningPrompt: string;
  x: number;
  y: number;
  constraint?: "MajorOnly" | "MinorOnly" | "CourtOnly" | "PipOnly";
}

export interface SlotEdge {
  sourceSlotId: number;
  targetSlotId: number;
  relation: "Crosses" | "FlowsTo" | "Supports" | "Opposes" | "Illuminates" | "Synthesizes" | "Reflects";
  weight: number;
}

export interface Spread {
  id: string;
  nameZh: string;
  nameEn: string;
  descriptionZh: string;
  slots: SpreadSlot[];
  edges: SlotEdge[];
}

export interface PlacedCard {
  drawnCard: {
    cardId: number;
    orientation: "Upright" | "Reversed";
  };
  slot: SpreadSlot;
}

export interface PairwiseDignity {
  sourceSlotId: number;
  targetSlotId: number;
  relation: string;
  dignityStatus: "WellDignified" | "IllDignified" | "NeutralDignified";
  tensionScore: number;
  dynamicSummaryZh: string;
}

export interface ReadingSession {
  sessionId: string;
  spreadId: string;
  question?: string;
  rngSeed: string;
  placedCards: PlacedCard[];
  dignitySummary: {
    dominantElement: string;
    elementalRatios: { fire: number; water: number; air: number; earth: number };
    pairwiseDignities: PairwiseDignity[];
    overallHarmonyScore: number;
    balanceDescriptionZh: string;
    shadowCardId?: number;
  };
  createdAt: number;
}

// 7 种标准牌阵定义
export const CANONICAL_SPREADS: Spread[] = [
  {
    id: "daily_single",
    nameZh: "单张每日指引",
    nameEn: "Daily Single Oracle",
    descriptionZh: "每日早晨聚焦当下一瞬的灵性觉知，提炼核心主题与微观行动指引。",
    slots: [
      {
        slotId: 1,
        titleZh: "核心启示",
        titleEn: "Core Guidance",
        meaningPrompt: "当下意识的核心能量与行动指向",
        x: 0,
        y: 0
      }
    ],
    edges: []
  },
  {
    id: "three_cards_time",
    nameZh: "三态时间流",
    nameEn: "Three Cards Time Flow",
    descriptionZh: "回溯因果之河：过去种下的因、当下涌动的势、未来显化的果。",
    slots: [
      {
        slotId: 1,
        titleZh: "过去溯源",
        titleEn: "Past Root",
        meaningPrompt: "已沉淀的既往经验与潜伏因缘",
        x: -1,
        y: 0
      },
      {
        slotId: 2,
        titleZh: "当下显象",
        titleEn: "Present Focus",
        meaningPrompt: "正在发生的关键焦点与心念状态",
        x: 0,
        y: 0
      },
      {
        slotId: 3,
        titleZh: "未来趋向",
        titleEn: "Future Trajectory",
        meaningPrompt: "若循当前能量将必然演化的趋势",
        x: 1,
        y: 0
      }
    ],
    edges: [
      { sourceSlotId: 1, targetSlotId: 2, relation: "FlowsTo", weight: 1.0 },
      { sourceSlotId: 2, targetSlotId: 3, relation: "FlowsTo", weight: 1.0 }
    ]
  },
  {
    id: "celtic_cross",
    nameZh: "凯尔特大十字",
    nameEn: "Celtic Cross",
    descriptionZh: "西方神秘学经典十张牌阵，全景透析事件根源、显隐阻碍、心理投射与终局演化。",
    slots: [
      { slotId: 1, titleZh: "现状核心", titleEn: "Present Core", meaningPrompt: "当下处境与核心议题", x: 0, y: 0 },
      { slotId: 2, titleZh: "交叉阻碍", titleEn: "Crossing Obstacle", meaningPrompt: "横阻挑战或助力动态", x: 0, y: 0 },
      { slotId: 3, titleZh: "潜意识根基", titleEn: "Subconscious Root", meaningPrompt: "深层心理动机与渊源", x: 0, y: 1 },
      { slotId: 4, titleZh: "过去影响", titleEn: "Past Influence", meaningPrompt: "刚刚逝去但余波尚存的事件", x: -1, y: 0 },
      { slotId: 5, titleZh: "显意识期望", titleEn: "Conscious Goal", meaningPrompt: "理想目标与最佳可能", x: 0, y: -1 },
      { slotId: 6, titleZh: "近期未来", titleEn: "Near Future", meaningPrompt: "数周内即将迎来的变化", x: 1, y: 0 },
      { slotId: 7, titleZh: "自我心态", titleEn: "Self Stance", meaningPrompt: "内在态度与自我评估", x: 2, y: 1.5 },
      { slotId: 8, titleZh: "外部环境", titleEn: "Environment", meaningPrompt: "周围人事物与环境投射", x: 2, y: 0.5 },
      { slotId: 9, titleZh: "希望与忧虑", titleEn: "Hopes & Fears", meaningPrompt: "内心最隐秘的渴望与担忧", x: 2, y: -0.5 },
      { slotId: 10, titleZh: "最终结果", titleEn: "Ultimate Outcome", meaningPrompt: "长期演进的终局启示", x: 2, y: -1.5 }
    ],
    edges: [
      { sourceSlotId: 2, targetSlotId: 1, relation: "Crosses", weight: 1.2 },
      { sourceSlotId: 3, targetSlotId: 1, relation: "Supports", weight: 1.0 },
      { sourceSlotId: 4, targetSlotId: 1, relation: "FlowsTo", weight: 0.9 },
      { sourceSlotId: 5, targetSlotId: 1, relation: "Illuminates", weight: 0.9 },
      { sourceSlotId: 1, targetSlotId: 6, relation: "FlowsTo", weight: 1.0 },
      { sourceSlotId: 7, targetSlotId: 8, relation: "Reflects", weight: 0.8 },
      { sourceSlotId: 9, targetSlotId: 10, relation: "Supports", weight: 1.0 },
      { sourceSlotId: 6, targetSlotId: 10, relation: "FlowsTo", weight: 1.1 }
    ]
  }
];

export class MiniProgramTarotCore {
  static generateRandomSeed(): string {
    const bytes = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
    return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  static getSpreadById(id: string): Spread | undefined {
    return CANONICAL_SPREADS.find((s) => s.id === id);
  }
}
