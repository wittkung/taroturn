use rand::seq::SliceRandom;
use rand::{Rng, SeedableRng};
use rand_chacha::ChaCha20Rng;
use serde::{Deserialize, Serialize};
use crate::card::{CardDeck, Orientation};
use crate::error::{TarotError, TarotResult};
use crate::spread::SpreadSlot;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, uniffi::Record)]
pub struct DrawnCard {
    pub card_id: u8,
    pub orientation: Orientation,
    pub draw_sequence: u8,
}

pub struct ShufflingEngine;

impl ShufflingEngine {
    pub fn generate_random_seed() -> TarotResult<String> {
        let mut seed_bytes = [0u8; 32];
        getrandom::getrandom(&mut seed_bytes)
            .map_err(|e| TarotError::InvalidSeed(format!("OS entropy failure: {e}")))?;
        Ok(hex::encode(seed_bytes))
    }

    pub fn parse_seed(seed_hex: &str) -> TarotResult<[u8; 32]> {
        let clean = seed_hex.trim();
        if clean.len() != 64 {
            return Err(TarotError::InvalidSeed(format!(
                "Seed must be exactly 64 hex characters (got {})",
                clean.len()
            )));
        }

        let decoded = hex::decode(clean)
            .map_err(|e| TarotError::InvalidSeed(format!("Hex decoding error: {e}")))?;

        let mut seed = [0u8; 32];
        seed.copy_from_slice(&decoded[0..32]);
        Ok(seed)
    }

    pub fn shuffle_full_deck(
        seed: &[u8; 32],
        reversal_probability: f32,
    ) -> Vec<(u8, Orientation)> {
        let mut rng = ChaCha20Rng::from_seed(*seed);
        let mut deck_indices: Vec<u8> = (0..78).collect();
        deck_indices.shuffle(&mut rng);

        let clamped_rev = reversal_probability.clamp(0.0, 1.0);

        deck_indices
            .into_iter()
            .map(|id| {
                let orientation = if clamped_rev > 0.0 && rng.gen::<f32>() < clamped_rev {
                    Orientation::Reversed
                } else {
                    Orientation::Upright
                };
                (id, orientation)
            })
            .collect()
    }

    /// Draws cards matching slot constraints via stream drain permutation solver (deterministic CSP)
    pub fn draw_cards_with_constraints(
        seed: &[u8; 32],
        slots: &[SpreadSlot],
        reversal_probability: f32,
    ) -> TarotResult<Vec<DrawnCard>> {
        if slots.len() > 78 {
            return Err(TarotError::SpreadSlotOverflow {
                requested: slots.len() as u64,
                capacity: 78,
            });
        }

        let full_deck = Self::shuffle_full_deck(seed, reversal_probability);
        let mut consumed = [false; 78];
        let mut drawn = Vec::with_capacity(slots.len());

        for (seq, slot) in slots.iter().enumerate() {
            let mut matched = None;

            for (deck_idx, (card_id, orientation)) in full_deck.iter().enumerate() {
                if !consumed[deck_idx] {
                    let card = CardDeck::get_by_id(*card_id)?;
                    if slot.constraint.matches(&card) {
                        matched = Some((deck_idx, *card_id, *orientation));
                        break;
                    }
                }
            }

            match matched {
                Some((deck_idx, card_id, orientation)) => {
                    consumed[deck_idx] = true;
                    drawn.push(DrawnCard {
                        card_id,
                        orientation,
                        draw_sequence: seq as u8,
                    });
                }
                None => {
                    return Err(TarotError::ConstraintViolation {
                        slot_id: slot.slot_id,
                        required: format!("{:?}", slot.constraint),
                        actual: "Deck exhausted for constraint".into(),
                    });
                }
            }
        }

        Ok(drawn)
    }

    /// Legacy / unconstrained draw wrapper
    pub fn draw_cards(
        seed: &[u8; 32],
        count: usize,
        reversal_probability: f32,
    ) -> TarotResult<Vec<DrawnCard>> {
        if count > 78 {
            return Err(TarotError::SpreadSlotOverflow {
                requested: count as u64,
                capacity: 78,
            });
        }

        let shuffled = Self::shuffle_full_deck(seed, reversal_probability);

        let drawn: Vec<DrawnCard> = shuffled
            .into_iter()
            .take(count)
            .enumerate()
            .map(|(seq, (card_id, orientation))| DrawnCard {
                card_id,
                orientation,
                draw_sequence: seq as u8,
            })
            .collect();

        Ok(drawn)
    }
}

mod hex {
    use crate::error::{TarotError, TarotResult};

    pub fn encode<T: AsRef<[u8]>>(data: T) -> String {
        data.as_ref().iter().map(|b| format!("{:02x}", b)).collect()
    }

    pub fn decode(s: &str) -> TarotResult<Vec<u8>> {
        if s.len() % 2 != 0 {
            return Err(TarotError::InvalidSeed("Hex string length must be even".into()));
        }
        (0..s.len())
            .step_by(2)
            .map(|i| {
                u8::from_str_radix(&s[i..i + 2], 16)
                    .map_err(|e| TarotError::InvalidSeed(format!("Invalid hex byte: {e}")))
            })
            .collect()
    }
}
