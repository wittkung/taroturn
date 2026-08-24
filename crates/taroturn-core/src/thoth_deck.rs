// crates/taroturn-core/src/thoth_deck.rs - Crowley Thoth Deck System

use crate::card::CardDeck;
use crate::deck_system::{CourtHierarchy, DeckFamily, PolyDeckCard, TarotDeckSystem};
use crate::error::TarotResult;

pub struct ThothDeckSystem;

impl ThothDeckSystem {
    pub fn new() -> Self {
        Self
    }
}

impl TarotDeckSystem for ThothDeckSystem {
    fn family(&self) -> DeckFamily {
        DeckFamily::CrowleyThoth
    }

    fn deck_id(&self) -> &str {
        "crowley_thoth_1944"
    }

    fn display_name_zh(&self) -> &str {
        "克劳利-托特 1944 经典牌组"
    }

    fn display_name_en(&self) -> &str {
        "Crowley Thoth Tarot (1944)"
    }

    fn version(&self) -> &str {
        "1.0.0"
    }

    fn author(&self) -> &str {
        "Aleister Crowley & Lady Frieda Harris"
    }

    fn court_hierarchy(&self) -> CourtHierarchy {
        CourtHierarchy::PrincessPrinceQueenKnight
    }

    fn supports_physical_reversals(&self) -> bool {
        // Thoth occult tradition avoids mechanical reversals, evaluating shadows via elemental dignities
        false
    }

    fn get_card(&self, canonical_id: u8) -> TarotResult<PolyDeckCard> {
        let base_card = CardDeck::get_by_id(canonical_id)?;

        // Thoth-specific Major Arcana renames and structural swaps
        let (display_number, name_zh, name_en, subtitle, astro, hebrew) = match canonical_id {
            0 => ("0".into(), "愚者".into(), "The Fool".into(), Some("The Spirit of Aethyr".into()), Some("Air / Uranus".into()), Some("Aleph (א)".into())),
            1 => ("I".into(), "贤者/麦琪".into(), "The Magus".into(), Some("The Magician of Power".into()), Some("Mercury".into()), Some("Beth (ב)".into())),
            2 => ("II".into(), "女祭司".into(), "The Priestess".into(), Some("Priestess of the Silver Star".into()), Some("Moon".into()), Some("Gimel (ג)".into())),
            3 => ("III".into(), "女皇".into(), "The Empress".into(), Some("Daughter of the Mighty Ones".into()), Some("Venus".into()), Some("Daleth (ד)".into())),
            4 => ("IV".into(), "皇帝".into(), "The Emperor".into(), Some("Sun of the Morning".into()), Some("Aries (צ path)".into()), Some("Tzaddi (צ)".into())),
            5 => ("V".into(), "教皇".into(), "The Hierophant".into(), Some("Magus of the Eternal Gods".into()), Some("Taurus".into()), Some("Vav (ו)".into())),
            6 => ("VI".into(), "恋人".into(), "The Lovers".into(), Some("Children of the Voice".into()), Some("Gemini".into()), Some("Zayin (ז)".into())),
            7 => ("VII".into(), "战车".into(), "The Chariot".into(), Some("Child of the Powers of Waters".into()), Some("Cancer".into()), Some("Cheth (ח)".into())),
            8 => ("VIII".into(), "调节".into(), "Adjustment".into(), Some("Balance of Nature".into()), Some("Libra (♎)".into()), Some("Lamed (ל)".into())),
            9 => ("IX".into(), "隐士".into(), "The Hermit".into(), Some("Magus of the Voice of Light".into()), Some("Virgo".into()), Some("Yod (י)".into())),
            10 => ("X".into(), "命运".into(), "Fortune".into(), Some("Lord of the Forces of Life".into()), Some("Jupiter".into()), Some("Kaph (כ)".into())),
            11 => ("XI".into(), "欲望".into(), "Lust".into(), Some("Babalon & The Beast".into()), Some("Leo (♌)".into()), Some("Teth (ט)".into())),
            12 => ("XII".into(), "倒吊人".into(), "The Hanged Man".into(), Some("Spirit of the Mighty Waters".into()), Some("Water / Neptune".into()), Some("Mem (מ)".into())),
            13 => ("XIII".into(), "死神".into(), "Death".into(), Some("Child of the Great Transformers".into()), Some("Scorpio".into()), Some("Nun (נ)".into())),
            14 => ("XIV".into(), "艺术".into(), "Art".into(), Some("Daughter of the Reconcilers".into()), Some("Sagittarius".into()), Some("Samekh (ס)".into())),
            15 => ("XV".into(), "恶魔".into(), "The Devil".into(), Some("Lord of the Gates of Matter".into()), Some("Capricorn".into()), Some("Ayin (ע)".into())),
            16 => ("XVI".into(), "高塔".into(), "The Tower".into(), Some("Lord of the Hosts of the Mighty".into()), Some("Mars".into()), Some("Peh (פ)".into())),
            17 => ("XVII".into(), "星星".into(), "The Star".into(), Some("Daughter of the Firmament".into()), Some("Aquarius (ה path)".into()), Some("Heh (ה)".into())),
            18 => ("XVIII".into(), "月亮".into(), "The Moon".into(), Some("Ruler of Flux & Reflux".into()), Some("Pisces".into()), Some("Qoph (ק)".into())),
            19 => ("XIX".into(), "太阳".into(), "The Sun".into(), Some("Lord of the Fire of the World".into()), Some("Sun".into()), Some("Resh (ר)".into())),
            20 => ("XX".into(), "新纪元".into(), "The Aeon".into(), Some("Spirit of the Flame of Horus".into()), Some("Fire / Pluto".into()), Some("Shin (ש)".into())),
            21 => ("XXI".into(), "宇宙".into(), "The Universe".into(), Some("The Great One of the Night of Time".into()), Some("Earth / Saturn".into()), Some("Tav (ת)".into())),
            _ => (
                format!("{}", canonical_id),
                base_card.name_zh.to_string(),
                base_card.name_en.to_string(),
                None,
                base_card.astrology.map(|s| s.to_string()),
                base_card.hebrew_letter.map(|s| s.to_string()),
            ),
        };

        Ok(PolyDeckCard {
            canonical_id,
            deck_family: DeckFamily::CrowleyThoth,
            key: format!("thoth_{:02}", canonical_id),
            arcana: base_card.arcana,
            element: base_card.element,
            display_number,
            display_name_zh: name_zh,
            display_name_en: name_en,
            subtitle,
            astrology_or_decan: astro,
            hebrew_letter: hebrew,
            keywords_upright: base_card.facets.general_upright.clone(),
            keywords_reversed: base_card.facets.general_reversed.clone(),
            shadow_aspect: base_card.facets.shadow_aspect.to_string(),
        })
    }

    fn all_cards(&self) -> Vec<PolyDeckCard> {
        (0..78).filter_map(|id| self.get_card(id).ok()).collect()
    }
}
