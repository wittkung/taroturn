// crates/taroturn-core/src/deck_system.rs

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::{Arc, RwLock};
use crate::card::{ArcanaType, Element};
use crate::error::{TarotError, TarotResult};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum DeckFamily {
    RiderWaiteSmith,
    CrowleyThoth,
    TarotDeMarseille,
    EsotericCustom,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum CourtHierarchy {
    PageKnightQueenKing,
    PrincessPrinceQueenKnight,
    Custom4Tier,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PolyDeckCard {
    pub canonical_id: u8,
    pub deck_family: DeckFamily,
    pub key: String,
    pub arcana: ArcanaType,
    pub element: Element,
    pub display_number: String,
    pub display_name_zh: String,
    pub display_name_en: String,
    pub subtitle: Option<String>,
    pub astrology_or_decan: Option<String>,
    pub hebrew_letter: Option<String>,
    pub keywords_upright: Vec<String>,
    pub keywords_reversed: Vec<String>,
    pub shadow_aspect: String,
}

pub trait TarotDeckSystem: Send + Sync {
    fn family(&self) -> DeckFamily;
    fn deck_id(&self) -> &str;
    fn display_name_zh(&self) -> &str;
    fn display_name_en(&self) -> &str;
    fn version(&self) -> &str;
    fn author(&self) -> &str;
    fn court_hierarchy(&self) -> CourtHierarchy;
    fn supports_physical_reversals(&self) -> bool;
    fn get_card(&self, canonical_id: u8) -> TarotResult<PolyDeckCard>;
    fn all_cards(&self) -> Vec<PolyDeckCard>;
}

pub struct DeckRegistry {
    systems: RwLock<HashMap<String, Arc<dyn TarotDeckSystem>>>,
    default_system_id: String,
}

impl DeckRegistry {
    pub fn new() -> Self {
        Self {
            systems: RwLock::new(HashMap::new()),
            default_system_id: "rws".to_string(),
        }
    }

    pub fn global() -> &'static DeckRegistry {
        static INSTANCE: std::sync::OnceLock<DeckRegistry> = std::sync::OnceLock::new();
        INSTANCE.get_or_init(|| {
            let registry = DeckRegistry::new();
            // Default built-ins will be registered upon module init
            registry
        })
    }

    pub fn default_system_id(&self) -> &str {
        &self.default_system_id
    }

    pub fn register(&self, system: Arc<dyn TarotDeckSystem>) -> TarotResult<()> {
        let mut map = self.systems.write().map_err(|_| TarotError::InternalLockError)?;
        map.insert(system.deck_id().to_string(), system);
        Ok(())
    }

    pub fn get(&self, deck_id: &str) -> TarotResult<Arc<dyn TarotDeckSystem>> {
        let map = self.systems.read().map_err(|_| TarotError::InternalLockError)?;
        map.get(deck_id)
            .cloned()
            .ok_or_else(|| TarotError::DeckNotFound(deck_id.to_string()))
    }

    pub fn list_decks(&self) -> Vec<(String, String, DeckFamily)> {
        let map = self.systems.read().unwrap();
        map.values().map(|s| (s.deck_id().to_string(), s.display_name_zh().to_string(), s.family())).collect()
    }
}
