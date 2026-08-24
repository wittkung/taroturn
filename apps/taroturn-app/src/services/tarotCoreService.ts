import canonicalCatalog from '../data/canonicalCatalog.json';
import { CHINESE_CARD_FACETS } from '../data/chineseCardFacets';
import {
  Card,
  DignityStatus,
  Element,
  ElementalAffinity,
  ElementalDignitySummary,
  Orientation,
  PairwiseDignity,
  PlacedCard,
  ReadingSession,
  Spread,
} from '../types/tarot';

const RAW_CARDS: Card[] = canonicalCatalog.cards as unknown as Card[];
const ALL_SPREADS: Spread[] = canonicalCatalog.spreads as unknown as Spread[];

// Enrich all cards with profound Chinese facets
const ALL_CARDS: Card[] = RAW_CARDS.map((card) => {
  const zhFacet = CHINESE_CARD_FACETS[card.id];
  if (zhFacet) {
    return {
      ...card,
      name_zh: zhFacet.name_zh,
      astrology: zhFacet.astrology,
      hebrew_letter: zhFacet.hebrew_letter,
      facets: {
        ...card.facets,
        general_upright: zhFacet.general_upright,
        general_reversed: zhFacet.general_reversed,
        love_upright: zhFacet.love_upright,
        love_reversed: zhFacet.love_reversed,
        career_upright: zhFacet.career_upright,
        career_reversed: zhFacet.career_reversed,
        spiritual_upright: zhFacet.spiritual_upright,
        spiritual_reversed: zhFacet.spiritual_reversed,
        shadow_aspect: zhFacet.shadow_aspect,
      },
    };
  }

  // Generate profound Chinese facets for Minor Arcana if not explicitly customized
  const suitName = card.suit === 'Wands' ? '权杖' : card.suit === 'Cups' ? '圣杯' : card.suit === 'Swords' ? '宝剑' : '星币';
  const elementName = card.element === 'Fire' ? '火元素' : card.element === 'Water' ? '水元素' : card.element === 'Air' ? '风元素' : '土元素';

  return {
    ...card,
    facets: {
      ...card.facets,
      general_upright: [
        `${suitName}正向势能`,
        `${elementName}开创`,
        '动态平衡',
        '顺势而为',
      ],
      general_reversed: [
        `${suitName}受阻阻滞`,
        '内在能量反噬',
        '急躁冒进',
        '需要内省调和',
      ],
      love_upright: `在${suitName}能量指引下，关系处于积极进取与彼此滋养的状态，真诚互动。`,
      love_reversed: `情感中出现沟通盲区或节奏脱节，需放下戒备坦诚相待以化解隔阂。`,
      career_upright: `事业推进势头良好，充分发挥${elementName}特质，适宜把握关键合作契机。`,
      career_reversed: `面临阶段性瓶颈或资源分配矛盾，切忌盲动冲动，宜夯实基础细节。`,
      spiritual_upright: `在日常现实中体悟自性，将意志与行动融为一体，获得笃定宁静。`,
      spiritual_reversed: `内在焦虑感上升，需通过静心冥想理清真实诉求与纷乱杂念。`,
      shadow_aspect: `因对结果过度执着而忽视当下过程，将内在恐慌投射到外界环境中。`,
    },
  };
});

class SimpleChaCha20LikeRng {
  private state: Uint32Array;

  constructor(seedBytes: Uint8Array) {
    this.state = new Uint32Array(16);
    for (let i = 0; i < 8; i++) {
      this.state[i] =
        seedBytes[i * 4] |
        (seedBytes[i * 4 + 1] << 8) |
        (seedBytes[i * 4 + 2] << 16) |
        (seedBytes[i * 4 + 3] << 24);
    }
  }

  nextFloat(): number {
    let x = this.state[0];
    x ^= x << 13;
    x ^= x >> 17;
    x ^= x << 5;
    this.state[0] = x;
    return (x >>> 0) / 4294967296;
  }
}

export class TarotCoreService {
  private static instance: TarotCoreService;

  private constructor() {}

  public static getInstance(): TarotCoreService {
    if (!TarotCoreService.instance) {
      TarotCoreService.instance = new TarotCoreService();
    }
    return TarotCoreService.instance;
  }

  public getCardById(id: number): Card | undefined {
    return ALL_CARDS.find((c) => c.id === id);
  }

  public listAllCards(): Card[] {
    return ALL_CARDS;
  }

  public listCanonicalSpreads(): Spread[] {
    return ALL_SPREADS;
  }

  public getSpreadById(id: string): Spread | undefined {
    return ALL_SPREADS.find((s) => s.id === id);
  }

  public generateRandomSeed(): string {
    const arr = new Uint8Array(32);
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(arr);
    } else {
      for (let i = 0; i < 32; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
    }
    return Array.from(arr)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  private parseSeed(seedHex: string): Uint8Array {
    const clean = seedHex.trim();
    if (clean.length !== 64) {
      throw new Error(`Seed must be exactly 64 hex characters (got ${clean.length})`);
    }
    const bytes = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
      bytes[i] = parseInt(clean.substring(i * 2, i * 2 + 2), 16);
    }
    return bytes;
  }

  private calculateAffinity(elemA: Element, elemB: Element): [ElementalAffinity, number] {
    if ((elemA === 'Fire' && elemB === 'Air') || (elemA === 'Air' && elemB === 'Fire')) {
      return ['FriendlyActive', 0.9];
    }
    if ((elemA === 'Water' && elemB === 'Earth') || (elemA === 'Earth' && elemB === 'Water')) {
      return ['FriendlyPassive', 0.9];
    }
    if (elemA === elemB && elemA !== 'None' && elemA !== 'Spirit') {
      return ['Intensified', 0.6];
    }
    if (
      (elemA === 'Fire' && elemB === 'Water') ||
      (elemA === 'Water' && elemB === 'Fire') ||
      (elemA === 'Air' && elemB === 'Earth') ||
      (elemA === 'Earth' && elemB === 'Air')
    ) {
      return ['ContradictoryHostile', -0.9];
    }
    if (
      (elemA === 'Fire' && elemB === 'Earth') ||
      (elemA === 'Earth' && elemB === 'Fire') ||
      (elemA === 'Water' && elemB === 'Air') ||
      (elemA === 'Air' && elemB === 'Water')
    ) {
      return ['NeutralModifying', 0.2];
    }
    return ['Undefined', 0.0];
  }

  public evaluateSpreadSession(
    spread: Spread,
    placedCards: PlacedCard[]
  ): ElementalDignitySummary {
    const total = placedCards.length;
    let fireCount = 0;
    let waterCount = 0;
    let airCount = 0;
    let earthCount = 0;
    let majorCount = 0;
    let reversedCount = 0;
    let totalCardSum = 0;

    for (const placed of placedCards) {
      const card = this.getCardById(placed.drawn_card.card_id);
      if (card) {
        if (card.element === 'Fire') fireCount++;
        if (card.element === 'Water') waterCount++;
        if (card.element === 'Air') airCount++;
        if (card.element === 'Earth') earthCount++;
        if (card.arcana === 'Major') {
          majorCount++;
          totalCardSum += card.id;
        }
      }
      if (placed.drawn_card.orientation === 'Reversed') {
        reversedCount++;
      }
    }

    const fireRatio = total > 0 ? fireCount / total : 0;
    const waterRatio = total > 0 ? waterCount / total : 0;
    const airRatio = total > 0 ? airCount / total : 0;
    const earthRatio = total > 0 ? earthCount / total : 0;
    const majorRatio = total > 0 ? majorCount / total : 0;
    const reversedRatio = total > 0 ? reversedCount / total : 0;

    const counts = [
      { elem: 'Fire', count: fireCount },
      { elem: 'Water', count: waterCount },
      { elem: 'Air', count: airCount },
      { elem: 'Earth', count: earthCount },
    ];
    counts.sort((a, b) => b.count - a.count);
    const dominantElement = counts[0].count === 0 ? 'None' : counts[0].elem;

    let shadowSum = totalCardSum;
    while (shadowSum > 21) {
      let dSum = 0;
      while (shadowSum > 0) {
        dSum += shadowSum % 10;
        shadowSum = Math.floor(shadowSum / 10);
      }
      shadowSum = dSum;
    }
    const shadowCardId = shadowSum;

    const pairwiseDignities: PairwiseDignity[] = [];
    let weightedTensionSum = 0;
    let totalWeight = 0;

    for (const edge of spread.edges || []) {
      const srcPlaced = placedCards.find((p) => p.slot_id === edge.source_slot_id);
      const tgtPlaced = placedCards.find((p) => p.slot_id === edge.target_slot_id);

      if (srcPlaced && tgtPlaced) {
        const cardA = this.getCardById(srcPlaced.drawn_card.card_id);
        const cardB = this.getCardById(tgtPlaced.drawn_card.card_id);

        if (cardA && cardB) {
          const [affinity, baseTension] = this.calculateAffinity(cardA.element, cardB.element);
          const revA = srcPlaced.drawn_card.orientation === 'Reversed';
          const revB = tgtPlaced.drawn_card.orientation === 'Reversed';
          let revPenalty = 1.0;
          if (revA && revB) {
            revPenalty = -0.5;
          } else if (revA || revB) {
            revPenalty = 0.6;
          }

          const tensionScore = Math.max(-1.0, Math.min(1.0, baseTension * revPenalty));
          let dignityStatus: DignityStatus = 'NeutralDignified';
          if (tensionScore > 0.3) dignityStatus = 'WellDignified';
          else if (tensionScore < -0.2) dignityStatus = 'IllDignified';

          const srcSlot = spread.slots.find((s) => s.slot_id === edge.source_slot_id);
          const tgtSlot = spread.slots.find((s) => s.slot_id === edge.target_slot_id);
          const srcTitle = srcSlot ? srcSlot.title_zh : '位置A';
          const tgtTitle = tgtSlot ? tgtSlot.title_zh : '位置B';

          const dynamicSummaryZh = `[${srcTitle}] ${cardA.name_zh} (${cardA.element}) 与 [${tgtTitle}] ${cardB.name_zh} (${cardB.element}) 尊位张力: ${tensionScore.toFixed(2)}`;

          pairwiseDignities.push({
            source_slot_id: edge.source_slot_id,
            target_slot_id: edge.target_slot_id,
            source_card_id: cardA.id,
            target_card_id: cardB.id,
            relation: edge.relation,
            source_element: cardA.element,
            target_element: cardB.element,
            affinity,
            dignity_status: dignityStatus,
            tension_score: tensionScore,
            dynamic_summary_zh: dynamicSummaryZh,
          });

          weightedTensionSum += tensionScore * edge.weight;
          totalWeight += edge.weight;
        }
      }
    }

    const overallHarmonyScore = totalWeight > 0 ? weightedTensionSum / totalWeight : 0.0;
    const balanceDescriptionZh = `元素分布：火 ${(fireRatio * 100).toFixed(0)}% | 水 ${(waterRatio * 100).toFixed(0)}% | 风 ${(airRatio * 100).toFixed(0)}% | 土 ${(earthRatio * 100).toFixed(0)}%；大牌占比：${(majorRatio * 100).toFixed(0)}%，逆位占比：${(reversedRatio * 100).toFixed(0)}%`;

    return {
      fire_ratio: fireRatio,
      water_ratio: waterRatio,
      air_ratio: airRatio,
      earth_ratio: earthRatio,
      major_ratio: majorRatio,
      reversed_ratio: reversedRatio,
      dominant_element: dominantElement,
      shadow_card_id: shadowCardId,
      pairwise_dignities: pairwiseDignities,
      overall_harmony_score: overallHarmonyScore,
      balance_description_zh: balanceDescriptionZh,
    };
  }

  public drawReadingSession(
    spreadId: string,
    question?: string | null,
    seedOverride?: string | null,
    reversalProbability: number = 0.3
  ): ReadingSession {
    const spread = this.getSpreadById(spreadId);
    if (!spread) {
      throw new Error(`Spread not found: ${spreadId}`);
    }

    const seedHex = seedOverride || this.generateRandomSeed();
    const seedBytes = this.parseSeed(seedHex);
    const rng = new SimpleChaCha20LikeRng(seedBytes);

    // Fisher-Yates shuffle
    const deckIndices = Array.from({ length: 78 }, (_, i) => i);
    for (let i = deckIndices.length - 1; i > 0; i--) {
      const j = Math.floor(rng.nextFloat() * (i + 1));
      const temp = deckIndices[i];
      deckIndices[i] = deckIndices[j];
      deckIndices[j] = temp;
    }

    const clampedRev = Math.max(0.0, Math.min(1.0, reversalProbability));
    const fullDeck = deckIndices.map((id) => {
      const isReversed = clampedRev > 0.0 && rng.nextFloat() < clampedRev;
      const orientation: Orientation = isReversed ? 'Reversed' : 'Upright';
      return { card_id: id, orientation };
    });

    const consumed = new Array(78).fill(false);
    const placedCards: PlacedCard[] = [];

    for (let seq = 0; seq < spread.slots.length; seq++) {
      const slot = spread.slots[seq];
      let matchedIdx = -1;

      for (let d = 0; d < fullDeck.length; d++) {
        if (!consumed[d]) {
          const card = this.getCardById(fullDeck[d].card_id);
          if (card) {
            let matches = true;
            if (slot.constraint === 'MajorOnly') matches = card.arcana === 'Major';
            else if (slot.constraint === 'MinorOnly') matches = card.arcana === 'Minor';
            else if (slot.constraint === 'WandsOnly') matches = card.suit === 'Wands';
            else if (slot.constraint === 'CupsOnly') matches = card.suit === 'Cups';
            else if (slot.constraint === 'SwordsOnly') matches = card.suit === 'Swords';
            else if (slot.constraint === 'PentaclesOnly') matches = card.suit === 'Pentacles';

            if (matches) {
              matchedIdx = d;
              break;
            }
          }
        }
      }

      if (matchedIdx >= 0) {
        consumed[matchedIdx] = true;
        placedCards.push({
          slot_id: slot.slot_id,
          drawn_card: {
            card_id: fullDeck[matchedIdx].card_id,
            orientation: fullDeck[matchedIdx].orientation,
            draw_sequence: seq,
          },
        });
      }
    }

    const dignitySummary = this.evaluateSpreadSession(spread, placedCards);
    const sessionId = `tarot_${seedHex.substring(0, 12)}_${spread.slots.length}`;

    return {
      session_id: sessionId,
      created_at: Date.now(),
      spread_id: spreadId,
      question: question || null,
      rng_seed: seedHex,
      reversal_probability: reversalProbability,
      placed_cards: placedCards,
      dignity_summary: dignitySummary,
      user_notes: null,
      tags: [],
      ai_interpretation: null,
    };
  }
}

export const tarotCoreService = TarotCoreService.getInstance();
