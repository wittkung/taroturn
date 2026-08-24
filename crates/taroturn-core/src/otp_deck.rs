// crates/taroturn-core/src/otp_deck.rs - Dynamic Open Tarot Package Deck System

use serde::{Deserialize, Serialize};
use crate::card::{ArcanaType, Element};
use crate::deck_system::{CourtHierarchy, DeckFamily, PolyDeckCard, TarotDeckSystem};
use crate::error::{TarotError, TarotResult};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OtpManifestMeta {
    pub uuid: String,
    pub slug: String,
    pub name: String,
    pub name_zh: Option<String>,
    pub family: String,
    pub author: String,
    pub version: String,
    pub license: Option<String>,
    pub description_zh: Option<String>,
    pub court_hierarchy: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OtpCardFacets {
    pub upright_keywords: Vec<String>,
    pub reversed_keywords: Vec<String>,
    pub shadow_aspect: String,
    pub esoteric_formula: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OtpCardDefinition {
    pub canonical_id: u8,
    pub key: String,
    pub arcana: String,
    pub display_number: Option<String>,
    pub name_en: String,
    pub name_zh: String,
    pub subtitle: Option<String>,
    pub element: String,
    pub astrology: Option<String>,
    pub hebrew_letter: Option<String>,
    pub tree_path: Option<u8>,
    pub image_path: String,
    pub facets: OtpCardFacets,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OtpManifest {
    pub otp_version: String,
    pub meta: OtpManifestMeta,
    pub cards: Vec<OtpCardDefinition>,
}

pub struct OtpDynamicDeckSystem {
    manifest: OtpManifest,
}

impl OtpDynamicDeckSystem {
    pub fn from_manifest(manifest: OtpManifest) -> TarotResult<Self> {
        if manifest.cards.len() != 78 {
            return Err(TarotError::OtpIncompleteDeck(manifest.cards.len() as u32));
        }
        Ok(Self { manifest })
    }
}

impl TarotDeckSystem for OtpDynamicDeckSystem {
    fn family(&self) -> DeckFamily {
        match self.manifest.meta.family.as_str() {
            "crowley_thoth" => DeckFamily::CrowleyThoth,
            "tarot_de_marseille" => DeckFamily::TarotDeMarseille,
            "rider_waite_smith" => DeckFamily::RiderWaiteSmith,
            _ => DeckFamily::EsotericCustom,
        }
    }

    fn deck_id(&self) -> &str {
        &self.manifest.meta.slug
    }

    fn display_name_zh(&self) -> &str {
        self.manifest.meta.name_zh.as_deref().unwrap_or(&self.manifest.meta.name)
    }

    fn display_name_en(&self) -> &str {
        &self.manifest.meta.name
    }

    fn version(&self) -> &str {
        &self.manifest.meta.version
    }

    fn author(&self) -> &str {
        &self.manifest.meta.author
    }

    fn court_hierarchy(&self) -> CourtHierarchy {
        match self.manifest.meta.court_hierarchy.as_deref() {
            Some("princess_prince_queen_knight") => CourtHierarchy::PrincessPrinceQueenKnight,
            _ => CourtHierarchy::PageKnightQueenKing,
        }
    }

    fn supports_physical_reversals(&self) -> bool {
        true
    }

    fn get_card(&self, canonical_id: u8) -> TarotResult<PolyDeckCard> {
        let card_def = self.manifest.cards.iter()
            .find(|c| c.canonical_id == canonical_id)
            .ok_or(TarotError::CardIndexOutOfBounds(canonical_id))?;

        let arcana = match card_def.arcana.to_lowercase().as_str() {
            "major" => ArcanaType::Major,
            _ => ArcanaType::Minor,
        };

        let element = match card_def.element.to_lowercase().as_str() {
            "fire" => Element::Fire,
            "water" => Element::Water,
            "air" => Element::Air,
            _ => Element::Earth,
        };

        Ok(PolyDeckCard {
            canonical_id,
            deck_family: self.family(),
            key: card_def.key.clone(),
            arcana,
            element,
            display_number: card_def.display_number.clone().unwrap_or_else(|| format!("{}", canonical_id)),
            display_name_zh: card_def.name_zh.clone(),
            display_name_en: card_def.name_en.clone(),
            subtitle: card_def.subtitle.clone(),
            astrology_or_decan: card_def.astrology.clone(),
            hebrew_letter: card_def.hebrew_letter.clone(),
            keywords_upright: card_def.facets.upright_keywords.clone(),
            keywords_reversed: card_def.facets.reversed_keywords.clone(),
            shadow_aspect: card_def.facets.shadow_aspect.clone(),
        })
    }

    fn all_cards(&self) -> Vec<PolyDeckCard> {
        (0..78).filter_map(|id| self.get_card(id).ok()).collect()
    }
}
