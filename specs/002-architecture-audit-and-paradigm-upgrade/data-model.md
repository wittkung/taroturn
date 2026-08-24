# Data Model & Domain Entities: Architecture Upgrade (v2)

- **Feature ID**: `002-architecture-audit-and-paradigm-upgrade`
- **Target**: `taroturn-core` (Rust), `taroturn-server` (PostgreSQL / Kotlin)
- **Status**: `DESIGN APPROVED`

---

## 1. Core Rust Domain Entities (`taroturn-core`)

### 1.1 `StaticCardDefinition` & `Card`
```rust
pub struct StaticCardFacets {
    pub general_upright: &'static [&'static str],
    pub general_reversed: &'static [&'static str],
    pub love_upright: &'static str,
    pub love_reversed: &'static str,
    pub career_upright: &'static str,
    pub career_reversed: &'static str,
    pub spiritual_upright: &'static str,
    pub spiritual_reversed: &'static str,
    pub shadow_aspect: &'static str,
}

pub struct StaticCardDefinition {
    pub id: u8,
    pub key: &'static str,
    pub arcana: ArcanaType,
    pub suit: Option<Suit>,
    pub rank: Option<Rank>,
    pub element: Element,
    pub name_en: &'static str,
    pub name_zh: &'static str,
    pub astrology: Option<&'static str>,
    pub hebrew_letter: Option<&'static str>,
    pub facets: StaticCardFacets,
}
```

### 1.2 `SlotConstraint` (Enhanced)
```rust
pub enum SlotConstraint {
    Any,
    MajorOnly,
    MinorOnly,
    WandsOnly,
    CupsOnly,
    SwordsOnly,
    PentaclesOnly,
    CourtOnly,
    PipOnly,
}
```

### 1.3 `SlotRelationType` & `SlotEdge` (Topological DAG)
```rust
pub enum SlotRelationType {
    Crosses,
    FlowsTo,
    Supports,
    Illuminates,
    Opposes,
    Synthesizes,
    Reflects,
}

pub struct SlotEdge {
    pub source_slot_id: u8,
    pub target_slot_id: u8,
    pub relation: SlotRelationType,
    pub weight: f32,
}

pub struct Spread {
    pub id: String,
    pub name_en: String,
    pub name_zh: String,
    pub description: String,
    pub category: SpreadCategory,
    pub slots: Vec<SpreadSlot>,
    pub edges: Vec<SlotEdge>,
}
```

### 1.4 `PairwiseDignity` & `ElementalDignityAnalysis`
```rust
pub enum ElementalAffinity {
    FriendlyActive,       // Fire + Air (+0.9)
    FriendlyPassive,      // Water + Earth (+0.9)
    Intensified,          // Same Element (+0.6)
    ContradictoryHostile, // Fire + Water / Air + Earth (-0.9)
    NeutralModifying,     // Fire + Earth / Water + Air (+0.2)
    Undefined,
}

pub enum DignityStatus {
    WellDignified,
    IllDignified,
    NeutralDignified,
}

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

pub struct ElementalDignityAnalysis {
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
```

---

## 2. Server Security & Principal Model (`taroturn-server`)

### 2.1 `UserPrincipal` (Spring Security `UserDetails`)
- `id`: `UUID` (Authenticated User ID from JWT Subject)
- `tier`: `UserTier` (`FREE`, `PRO_MONTHLY`, `PRO_ANNUAL`, `PRO_LIFETIME`)
- `nickname`: `String`
- `authorities`: `Collection<GrantedAuthority>` (`ROLE_FREE`, `ROLE_PRO`)

### 2.2 `ReadingSessionEntity` (PostgreSQL)
- `id`: `UUID` (Primary Key)
- `user_id`: `UUID` (Foreign Key $\to$ `users.id`)
- `spread_id`: `VARCHAR(64)`
- `question`: `TEXT`
- `rng_seed`: `VARCHAR(128)`
- `reversal_probability`: `REAL`
- `placed_cards`: `JSONB`
- `dignity_analysis`: `JSONB` (Stores full `ElementalDignityAnalysis` with pairwise tensors)
- `ai_interpretation`: `JSONB`
- `created_at`: `TIMESTAMPTZ`
