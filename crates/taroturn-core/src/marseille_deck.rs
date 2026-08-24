// crates/taroturn-core/src/marseille_deck.rs - Tarot de Marseille Deck System

use crate::card::CardDeck;
use crate::deck_system::{CourtHierarchy, DeckFamily, PolyDeckCard, TarotDeckSystem};
use crate::error::TarotResult;

pub struct MarseilleDeckSystem;

impl MarseilleDeckSystem {
    pub fn new() -> Self {
        Self
    }
}

impl TarotDeckSystem for MarseilleDeckSystem {
    fn family(&self) -> DeckFamily {
        DeckFamily::TarotDeMarseille
    }

    fn deck_id(&self) -> &str {
        "marseille_conver_1760"
    }

    fn display_name_zh(&self) -> &str {
        "马赛 1760 历史经典木刻牌组"
    }

    fn display_name_en(&self) -> &str {
        "Tarot de Marseille (Nicolas Conver 1760)"
    }

    fn version(&self) -> &str {
        "1.0.0"
    }

    fn author(&self) -> &str {
        "Nicolas Conver"
    }

    fn court_hierarchy(&self) -> CourtHierarchy {
        CourtHierarchy::PageKnightQueenKing
    }

    fn supports_physical_reversals(&self) -> bool {
        false
    }

    fn get_card(&self, canonical_id: u8) -> TarotResult<PolyDeckCard> {
        let base_card = CardDeck::get_by_id(canonical_id)?;

        let (display_number, name_zh, name_en) = match canonical_id {
            0 => ("Le Mat".into(), "愚者/流浪者".into(), "Le Mat".into()),
            1 => ("I".into(), "杂耍者/魔术师".into(), "Le Bateleur".into()),
            2 => ("II".into(), "女教皇".into(), "La Papesse".into()),
            3 => ("III".into(), "女皇".into(), "L'Impératrice".into()),
            4 => ("IIII".into(), "皇帝".into(), "L'Empereur".into()),
            5 => ("V".into(), "教皇".into(), "Le Pape".into()),
            6 => ("VI".into(), "恋人/抉择".into(), "L'Amoureux".into()),
            7 => ("VII".into(), "战车".into(), "Le Chariot".into()),
            8 => ("VIII".into(), "正义".into(), "La Justice".into()),
            9 => ("VIIII".into(), "隐士".into(), "L'Hermite".into()),
            10 => ("X".into(), "命运之轮".into(), "La Roue de Fortune".into()),
            11 => ("XI".into(), "力量".into(), "La Force".into()),
            12 => ("XII".into(), "倒吊人".into(), "Le Pendu".into()),
            13 => ("XIII".into(), "无名牌/死神".into(), "[Sans Nom]".into()),
            14 => ("XIIII".into(), "节制".into(), "Tempérance".into()),
            15 => ("XV".into(), "恶魔".into(), "Le Diable".into()),
            16 => ("XVI".into(), "上帝之屋/高塔".into(), "La Maison Dieu".into()),
            17 => ("XVII".into(), "星星".into(), "L'Étoile".into()),
            18 => ("XVIII".into(), "月亮".into(), "La Lune".into()),
            19 => ("XVIIII".into(), "太阳".into(), "Le Soleil".into()),
            20 => ("XX".into(), "审判".into(), "Le Jugement".into()),
            21 => ("XXI".into(), "世界".into(), "Le Monde".into()),
            _ => (
                format!("{}", canonical_id),
                base_card.name_zh.to_string(),
                base_card.name_en.to_string(),
            ),
        };

        Ok(PolyDeckCard {
            canonical_id,
            deck_family: DeckFamily::TarotDeMarseille,
            key: format!("marseille_{:02}", canonical_id),
            arcana: base_card.arcana,
            element: base_card.element,
            display_number,
            display_name_zh: name_zh,
            display_name_en: name_en,
            subtitle: Some("Nicolas Conver 1760 Woodcut Edition".into()),
            astrology_or_decan: None,
            hebrew_letter: None,
            keywords_upright: base_card.facets.general_upright.clone(),
            keywords_reversed: base_card.facets.general_reversed.clone(),
            shadow_aspect: base_card.facets.shadow_aspect.to_string(),
        })
    }

    fn all_cards(&self) -> Vec<PolyDeckCard> {
        (0..78).filter_map(|id| self.get_card(id).ok()).collect()
    }
}
