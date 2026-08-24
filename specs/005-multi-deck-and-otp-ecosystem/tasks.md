# Tasks: Multi-Deck Historical Engine & Open Tarot Package (OTP) Ecosystem

- **Feature ID**: `005-multi-deck-and-otp-ecosystem`
- **Specification**: [spec.md](./spec.md)
- **Plan**: [plan.md](./plan.md)
- **Data Model**: [data-model.md](./data-model.md)
- **Contracts**: [contracts/](./contracts)
- **Status**: `COMPLETED`

---

## Phase 1: Core Trait & Registry Foundation

- [x] T001 Define `TarotDeckSystem` trait and `DeckRegistry` in `crates/taroturn-core/src/deck_system.rs`
- [x] T002 [P] Implement `RwsDeckSystem` as default static provider in `crates/taroturn-core/src/rws_deck.rs`
- [x] T003 [P] Export new module and maintain backward-compatibility aliases in `crates/taroturn-core/src/lib.rs`

---

## Phase 2: User Story 1 - Thoth & Marseille Concrete Implementations

**Goal**: Deliver authentic Crowley Thoth and Tarot de Marseille deck implementations with zero-heap static tables.
**Independent Test Criteria**: Thoth Card #8 is Adjustment (Libra ♎) and #11 is Lust (Leo ♌); Marseille cards render with historic French titles and numerological keywords.

- [x] T004 [US1] Implement `ThothDeckSystem` with 36 decanic titles and YHVH court in `crates/taroturn-core/src/thoth_deck.rs`
- [x] T005 [P] [US1] Implement `MarseilleDeckSystem` with historic French titles and non-scenic pips in `crates/taroturn-core/src/marseille_deck.rs`
- [x] T006 [P] [US1] Add multi-deck parity and dignity unit test suite in `crates/taroturn-core/tests/multi_deck_parity_test.rs`

---

## Phase 3: User Story 2 - Open Tarot Package (OTP v1.0) ZIP Parser

**Goal**: Support importing and dynamically registering third-party `.otp` archives with ZipSlip protection.
**Independent Test Criteria**: Valid `.otp` ZIP packages register 78 cards and palette in $<50\text{ms}$; malformed or path-traversing archives are safely rejected.

- [x] T007 [US2] Add `zip` crate dependency to `crates/taroturn-core/Cargo.toml`
- [x] T008 [P] [US2] Implement `OtpDeckLoader` with ZipSlip protection and manifest validation in `crates/taroturn-core/src/otp_loader.rs`
- [x] T009 [US2] Implement `OtpDynamicDeckSystem` in `crates/taroturn-core/src/otp_deck.rs`

---

## Phase 4: User Story 3 - Multi-Platform UI Palette & Deck Switcher

**Goal**: Enable dynamic deck switching across Web, Mini Program, and Apple Native clients.
**Independent Test Criteria**: Web and Mini Program dropdown switches active deck without page reload.

- [x] T010 [P] [US3] Expose multi-deck WASM / TS definitions in `apps/taroturn-app/src/types/deck.ts`
- [x] T011 [US3] Implement visual Deck Switcher dropdown in `apps/taroturn-app/src/components/DeckSelector.tsx`

---

## Phase 5: Verification & Polish

- [x] T012 Run full cargo workspace tests and multi-deck parity test suite
- [x] T013 Verify web app build and type check

---

## Dependencies & Execution Strategy

```
Phase 1 (Core Trait & Registry) ──► Phase 2 (Thoth & Marseille Implementations)
                                           │
             ┌─────────────────────────────┴─────────────────────────────┐
             ▼                                                           ▼
Phase 3 (OTP v1.0 ZIP Loader)                              Phase 4 (Multi-Platform UI Palette)
             │                                                           │
             └─────────────────────────────┬─────────────────────────────┘
                                           ▼
                            Phase 5 (Verification & Polish)
```
