/**
 * Taroturn TypeScript / JavaScript SDK
 * Supports both Native FFI (via node-ffi/koffi) and WebAssembly (WeChat Mini Program & Browsers).
 */

export interface PlacedCard {
  slot_id: number;
  drawn_card: {
    card_id: number;
    orientation: 'Upright' | 'Reversed';
    draw_sequence: number;
  };
}

export interface ReadingSession {
  session_id: string;
  created_at: number;
  spread_id: string;
  question?: string;
  rng_seed: string;
  reversal_probability: number;
  placed_cards: PlacedCard[];
  dignity_summary: {
    fire_ratio: number;
    water_ratio: number;
    air_ratio: number;
    earth_ratio: number;
    major_ratio: number;
    reversed_ratio: number;
    dominant_element: string;
    shadow_card_id?: number;
    balance_description_zh: string;
  };
}

export class TarotEngine {
  /**
   * Generates a 64-character cryptographic random hex seed.
   */
  static generateSeed(): string {
    const array = new Uint8Array(32);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(array);
    } else {
      for (let i = 0; i < 32; i++) array[i] = Math.floor(Math.random() * 256);
    }
    return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
  }
}
