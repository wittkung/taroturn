use serde::{Deserialize, Serialize};
use crate::dignity::{DignityCalculator, ElementalDignitySummary};
use crate::error::{TarotError, TarotResult};
use crate::shuffling::{DrawnCard, ShufflingEngine};
use crate::spread::Spread;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, uniffi::Record)]
pub struct PlacedCard {
    pub slot_id: u8,
    pub drawn_card: DrawnCard,
}

pub fn current_timestamp_ms() -> i64 {
    #[cfg(target_arch = "wasm32")]
    {
        #[cfg(feature = "wasm")]
        {
            js_sys::Date::now() as i64
        }
        #[cfg(not(feature = "wasm"))]
        {
            0
        }
    }
    #[cfg(not(target_arch = "wasm32"))]
    {
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map(|d| d.as_millis() as i64)
            .unwrap_or(0)
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, uniffi::Record)]
pub struct ReadingSession {
    pub session_id: String,
    pub created_at: i64,
    pub spread_id: String,
    pub question: Option<String>,
    pub rng_seed: String,
    pub reversal_probability: f32,
    pub placed_cards: Vec<PlacedCard>,
    pub dignity_summary: ElementalDignitySummary,
    pub user_notes: Option<String>,
    pub tags: Vec<String>,
    pub ai_interpretation: Option<String>,
}

impl ReadingSession {
    pub fn create(
        spread_id: &str,
        question: Option<String>,
        seed_override: Option<String>,
        reversal_probability: f32,
    ) -> TarotResult<Self> {
        Self::create_with_timestamp(
            spread_id,
            question,
            seed_override,
            reversal_probability,
            current_timestamp_ms(),
        )
    }

    pub fn create_with_timestamp(
        spread_id: &str,
        question: Option<String>,
        seed_override: Option<String>,
        reversal_probability: f32,
        timestamp_ms: i64,
    ) -> TarotResult<Self> {
        let spread = Spread::get_by_id(spread_id)?;
        let seed_hex = match seed_override {
            Some(s) => s,
            None => ShufflingEngine::generate_random_seed()?,
        };

        let seed_bytes = ShufflingEngine::parse_seed(&seed_hex)?;
        let drawn_cards = ShufflingEngine::draw_cards_with_constraints(
            &seed_bytes,
            &spread.slots,
            reversal_probability,
        )?;

        let placed_cards: Vec<PlacedCard> = drawn_cards
            .iter()
            .enumerate()
            .map(|(idx, drawn)| PlacedCard {
                slot_id: spread.slots[idx].slot_id,
                drawn_card: *drawn,
            })
            .collect();

        let dignity_summary = DignityCalculator::evaluate_spread_session(&spread, &placed_cards)?;
        let session_id = format!("tarot_{}_{}", &seed_hex[0..12], spread.slot_count());

        Ok(Self {
            session_id,
            created_at: timestamp_ms,
            spread_id: spread_id.to_string(),
            question,
            rng_seed: seed_hex,
            reversal_probability,
            placed_cards,
            dignity_summary,
            user_notes: None,
            tags: Vec::new(),
            ai_interpretation: None,
        })
    }

    pub fn to_json(&self) -> TarotResult<String> {
        serde_json::to_string_pretty(self)
            .map_err(|e| TarotError::DeserializationError(e.to_string()))
    }

    pub fn from_json(json_str: &str) -> TarotResult<Self> {
        serde_json::from_str(json_str)
            .map_err(|e| TarotError::DeserializationError(e.to_string()))
    }
}
