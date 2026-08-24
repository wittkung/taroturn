#![deny(unsafe_code)]
//! Taroturn Core Domain Microkernel (Rust)
//! Pure, memory-safe, deterministic Tarot domain logic with UniFFI and WASM support.

pub mod card;
pub mod deck_system;
pub mod dignity;
pub mod error;
pub mod facets;
pub mod ffi;
pub mod marseille_deck;
pub mod otp_deck;
pub mod otp_loader;
pub mod rws_deck;
pub mod session;
pub mod shuffling;
pub mod spread;
pub mod thoth_deck;

pub use card::{ArcanaType, Card, CardDeck, Element, Orientation, Rank, Suit};
pub use dignity::{
    DignityCalculator, DignityStatus, DominantElement, ElementalAffinity, ElementalDignitySummary,
    PairwiseDignity,
};
pub use error::{TarotError, TarotResult};
pub use facets::CardFacets;
pub use session::{PlacedCard, ReadingSession};
pub use shuffling::{DrawnCard, ShufflingEngine};
pub use spread::{SlotConstraint, SlotEdge, SlotRelationType, Spread, SpreadCategory, SpreadSlot};

// Initialize UniFFI scaffolding
uniffi::setup_scaffolding!();

/// UniFFI Exported: Returns static library version string
#[uniffi::export]
pub fn get_taroturn_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

/// UniFFI Exported: Generates a 64-character cryptographic CSPRNG seed
#[uniffi::export]
pub fn generate_random_seed() -> Result<String, TarotError> {
    ShufflingEngine::generate_random_seed()
}

/// UniFFI Exported: Draws a deterministic reading session
#[uniffi::export]
pub fn draw_reading_session(
    spread_id: String,
    question: Option<String>,
    seed_hex: Option<String>,
    reversal_rate: f32,
) -> Result<ReadingSession, TarotError> {
    ReadingSession::create(&spread_id, question, seed_hex, reversal_rate)
}

/// UniFFI Exported: Retrieves a card archetype definition by card ID (0..77)
#[uniffi::export]
pub fn get_card_by_id(card_id: u8) -> Result<Card, TarotError> {
    CardDeck::get_by_id(card_id)
}

/// UniFFI Exported: Lists all built-in canonical spreads
#[uniffi::export]
pub fn list_canonical_spreads() -> Vec<Spread> {
    Spread::canonical_spreads()
}

/// UniFFI Exported: Lists all 78 standard Tarot cards
#[uniffi::export]
pub fn list_all_cards() -> Vec<Card> {
    CardDeck::standard_78()
}

// -----------------------------------------------------------------------------
// WebAssembly (WASM) Single Source of Truth Bindings
// -----------------------------------------------------------------------------

#[cfg(feature = "wasm")]
use wasm_bindgen::prelude::*;

#[cfg(feature = "wasm")]
#[wasm_bindgen]
pub fn wasm_get_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

#[cfg(feature = "wasm")]
#[wasm_bindgen]
pub fn wasm_generate_random_seed() -> Result<String, JsValue> {
    ShufflingEngine::generate_random_seed()
        .map_err(|e| JsValue::from_str(&e.to_string()))
}

#[cfg(feature = "wasm")]
#[wasm_bindgen]
pub fn wasm_draw_reading_session(
    spread_id: String,
    question: Option<String>,
    seed_hex: Option<String>,
    reversal_rate: f32,
) -> Result<JsValue, JsValue> {
    let session = ReadingSession::create(&spread_id, question, seed_hex, reversal_rate)
        .map_err(|e| JsValue::from_str(&e.to_string()))?;
    serde_wasm_bindgen::to_value(&session).map_err(|e| JsValue::from_str(&e.to_string()))
}

#[cfg(feature = "wasm")]
#[wasm_bindgen]
pub fn wasm_get_card_by_id(card_id: u8) -> Result<JsValue, JsValue> {
    let card = CardDeck::get_by_id(card_id)
        .map_err(|e| JsValue::from_str(&e.to_string()))?;
    serde_wasm_bindgen::to_value(&card).map_err(|e| JsValue::from_str(&e.to_string()))
}

#[cfg(feature = "wasm")]
#[wasm_bindgen]
pub fn wasm_list_canonical_spreads() -> Result<JsValue, JsValue> {
    let spreads = Spread::canonical_spreads();
    serde_wasm_bindgen::to_value(&spreads).map_err(|e| JsValue::from_str(&e.to_string()))
}

#[cfg(feature = "wasm")]
#[wasm_bindgen]
pub fn wasm_list_all_cards() -> Result<JsValue, JsValue> {
    let cards = CardDeck::standard_78();
    serde_wasm_bindgen::to_value(&cards).map_err(|e| JsValue::from_str(&e.to_string()))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_deck_contains_78_cards() {
        let deck = CardDeck::standard_78();
        assert_eq!(deck.len(), 78);
    }

    #[test]
    fn test_deterministic_shuffling_parity() {
        let seed_hex = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
        let seed_bytes = ShufflingEngine::parse_seed(seed_hex).unwrap();

        let draw1 = ShufflingEngine::draw_cards(&seed_bytes, 10, 0.5).unwrap();
        let draw2 = ShufflingEngine::draw_cards(&seed_bytes, 10, 0.5).unwrap();

        assert_eq!(draw1, draw2);
        assert_eq!(draw1.len(), 10);
    }

    #[test]
    fn test_reading_session_creation_and_dignity() {
        let session = ReadingSession::create_with_timestamp(
            "three_cards_time",
            Some("Testing deterministic timeline".into()),
            Some("abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789".into()),
            0.5,
            1724490000000,
        )
        .unwrap();

        assert_eq!(session.placed_cards.len(), 3);
        assert!(session.dignity_summary.shadow_card_id.is_some());
        assert!(!session.dignity_summary.pairwise_dignities.is_empty());

        let json = session.to_json().unwrap();
        let deserialized = ReadingSession::from_json(&json).unwrap();
        assert_eq!(session, deserialized);
    }

    #[test]
    fn test_csp_slot_constraints() {
        let seed_hex = "1111222233334444555566667777888899990000aaaabbbbccccddddeeeeffff";
        let seed_bytes = ShufflingEngine::parse_seed(seed_hex).unwrap();

        let custom_slots = vec![
            SpreadSlot {
                slot_id: 0,
                title_en: "Major Archetype".into(),
                title_zh: "大阿卡纳位".into(),
                meaning_prompt: "Major test".into(),
                x: 0.0,
                y: 0.0,
                rotation_deg: 0.0,
                z_index: 0,
                constraint: SlotConstraint::MajorOnly,
            },
            SpreadSlot {
                slot_id: 1,
                title_en: "Wands Energy".into(),
                title_zh: "权杖位".into(),
                meaning_prompt: "Wands test".into(),
                x: 0.0,
                y: 0.0,
                rotation_deg: 0.0,
                z_index: 0,
                constraint: SlotConstraint::WandsOnly,
            },
            SpreadSlot {
                slot_id: 2,
                title_en: "Court Personality".into(),
                title_zh: "宫廷牌位".into(),
                meaning_prompt: "Court test".into(),
                x: 0.0,
                y: 0.0,
                rotation_deg: 0.0,
                z_index: 0,
                constraint: SlotConstraint::CourtOnly,
            },
        ];

        let drawn = ShufflingEngine::draw_cards_with_constraints(&seed_bytes, &custom_slots, 0.0).unwrap();
        assert_eq!(drawn.len(), 3);

        let card0 = CardDeck::get_by_id(drawn[0].card_id).unwrap();
        let card1 = CardDeck::get_by_id(drawn[1].card_id).unwrap();
        let card2 = CardDeck::get_by_id(drawn[2].card_id).unwrap();

        assert_eq!(card0.arcana, ArcanaType::Major);
        assert_eq!(card1.suit, Some(Suit::Wands));
        assert!(matches!(card2.rank, Some(Rank::Page | Rank::Knight | Rank::Queen | Rank::King)));

        // Verify no card duplication
        assert_ne!(drawn[0].card_id, drawn[1].card_id);
        assert_ne!(drawn[1].card_id, drawn[2].card_id);
        assert_ne!(drawn[0].card_id, drawn[2].card_id);
    }
}
