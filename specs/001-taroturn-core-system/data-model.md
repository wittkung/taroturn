# Data Model & Domain Entities: Taroturn System

- **Feature ID**: `001-taroturn-core-system`
- **Target**: `taroturn-core` (Rust), `taroturn-server` (PostgreSQL / Kotlin)
- **Status**: `DESIGN APPROVED`

---

## 1. Domain Entities (`taroturn-core`)

### 1.1 `Card`
Represents an individual Tarot card archetype in the catalog.
- **`id`** (`u8`, range $0 \dots 77$): Unique standard index.
- **`key`** (`String`): Identifier key (e.g. `major_00_fool`, `minor_wands_01_ace`, `minor_cups_king`).
- **`arcana`** (`ArcanaType`): `Major` (22) | `Minor` (56).
- **`suit`** (`Option<Suit>`): `None` (Major) | `Some(Wands | Cups | Swords | Pentacles)`.
- **`rank`** (`Option<Rank>`): `None` (Major) | `Some(Ace | R2..R10 | Page | Knight | Queen | King)`.
- **`element`** (`Element`): `Fire` | `Water` | `Air` | `Earth` | `Spirit` | `None`.
- **`name_en`** (`String`): English title (e.g. "The Fool", "Ace of Cups").
- **`name_zh`** (`String`): Chinese title (e.g. "愚者", "圣杯一").
- **`astrology`** (`Option<String>`): Astrological correspondence (e.g. "Uranus / Air", "Aries").
- **`hebrew_letter`** (`Option<String>`): Kabbalistic letter (e.g. "Aleph").
- **`facets`** (`CardFacets`):
  - `general_upright`: `Vec<String>` (Keywords)
  - `general_reversed`: `Vec<String>`
  - `love_upright`: `String`
  - `love_reversed`: `String`
  - `career_upright`: `String`
  - `career_reversed`: `String`
  - `spiritual_upright`: `String`
  - `spiritual_reversed`: `String`
  - `shadow_aspect`: `String`

### 1.2 `CardOrientation` & `DrawnCard`
- **`orientation`** (`Orientation`): `Upright` (0) | `Reversed` (1).
- **`DrawnCard`**:
  - `card_id`: `u8`
  - `orientation`: `Orientation`
  - `draw_sequence`: `u8` (0-indexed order of selection)

### 1.3 `Spread` & `SpreadSlot`
- **`Spread`**:
  - `id`: `String` (e.g. `celtic_cross`, `three_cards_time`, `horseshoe_7`)
  - `name_en`: `String`
  - `name_zh`: `String`
  - `description`: `String`
  - `category`: `SpreadCategory` (`Daily` | `Decision` | `Relationship` | `Comprehensive` | `Custom`)
  - `slots`: `Vec<SpreadSlot>`
- **`SpreadSlot`**:
  - `slot_id`: `u8`
  - `title_en`: `String`
  - `title_zh`: `String`
  - `meaning_prompt`: `String` (e.g. "Current underlying emotional challenge")
  - `x`: `f32` (Normalized canvas X coordinate $[0.0, 1.0]$ or pixel offset)
  - `y`: `f32` (Normalized canvas Y coordinate $[0.0, 1.0]$ or pixel offset)
  - `rotation_deg`: `f32` (e.g. 0.0, 90.0 for crossing card)
  - `z_index`: `i16`
  - `constraint`: `SlotConstraint` (`Any` | `MajorOnly` | `MinorOnly` | `SpecificSuit(Suit)`)

### 1.4 `ReadingSession` (Local & Memory Model)
- **`session_id`** (`String` / UUIDv7): Unique session identifier.
- **`created_at`** (`i64`): Milliseconds epoch timestamp.
- **`spread_id`** (`String`): Identifier of the active spread.
- **`question`** (`Option<String>`): User's inquiry / focus context.
- **`rng_seed`** (`String`): 64-char Hex encoded ChaCha20 seed.
- **`reversal_probability`** (`f32`): $P_{rev} \in [0.0, 1.0]$.
- **`slots`** (`Vec<PlacedCard>`):
  - `slot_id`: `u8`
  - `drawn_card`: `DrawnCard`
- **`dignity_summary`** (`ElementalDignitySummary`):
  - `fire_ratio`: `f32`
  - `water_ratio`: `f32`
  - `air_ratio`: `f32`
  - `earth_ratio`: `f32`
  - `major_ratio`: `f32`
  - `reversed_ratio`: `f32`
  - `dominant_element`: `Element`
  - `shadow_card_id`: `Option<u8>` (Numerological reduction card)
- **`user_notes`** (`Option<String>`): Personal reflection.

---

## 2. Relational Database Schema (`taroturn-server` PostgreSQL)

```sql
-- Enable vector extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wechat_openid VARCHAR(64) UNIQUE,
    wechat_unionid VARCHAR(64) UNIQUE,
    apple_sub VARCHAR(128) UNIQUE,
    email VARCHAR(255) UNIQUE,
    nickname VARCHAR(100) NOT NULL DEFAULT 'Seeker',
    avatar_url TEXT,
    tier VARCHAR(20) NOT NULL DEFAULT 'FREE', -- FREE, PRO_MONTHLY, PRO_ANNUAL, PRO_LIFETIME
    tier_expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Reading Sessions Table
CREATE TABLE reading_sessions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    spread_id VARCHAR(64) NOT NULL,
    question TEXT,
    rng_seed VARCHAR(128) NOT NULL,
    reversal_probability REAL NOT NULL DEFAULT 0.5,
    placed_cards JSONB NOT NULL,
    dignity_analysis JSONB NOT NULL,
    ai_interpretation JSONB,
    user_notes TEXT,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    embedding vector(1536) -- For semantic search on question + interpretation
);

CREATE INDEX idx_reading_sessions_user_time ON reading_sessions(user_id, created_at DESC);
CREATE INDEX idx_reading_sessions_spread ON reading_sessions(spread_id);

-- Custom Spreads Table (Pro Feature)
CREATE TABLE custom_spreads (
    id VARCHAR(64) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name_en VARCHAR(100) NOT NULL,
    name_zh VARCHAR(100) NOT NULL,
    description TEXT,
    slots_definition JSONB NOT NULL,
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Share Tokens Table
CREATE TABLE share_tokens (
    token VARCHAR(64) PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES reading_sessions(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ,
    view_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 3. State Lifecycle & Sync Machine

```
[Local Idle] 
     |
     v (User initiates draw)
[Shuffling with ChaCha20 Seed] 
     |
     v (Cards drawn into spread DAG slots)
[Deterministic Spread Placed] 
     |
     v (Calculate elemental dignities & shadow cards)
[Local Interpretation Ready (Offline Complete)]
     |
     +---- [Sync to Cloud (When Online)] ----> [PostgreSQL Appended & Vectorized]
     |
     +---- [Request Pro AI Deep Reading] ----> [LLM Structured Synthesis Generated]
```
