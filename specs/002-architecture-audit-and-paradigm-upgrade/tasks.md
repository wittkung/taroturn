# Tasks: Architecture Optimization, SSOT Convergence & Paradigm Upgrade

- **Feature ID**: `002-architecture-audit-and-paradigm-upgrade`
- **Specification**: [spec.md](./spec.md)
- **Plan**: [plan.md](./plan.md)
- **Data Model**: [data-model.md](./data-model.md)
- **Contracts**: [contracts/](./contracts)
- **Status**: `COMPLETED`

---

## Phase 1: Setup & Project Initialization

- [x] T001 Setup WASM build workspace and dependencies in `crates/taroturn-core/Cargo.toml`
- [x] T002 [P] Configure Vite WASM and top-level await plugins in `apps/taroturn-app/vite.config.ts`

---

## Phase 2: Foundational Microkernel Data & Memory Safety

- [x] T003 Define `StaticCardDefinition` and `StaticCardFacets` structs in `crates/taroturn-core/src/card.rs`
- [x] T004 Populate 78-card zero-allocation static table with Decans and rich facets in `crates/taroturn-core/src/card.rs`
- [x] T005 Implement `LazyLock` cache and zero-allocation `get_static` and `get_by_id` in `crates/taroturn-core/src/card.rs`
- [x] T006 Implement cross-platform dynamic timestamp provider `current_timestamp_ms` in `crates/taroturn-core/src/session.rs`

---

## Phase 3: User Story 1 - Topological DAG & Constraint Satisfaction Spreads

**Goal**: Support directed topological spread relations and deterministic CSP slot constraint solving.
**Independent Test Criteria**: `cargo test` runs CSP constraint tests without card duplicates and with valid DAG relationships.

- [x] T007 [US1] Expand `SlotConstraint` enum with `CourtOnly` and `PipOnly` in `crates/taroturn-core/src/spread.rs`
- [x] T008 [US1] Define `SlotRelationType`, `SlotEdge` and upgrade `Spread` struct in `crates/taroturn-core/src/spread.rs`
- [x] T009 [US1] Populate topological DAG edges for all 7 canonical spreads in `crates/taroturn-core/src/spread.rs`
- [x] T010 [US1] Implement stream drain CSP solver `draw_cards_with_constraints` in `crates/taroturn-core/src/shuffling.rs`
- [x] T011 [US1] Implement Golden Dawn pairwise affinity and `evaluate_spread_session` in `crates/taroturn-core/src/dignity.rs`
- [x] T012 [US1] Update `ReadingSession::create` to invoke CSP solver and dignity analysis in `crates/taroturn-core/src/session.rs`

---

## Phase 4: User Story 2 - WebAssembly Compilation & Frontend SSOT Convergence

**Goal**: Eliminate duplicate card metadata and biased random shuffle in `apps/taroturn-app` by binding `@taroturn/wasm`.
**Independent Test Criteria**: Web app builds with zero `cardsData.ts` and shuffles deterministically via WASM.

- [x] T013 [P] [US2] Export WASM functions using `wasm-bindgen` and `serde-wasm-bindgen` in `crates/taroturn-core/src/lib.rs`
- [x] T014 [US2] Build and package `@taroturn/wasm` via wasm-pack in `packages/taroturn-wasm`
- [x] T015 [US2] Implement `tarotCoreService.ts` WASM singleton in `apps/taroturn-app/src/services/tarotCoreService.ts`
- [x] T016 [US2] Delete `cardsData.ts` and refactor `handleShuffleAndDraw` in `apps/taroturn-app/src/App.tsx`
- [x] T017 [P] [US2] Update `ReadingDrawer.tsx` to read card facets from WASM in `apps/taroturn-app/src/components/ReadingDrawer.tsx`
- [x] T018 [P] [US2] Update `CardDeckCatalogModal.tsx` to read 78 cards from WASM in `apps/taroturn-app/src/components/CardDeckCatalogModal.tsx`

---

## Phase 5: User Story 3 - Server Security & WeChat OAuth Hardening

**Goal**: Implement Spring Security 6.3 stateless JWT authentication, eliminate `X-User-Id` spoofing, and add WeChat code2session client.
**Independent Test Criteria**: MockMvc security tests reject unauthenticated requests with 401 Unauthorized.

- [x] T019 [P] [US3] Create `UserPrincipal` and `JwtTokenProvider` in `server/taroturn-server/src/main/kotlin/com/taroturn/server/auth/AuthService.kt`
- [x] T020 [P] [US3] Implement `JwtAuthenticationFilter` in `server/taroturn-server/src/main/kotlin/com/taroturn/server/config/SecurityConfig.kt`
- [x] T021 [US3] Implement `WechatAuthClient` with `jscode2session` in `server/taroturn-server/src/main/kotlin/com/taroturn/server/auth/WechatAuthClient.kt`
- [x] T022 [US3] Refactor `JournalController` to inject `@AuthenticationPrincipal` in `server/taroturn-server/src/main/kotlin/com/taroturn/server/journal/JournalService.kt`
- [x] T023 [US3] Refactor `AiController` to inject `@AuthenticationPrincipal` in `server/taroturn-server/src/main/kotlin/com/taroturn/server/ai/AiInterpretationService.kt`

---

## Phase 6: Polish & Multi-Tier Verification

- [x] T024 [P] Update CLI renderer to display DAG relations and dignity tensions in `crates/taroturn-cli/src/render.rs`
- [x] T025 [P] Add CSP constraint satisfaction test suite in `tests/fuzz_spread_inputs.rs`
- [x] T026 Verify cross-platform deterministic seed invariance in `tests/cross_platform_seed_test.rs`

---

## Dependencies & Execution Strategy

```
Phase 1 (Setup) ──► Phase 2 (Foundational Rust Core)
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
Phase 3 (Topological DAG / CSP)   Phase 5 (Server Security)
             │
             ▼
Phase 4 (WASM & Frontend SSOT)
             │
             └─────────────┬─────────────┘
                           ▼
                 Phase 6 (Verification)
```
