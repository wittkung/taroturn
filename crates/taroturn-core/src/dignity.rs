use serde::{Deserialize, Serialize};
use crate::card::{ArcanaType, CardDeck, Element};
use crate::error::TarotResult;
use crate::session::PlacedCard;
use crate::shuffling::DrawnCard;
use crate::spread::{SlotRelationType, Spread};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize, uniffi::Enum)]
pub enum DominantElement {
    Fire,
    Water,
    Air,
    Earth,
    Balanced,
    None,
}

impl DominantElement {
    pub fn name_zh(&self) -> &'static str {
        match self {
            DominantElement::Fire => "火象主导 (行动/激情)",
            DominantElement::Water => "水象主导 (情感/直觉)",
            DominantElement::Air => "风象主导 (心智/沟通)",
            DominantElement::Earth => "土象主导 (现实/物质)",
            DominantElement::Balanced => "四元素均衡",
            DominantElement::None => "无元素特征",
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize, uniffi::Enum)]
pub enum ElementalAffinity {
    FriendlyActive,       // Fire + Air (+0.9)
    FriendlyPassive,      // Water + Earth (+0.9)
    Intensified,          // Same Element (+0.6)
    ContradictoryHostile, // Fire + Water / Air + Earth (-0.9)
    NeutralModifying,     // Fire + Earth / Water + Air (+0.2)
    Undefined,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize, uniffi::Enum)]
pub enum DignityStatus {
    WellDignified,
    IllDignified,
    NeutralDignified,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, uniffi::Record)]
pub struct PairwiseDignity {
    pub source_slot_id: u8,
    pub target_slot_id: u8,
    pub source_card_id: u8,
    pub target_card_id: u8,
    pub relation: SlotRelationType,
    pub source_element: Element,
    pub target_element: Element,
    pub affinity: ElementalAffinity,
    pub dignity_status: DignityStatus,
    pub tension_score: f32,
    pub dynamic_summary_zh: String,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, uniffi::Record)]
pub struct ElementalDignitySummary {
    pub fire_ratio: f32,
    pub water_ratio: f32,
    pub air_ratio: f32,
    pub earth_ratio: f32,
    pub major_ratio: f32,
    pub reversed_ratio: f32,
    pub dominant_element: DominantElement,
    pub shadow_card_id: Option<u8>,
    pub pairwise_dignities: Vec<PairwiseDignity>,
    pub overall_harmony_score: f32,
    pub balance_description_zh: String,
}

pub struct DignityCalculator;

impl DignityCalculator {
    pub fn calculate_affinity(elem_a: Element, elem_b: Element) -> (ElementalAffinity, f32) {
        use Element::*;
        match (elem_a, elem_b) {
            (Fire, Air) | (Air, Fire) => (ElementalAffinity::FriendlyActive, 0.9),
            (Water, Earth) | (Earth, Water) => (ElementalAffinity::FriendlyPassive, 0.9),
            (Fire, Fire) | (Water, Water) | (Air, Air) | (Earth, Earth) => {
                (ElementalAffinity::Intensified, 0.6)
            }
            (Fire, Water) | (Water, Fire) | (Air, Earth) | (Earth, Air) => {
                (ElementalAffinity::ContradictoryHostile, -0.9)
            }
            (Fire, Earth) | (Earth, Fire) | (Water, Air) | (Air, Water) => {
                (ElementalAffinity::NeutralModifying, 0.2)
            }
            _ => (ElementalAffinity::Undefined, 0.0),
        }
    }

    pub fn evaluate(drawn_cards: &[DrawnCard]) -> ElementalDignitySummary {
        if drawn_cards.is_empty() {
            return ElementalDignitySummary {
                fire_ratio: 0.0,
                water_ratio: 0.0,
                air_ratio: 0.0,
                earth_ratio: 0.0,
                major_ratio: 0.0,
                reversed_ratio: 0.0,
                dominant_element: DominantElement::None,
                shadow_card_id: None,
                pairwise_dignities: Vec::new(),
                overall_harmony_score: 0.0,
                balance_description_zh: "未抽取任何卡牌".into(),
            };
        }

        let total = drawn_cards.len() as f32;
        let mut fire_count = 0;
        let mut water_count = 0;
        let mut air_count = 0;
        let mut earth_count = 0;
        let mut major_count = 0;
        let mut reversed_count = 0;
        let mut total_card_sum: u32 = 0;

        for drawn in drawn_cards {
            if let Ok(card) = CardDeck::get_by_id(drawn.card_id) {
                match card.element {
                    Element::Fire => fire_count += 1,
                    Element::Water => water_count += 1,
                    Element::Air => air_count += 1,
                    Element::Earth => earth_count += 1,
                    _ => {}
                }
                if card.arcana == ArcanaType::Major {
                    major_count += 1;
                    total_card_sum += card.id as u32;
                } else if let Some(rank) = card.rank {
                    total_card_sum += (rank as u32).min(10);
                }
            }
            if drawn.orientation.is_reversed() {
                reversed_count += 1;
            }
        }

        let fire_ratio = fire_count as f32 / total;
        let water_ratio = water_count as f32 / total;
        let air_ratio = air_count as f32 / total;
        let earth_ratio = earth_count as f32 / total;
        let major_ratio = major_count as f32 / total;
        let reversed_ratio = reversed_count as f32 / total;

        let counts = [
            (fire_count, DominantElement::Fire),
            (water_count, DominantElement::Water),
            (air_count, DominantElement::Air),
            (earth_count, DominantElement::Earth),
        ];

        let max_elem = counts.iter().max_by_key(|(c, _)| *c).unwrap();
        let dominant_element = if max_elem.0 == 0 {
            DominantElement::None
        } else {
            let max_occurrences = counts.iter().filter(|(c, _)| *c == max_elem.0).count();
            if max_occurrences > 1 && max_elem.0 * 2 <= drawn_cards.len() {
                DominantElement::Balanced
            } else {
                max_elem.1
            }
        };

        let shadow_card_id = if total_card_sum == 0 {
            Some(0)
        } else {
            let mut sum = total_card_sum;
            while sum > 21 {
                let mut digit_sum = 0;
                while sum > 0 {
                    digit_sum += sum % 10;
                    sum /= 10;
                }
                sum = digit_sum;
            }
            Some(sum as u8)
        };

        let balance_description_zh = format!(
            "元素分布：火 {:.0}% | 水 {:.0}% | 风 {:.0}% | 土 {:.0}%；大牌占比：{:.0}%，逆位占比：{:.0}%",
            fire_ratio * 100.0,
            water_ratio * 100.0,
            air_ratio * 100.0,
            earth_ratio * 100.0,
            major_ratio * 100.0,
            reversed_ratio * 100.0
        );

        ElementalDignitySummary {
            fire_ratio,
            water_ratio,
            air_ratio,
            earth_ratio,
            major_ratio,
            reversed_ratio,
            dominant_element,
            shadow_card_id,
            pairwise_dignities: Vec::new(),
            overall_harmony_score: 0.0,
            balance_description_zh,
        }
    }

    pub fn evaluate_spread_session(
        spread: &Spread,
        placed_cards: &[PlacedCard],
    ) -> TarotResult<ElementalDignitySummary> {
        let drawn_cards: Vec<DrawnCard> = placed_cards.iter().map(|p| p.drawn_card).collect();
        let mut summary = Self::evaluate(&drawn_cards);

        let mut pairwise_dignities = Vec::with_capacity(spread.edges.len());
        let mut weighted_tension_sum = 0.0f32;
        let mut total_weight = 0.0f32;

        for edge in &spread.edges {
            let src_placed = placed_cards.iter().find(|p| p.slot_id == edge.source_slot_id);
            let tgt_placed = placed_cards.iter().find(|p| p.slot_id == edge.target_slot_id);

            if let (Some(src), Some(tgt)) = (src_placed, tgt_placed) {
                let card_a = CardDeck::get_by_id(src.drawn_card.card_id)?;
                let card_b = CardDeck::get_by_id(tgt.drawn_card.card_id)?;

                let (affinity, base_tension) = Self::calculate_affinity(card_a.element, card_b.element);

                let rev_penalty = match (
                    src.drawn_card.orientation.is_reversed(),
                    tgt.drawn_card.orientation.is_reversed(),
                ) {
                    (false, false) => 1.0,
                    (true, false) | (false, true) => 0.6,
                    (true, true) => -0.5,
                };

                let tension_score = (base_tension * rev_penalty).clamp(-1.0, 1.0);
                let dignity_status = if tension_score > 0.3 {
                    DignityStatus::WellDignified
                } else if tension_score < -0.2 {
                    DignityStatus::IllDignified
                } else {
                    DignityStatus::NeutralDignified
                };

                let src_slot = spread.slots.iter().find(|s| s.slot_id == edge.source_slot_id);
                let tgt_slot = spread.slots.iter().find(|s| s.slot_id == edge.target_slot_id);
                let src_title = src_slot.map(|s| s.title_zh.as_str()).unwrap_or("位置A");
                let tgt_title = tgt_slot.map(|s| s.title_zh.as_str()).unwrap_or("位置B");

                let dynamic_summary_zh = format!(
                    "[{}] {} ({}) 与 [{}] {} ({}) 尊位张力: {:.2}",
                    src_title,
                    card_a.name_zh,
                    card_a.element.name_zh(),
                    tgt_title,
                    card_b.name_zh,
                    card_b.element.name_zh(),
                    tension_score
                );

                pairwise_dignities.push(PairwiseDignity {
                    source_slot_id: edge.source_slot_id,
                    target_slot_id: edge.target_slot_id,
                    source_card_id: card_a.id,
                    target_card_id: card_b.id,
                    relation: edge.relation,
                    source_element: card_a.element,
                    target_element: card_b.element,
                    affinity,
                    dignity_status,
                    tension_score,
                    dynamic_summary_zh,
                });

                weighted_tension_sum += tension_score * edge.weight;
                total_weight += edge.weight;
            }
        }

        summary.pairwise_dignities = pairwise_dignities;
        summary.overall_harmony_score = if total_weight > 0.0 {
            (weighted_tension_sum / total_weight).clamp(-1.0, 1.0)
        } else {
            0.0
        };

        Ok(summary)
    }
}
