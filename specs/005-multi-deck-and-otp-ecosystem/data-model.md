# Data Model: Multi-Deck & Open Tarot Package Entities

- **Feature ID**: `005-multi-deck-and-otp-ecosystem`
- **Specification**: [spec.md](./spec.md)
- **Status**: `COMPLETED`

---

## 1. Domain Entities & Rust Structures

### 1.1 `PolyDeckCard` Entity

| Field | Type | Description |
| :--- | :--- | :--- |
| `canonical_id` | `u8` | Global index $0 \dots 77$ |
| `deck_family` | `DeckFamily` | `RWS`, `Thoth`, `Marseille`, `Custom` |
| `key` | `String` | Stable unique identifier (e.g. `thoth_08_adjustment`) |
| `arcana` | `ArcanaType` | `Major` or `Minor` |
| `element` | `Element` | `Fire`, `Water`, `Air`, `Earth` |
| `display_number` | `String` | `0`, `VIII`, `XI`, `IIII de Bâtons`, `Lord of Ruin` |
| `display_name_zh` | `String` | Localized Chinese name |
| `display_name_en` | `String` | Localized English name |
| `subtitle` | `Option<String>` | Esoteric title (e.g. `Lord of Dominion`) |
| `keywords_upright` | `Vec<String>` | Upright meanings |
| `keywords_reversed` | `Vec<String>` | Reversed meanings |
| `shadow_aspect` | `String` | Subconscious shadow tension |

---

### 1.2 `OtpManifest` Entity (from `manifest.json`)

| Field | Type | Description |
| :--- | :--- | :--- |
| `otp_version` | `String` | e.g. `1.0.0` |
| `uuid` | `String` | Unique package UUID |
| `slug` | `String` | URL friendly slug |
| `name` | `String` | Package display name |
| `family` | `String` | `rws`, `thoth`, `marseille`, `custom` |
| `author` | `String` | Artist / Author |
| `court_hierarchy` | `String` | Court mapping rule |
| `cards` | `Vec<OtpCardDefinition>` | Exact 78 card definition entries |

---

### 1.3 `OtpPalette` Entity (from `palette.json`)

| Field | Type | Description |
| :--- | :--- | :--- |
| `theme_id` | `String` | Theme identifier |
| `surface_background` | `String` | Hex color code |
| `card_rim_border` | `String` | Hex color code |
| `card_glow_primary` | `String` | Hex color with alpha |
| `particle_density` | `u32` | Visual particle count |
