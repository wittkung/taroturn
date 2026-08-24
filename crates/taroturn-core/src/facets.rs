use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, uniffi::Record)]
pub struct CardFacets {
    pub general_upright: Vec<String>,
    pub general_reversed: Vec<String>,
    pub love_upright: String,
    pub love_reversed: String,
    pub career_upright: String,
    pub career_reversed: String,
    pub spiritual_upright: String,
    pub spiritual_reversed: String,
    pub shadow_aspect: String,
}

impl CardFacets {
    pub fn new(
        general_upright: &[&str],
        general_reversed: &[&str],
        love_upright: &str,
        love_reversed: &str,
        career_upright: &str,
        career_reversed: &str,
        spiritual_upright: &str,
        spiritual_reversed: &str,
        shadow_aspect: &str,
    ) -> Self {
        Self {
            general_upright: general_upright.iter().map(|s| s.to_string()).collect(),
            general_reversed: general_reversed.iter().map(|s| s.to_string()).collect(),
            love_upright: love_upright.to_string(),
            love_reversed: love_reversed.to_string(),
            career_upright: career_upright.to_string(),
            career_reversed: career_reversed.to_string(),
            spiritual_upright: spiritual_upright.to_string(),
            spiritual_reversed: spiritual_reversed.to_string(),
            shadow_aspect: shadow_aspect.to_string(),
        }
    }
}
