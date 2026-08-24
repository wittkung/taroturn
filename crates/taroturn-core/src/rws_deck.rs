// crates/taroturn-core/src/rws_deck.rs

use crate::card::CardDeck;
use crate::deck_system::{CourtHierarchy, DeckFamily, PolyDeckCard, TarotDeckSystem};
use crate::error::TarotResult;

pub struct RwsDeckSystem;

impl RwsDeckSystem {
    pub fn new() -> Self {
        Self
    }
}

impl TarotDeckSystem for RwsDeckSystem {
    fn family(&self) -> DeckFamily {
        DeckFamily::RiderWaiteSmith
    }

    fn deck_id(&self) -> &str {
        "rws_1909"
    }

    fn display_name_zh(&self) -> &str {
        "韦特-史密斯 1909 经典牌组"
    }

    fn display_name_en(&self) -> &str {
        "Rider-Waite-Smith (1909)"
    }

    fn version(&self) -> &str {
        "1.0.0"
    }

    fn author(&self) -> &str {
        "Arthur Edward Waite & Pamela Colman Smith"
    }

    fn court_hierarchy(&self) -> CourtHierarchy {
        CourtHierarchy::PageKnightQueenKing
    }

    fn supports_physical_reversals(&self) -> bool {
        true
    }

    fn get_card(&self, canonical_id: u8) -> TarotResult<PolyDeckCard> {
        let static_card = CardDeck::get_by_id(canonical_id)?;
        Ok(PolyDeckCard {
            canonical_id: static_card.id,
            deck_family: DeckFamily::RiderWaiteSmith,
            key: format!("rws_{:02}", static_card.id),
            arcana: static_card.arcana,
            element: static_card.element,
            display_number: format!("{}", static_card.id),
            display_name_zh: static_card.name_zh.to_string(),
            display_name_en: static_card.name_en.to_string(),
            subtitle: None,
            astrology_or_decan: static_card.astrology.map(|s| s.to_string()),
            hebrew_letter: static_card.hebrew_letter.map(|s| s.to_string()),
            keywords_upright: static_card.facets.general_upright.clone(),
            keywords_reversed: static_card.facets.general_reversed.clone(),
            shadow_aspect: static_card.facets.shadow_aspect.to_string(),
        })
    }

    fn all_cards(&self) -> Vec<PolyDeckCard> {
        (0..78).filter_map(|id| self.get_card(id).ok()).collect()
    }
}
