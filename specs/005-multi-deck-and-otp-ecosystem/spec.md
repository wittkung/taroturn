# Feature Specification: Multi-Deck Historical Engine & Open Tarot Package (OTP) Ecosystem

- **Feature ID**: `005-multi-deck-and-otp-ecosystem`
- **Pipeline Mode**: `[Full SDD]`
- **Status**: `SPECIFY DRAFT`
- **Author**: Antigravity / CTO Persona
- **Target Branch**: `main`

---

## 1. Executive Summary & User Value

Taroturn bridges the historical schisms in occult tarot by introducing a unified, polymorphic multi-deck architecture:
1. **Three Canonical Historical Traditions**:
   - **Rider-Waite-Smith (RWS 1909)**: Scenic narrative pips, Golden Dawn VIII Strength / XI Justice sequence, classical Page-Knight-Queen-King court, full upright/reversed duality.
   - **Crowley Thoth (1944)**: Non-Euclidean Sacred Geometry, restored VIII Adjustment / XI Lust, Crowley-Harris Tree of Life path switch (Tzaddi-Heh), Princess-Prince-Queen-Knight court, 36 astrological decanic titles, dignity-driven shadow analysis with physical reversals disabled.
   - **Tarot de Marseille (TdM 1760)**: Renaissance woodcut tradition, non-scenic geometric pip numerology, historic titles (La Papesse, Le Pape, La Maison Dieu, Le Mat), French nomenclature.
2. **Open Tarot Package (OTP v1.0) Standard**:
   - An open, sandboxed ZIP-based container format (`.otp` / `.tarot`) containing `manifest.json`, `palette.json`, WebP image pyramids, custom audio cues, and cryptographic signature validation.
3. **Multi-Platform Dynamic Deck Switching**:
   - Seamless deck switching and custom OTP package importing across Rust CLI, Web SPA, WeChat Mini Program, and Apple SwiftUI native clients.

---

## 2. User Stories & Acceptance Scenarios

### User Story 1 (P1): Native Crowley Thoth & Marseille Deck Switching
> **As a** seasoned occult practitioner or esoteric scholar,  
> **I want to** select and practice using the Crowley Thoth or Tarot de Marseille deck with authentic card hierarchies and astrological decan titles,  
> **So that** I am not forced into modern RWS simplifications.

- **Scenario 1.1 (Thoth Deck Archetypal Parity)**:
  - *Given* the active deck system is switched to `CrowleyThoth`,
  - *When* querying Card #8 and Card #11,
  - *Then* Card #8 returns "Adjustment (调节)" with Libra ♎ correspondence, and Card #11 returns "Lust (欲望)" with Leo ♌ correspondence.
- **Scenario 1.2 (Thoth 4-Tier Court Dynamic Dignity)**:
  - *Given* a reading drawn with the Thoth system,
  - *When* calculating elemental dignities for Knight of Wands and Prince of Cups,
  - *Then* the Knight is treated as Pure Fire ($Yod$) and Prince as Air ($Vav$), rather than classical RWS rankings.
- **Scenario 1.3 (Tarot de Marseille Numerological Pips)**:
  - *Given* the active deck system is switched to `TarotDeMarseille`,
  - *When* drawing Minor Arcana,
  - *Then* cards render with French titles (e.g. *IIII de Bâtons*) and numerological progression keywords.

---

### User Story 2 (P1): Open Tarot Package (OTP v1.0) Import & Dynamic Assembly
> **As an** artist, tarot creator, or seeker,  
> **I want to** drag and drop a custom `.otp` ZIP package into the app,  
> **So that** the application instantly renders my custom artwork, UI palette, card meanings, and soundscapes with complete sandboxed safety.

- **Scenario 2.1 (Valid OTP Import)**:
  - *Given* a valid `cyberpunk_tarot.otp` archive containing `manifest.json` and 78 WebP assets,
  - *When* imported via `OtpDeckLoader::load_from_file`,
  - *Then* the deck is registered in `DeckRegistry` with sub-50ms parse time and available across all reading sessions.
- **Scenario 2.2 (ZipSlip & Security Guard)**:
  - *Given* a malicious ZIP archive containing `../` path traversal entries or exceeding 200MB uncompressed,
  - *When* loading is attempted,
  - *Then* the loader rejects the package with `OtpSecurityViolation` without touching the host filesystem.

---

### User Story 3 (P2): Multi-Deck Multi-Platform UI Palette Synchronization
> **As a** user switching between medieval Marseille, gold-foil Thoth, and cyberpunk custom decks,  
> **I want the** UI rim borders, particle glow, and ambient lighting to dynamically adapt to the deck's `palette.json`,  
> **So that** the aesthetic immersion matches the archetype.

- **Scenario 3.1 (Dynamic UI Palette Broadcast)**:
  - *Given* a deck loaded with `palette.json`,
  - *When* the active deck changes,
  - *Then* Web CSS variables, SwiftUI environment tokens, and Mini Program canvas shaders update instantly.

---

## 3. Functional Requirements (FR-###)

- **FR-001**: `taroturn-core` MUST define the `TarotDeckSystem` trait and `DeckRegistry` registry supporting dynamic deck lookup.
- **FR-002**: `taroturn-core` MUST implement `RwsDeckSystem`, `ThothDeckSystem`, and `MarseilleDeckSystem` with zero-allocation static registries.
- **FR-003**: `taroturn-core` MUST implement `OtpDeckLoader` parsing OTP v1.0 ZIP archives with ZipSlip path traversal protection.
- **FR-004**: The system MUST support Thoth-specific reversal policy (`supports_physical_reversals() == false` using elemental dignity tension instead).
- **FR-005**: The system MUST export UniFFI bindings and WASM endpoints for `list_available_decks`, `get_active_deck`, `set_active_deck`, and `load_otp_archive`.
- **FR-006**: `apps/taroturn-app` and native clients MUST provide a visual Deck Switcher dropdown and OTP file importer.

---

## 4. Success Criteria (SC-###)

- **SC-001**: 100% backward compatibility with existing tests and reading sessions (`CardDeck::standard_78()` delegates seamlessly to `RwsDeckSystem`).
- **SC-002**: Parsing and registering an OTP archive containing 78 cards executes in $<50\text{ms}$ on mobile hardware.
- **SC-003**: Zero memory leaks or unsafe path traversals during malformed ZIP archive processing.
