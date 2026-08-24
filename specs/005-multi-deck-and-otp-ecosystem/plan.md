# Implementation Plan: Multi-Deck Historical Engine & OTP Ecosystem

- **Feature ID**: `005-multi-deck-and-otp-ecosystem`
- **Specification**: [spec.md](./spec.md)
- **Data Model**: [data-model.md](./data-model.md)
- **Research**: [research.md](./research.md)
- **Contracts**: [contracts/](./contracts)
- **Quickstart**: [quickstart.md](./quickstart.md)
- **Status**: `PLANNING`

---

## 1. Technical Architecture & Component Structure

```
                                  ┌─────────────────────────────────────┐
                                  │      taroturn-core (Rust 2021)      │
                                  │         TarotDeckSystem Trait       │
                                  └──────────────────┬──────────────────┘
                                                     │
             ┌───────────────────────────────┬───────┴───────────────────────┬───────────────────────────────┐
             ▼                               ▼                               ▼                               ▼
  ┌──────────────────────┐       ┌──────────────────────┐       ┌──────────────────────┐       ┌─────────────────────────────┐
  │    RwsDeckSystem     │       │   ThothDeckSystem    │       │ MarseilleDeckSystem  │       │    OtpDynamicDeckSystem     │
  │ • 78 Static Cards    │       │ • VIII Adjustment    │       │ • Renaissance French │       │ • Sandboxed ZIP Parser      │
  │ • Classical RWS      │       │ • XI Lust            │       │ • Non-scenic Pips    │       │ • manifest.json + WebP      │
  │ • Page-Knight-Q-King │       │ • Princess-Prince-Q-K│       │ • Numerology Dignity │       │ • palette.json Dynamic UI   │
  └──────────────────────┘       └──────────────────────┘       └──────────────────────┘       └─────────────────────────────┘
             │                               │                               │                               │
             └───────────────────────────────┼───────────────────────────────┴───────────────────────────────┘
                                             ▼
                               ┌─────────────────────────────┐
                               │        DeckRegistry         │
                               │  Global Singleton Registry  │
                               └─────────────┬───────────────┘
                                             │
             ┌───────────────────────────────┴───────────────────────────────┐
             ▼                                                               ▼
  ┌──────────────────────┐                                       ┌──────────────────────┐
  │   UniFFI Bindings    │                                       │     WASM Bindings    │
  │ • Swift 6 Native     │                                       │ • Web / MiniProgram  │
  │ • Kotlin Native      │                                       │ • TypeScript TS SSOT │
  └──────────────────────┘                                       └──────────────────────┘
```

---

## 2. Implementation Phases

### Phase 1: Core Trait & Registry Foundation
- Implement `TarotDeckSystem` trait and `DeckRegistry` in `crates/taroturn-core/src/deck_system.rs`.
- Implement `RwsDeckSystem` refactoring existing cards into static singleton.
- Update `crates/taroturn-core/src/lib.rs` exports.

### Phase 2: User Story 1 - Thoth & Marseille Concrete Implementations
- Implement `ThothDeckSystem` with VIII Adjustment, XI Lust, 4-tier court (Princess/Prince/Queen/Knight), and 36 decanic titles.
- Implement `MarseilleDeckSystem` with historic Conver 1760 nomenclature and non-scenic numerological pip keywords.
- Add unit tests verifying deck parity and dignity differences.

### Phase 3: User Story 2 - Open Tarot Package (OTP v1.0) ZIP Parser
- Add `zip` crate to `crates/taroturn-core/Cargo.toml`.
- Implement `OtpDeckLoader` in `crates/taroturn-core/src/otp_loader.rs` with ZipSlip protection and manifest validation.
- Implement `OtpDynamicDeckSystem` rendering dynamic OTP cards in memory.

### Phase 4: User Story 3 - Multi-Platform UI Palette & Deck Switcher
- Update UniFFI bindings in `crates/taroturn-core/src/taroturn_core.udl` / proc macros.
- Update `apps/taroturn-app` Web client with Deck Selector dropdown and OTP dropzone.
- Update `apps/taroturn-miniprogram` and `apps/taroturn-apple` with deck registry bridge.

### Phase 5: Verification & Polish
- Full test suite execution across all 3 decks and OTP loader.
