// src/types/deck.ts - Multi-Deck Type Definitions

export type DeckFamily = "rider_waite_smith" | "crowley_thoth" | "tarot_de_marseille" | "custom";

export interface DeckSystemMeta {
  deckId: string;
  family: DeckFamily;
  displayNameZh: string;
  displayNameEn: string;
  version: string;
  author: string;
  supportsPhysicalReversals: boolean;
}

export const CANONICAL_DECK_SYSTEMS: DeckSystemMeta[] = [
  {
    deckId: "rws_1909",
    family: "rider_waite_smith",
    displayNameZh: "韦特-史密斯 1909 经典牌组",
    displayNameEn: "Rider-Waite-Smith (1909)",
    version: "1.0.0",
    author: "Arthur Edward Waite & Pamela Colman Smith",
    supportsPhysicalReversals: true
  },
  {
    deckId: "crowley_thoth_1944",
    family: "crowley_thoth",
    displayNameZh: "克劳利-托特 1944 经典牌组",
    displayNameEn: "Crowley Thoth Tarot (1944)",
    version: "1.0.0",
    author: "Aleister Crowley & Lady Frieda Harris",
    supportsPhysicalReversals: false
  },
  {
    deckId: "marseille_conver_1760",
    family: "tarot_de_marseille",
    displayNameZh: "马赛 1760 历史经典木刻牌组",
    displayNameEn: "Tarot de Marseille (Nicolas Conver 1760)",
    version: "1.0.0",
    author: "Nicolas Conver",
    supportsPhysicalReversals: false
  }
];
