export type ArcanaType = 'Major' | 'Minor';
export type Suit = 'Wands' | 'Cups' | 'Swords' | 'Pentacles';
export type Element = 'Fire' | 'Water' | 'Air' | 'Earth' | 'Spirit' | 'None';
export type Orientation = 'Upright' | 'Reversed';

export type SlotConstraint =
  | 'Any'
  | 'MajorOnly'
  | 'MinorOnly'
  | 'WandsOnly'
  | 'CupsOnly'
  | 'SwordsOnly'
  | 'PentaclesOnly'
  | 'CourtOnly'
  | 'PipOnly';

export type SlotRelationType =
  | 'Crosses'
  | 'FlowsTo'
  | 'Supports'
  | 'Illuminates'
  | 'Opposes'
  | 'Synthesizes'
  | 'Reflects';

export interface SlotEdge {
  source_slot_id: number;
  target_slot_id: number;
  relation: SlotRelationType;
  weight: number;
}

export interface CardFacets {
  general_upright: string[];
  general_reversed: string[];
  love_upright: string;
  love_reversed: string;
  career_upright: string;
  career_reversed: string;
  spiritual_upright: string;
  spiritual_reversed: string;
  shadow_aspect: string;
}

export interface Card {
  id: number;
  key: string;
  arcana: ArcanaType;
  suit?: Suit | null;
  element: Element;
  name_en: string;
  name_zh: string;
  astrology?: string | null;
  hebrew_letter?: string | null;
  facets: CardFacets;
}

export interface SpreadSlot {
  slot_id: number;
  title_en: string;
  title_zh: string;
  meaning_prompt: string;
  x: number;
  y: number;
  rotation_deg: number;
  z_index: number;
  constraint: SlotConstraint;
}

export interface Spread {
  id: string;
  name_en: string;
  name_zh: string;
  description: string;
  category: 'Daily' | 'Decision' | 'Relationship' | 'Comprehensive' | 'Custom';
  slots: SpreadSlot[];
  edges: SlotEdge[];
}

export interface PlacedCard {
  slot_id: number;
  drawn_card: {
    card_id: number;
    orientation: Orientation;
    draw_sequence: number;
  };
}

export type ElementalAffinity =
  | 'FriendlyActive'
  | 'FriendlyPassive'
  | 'Intensified'
  | 'ContradictoryHostile'
  | 'NeutralModifying'
  | 'Undefined';

export type DignityStatus = 'WellDignified' | 'IllDignified' | 'NeutralDignified';

export interface PairwiseDignity {
  source_slot_id: number;
  target_slot_id: number;
  source_card_id: number;
  target_card_id: number;
  relation: SlotRelationType;
  source_element: Element;
  target_element: Element;
  affinity: ElementalAffinity;
  dignity_status: DignityStatus;
  tension_score: number;
  dynamic_summary_zh: string;
}

export interface ElementalDignitySummary {
  fire_ratio: number;
  water_ratio: number;
  air_ratio: number;
  earth_ratio: number;
  major_ratio: number;
  reversed_ratio: number;
  dominant_element: string;
  shadow_card_id?: number | null;
  pairwise_dignities: PairwiseDignity[];
  overall_harmony_score: number;
  balance_description_zh: string;
}

export interface ReadingSession {
  session_id: string;
  created_at: number;
  spread_id: string;
  question?: string | null;
  rng_seed: string;
  reversal_probability: number;
  placed_cards: PlacedCard[];
  dignity_summary: ElementalDignitySummary;
  user_notes?: string | null;
  tags: string[];
  ai_interpretation?: string | null;
}
