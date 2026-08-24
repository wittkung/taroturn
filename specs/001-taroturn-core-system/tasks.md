# Tasks: Taroturn Core Engine & Cross-Platform Tarot System

- **Feature ID**: `001-taroturn-core-system`
- **Pipeline Mode**: `[Full SDD]`
- **Status**: `COMPLETED`

---

## Phase 1: Setup & Project Initialization

Goal: Establish multi-tier workspace scaffolding, build configurations, and design system tokens.

- [x] T001 Initialize Cargo workspace configuration in `Cargo.toml`
- [x] T002 [P] Initialize Gradle Kotlin Spring Boot 3.3 project in `server/taroturn-server/build.gradle.kts`
- [x] T003 [P] Setup HD 1909 RWS card asset catalog and download pipeline in `scripts/download_rws_assets.py`
- [x] T004 [P] Setup TTZip UI theme token definition in `crates/taroturn-ui/src/tokens.rs`

---

## Phase 2: Core Domain Foundations (`taroturn-core`)

Goal: Implement pure, zero-panic, deterministic Tarot domain logic in Rust.

- [x] T005 Implement 78-card catalog and Arcana/Suit/Rank models in `crates/taroturn-core/src/card.rs`
- [x] T006 [P] Implement 6-facet card interpretation library in `crates/taroturn-core/src/facets.rs`
- [x] T007 [P] Implement ChaCha20 deterministic CSPRNG shuffling engine in `crates/taroturn-core/src/shuffling.rs`
- [x] T008 [P] Implement Spread DAG topological slot layout engine in `crates/taroturn-core/src/spread.rs`
- [x] T009 [P] Implement Elemental Dignity and numerical resonance calculator in `crates/taroturn-core/src/dignity.rs`
- [x] T010 Implement Reading Session lifecycle and deterministic seed serialization in `crates/taroturn-core/src/session.rs`
- [x] T011 Implement structured error envelope and bounds checking in `crates/taroturn-core/src/error.rs`

---

## Phase 3: User Story 1 - Terminal CLI & AGY AI Integration (`taroturn-cli`)

Goal: Deliver interactive terminal divination interface with ANSI Kintsugi Gold rendering and AGY CLI desktop AI interpretation.

- [x] T012 [P] [US1] Implement CLI argument parsing and command definitions in `crates/taroturn-cli/src/args.rs`
- [x] T013 [P] [US1] Implement ANSI Zen/Kintsugi Gold terminal renderer and card box art in `crates/taroturn-cli/src/render.rs`
- [x] T014 [US1] Implement interactive draw and cut simulation workflow in `crates/taroturn-cli/src/interactive.rs`
- [x] T015 [US1] Implement AGY CLI subprocess bridge for desktop AI interpretation in `crates/taroturn-cli/src/agy_bridge.rs`
- [x] T016 [US1] Implement CLI main entry point and multi-format export in `crates/taroturn-cli/src/main.rs`

---

## Phase 4: User Story 2 - Multi-Language SDKs & Cross-Platform Layer

Goal: Package core engine for all top mainstream programming languages and WeChat Mini Program.

- [x] T017 [P] [US2] Create universal C-ABI export functions and memory guards in `crates/taroturn-core/src/ffi.rs`
- [x] T018 [P] [US2] Create C/C++ SDK headers in `include/taroturn.h` and `include/taroturn.hpp`
- [x] T019 [P] [US2] Implement Python SDK in `sdk/python/taroturn/__init__.py`
- [x] T020 [US2] Implement Go, C#, Dart, TypeScript SDKs in `sdk/`

---

## Phase 5: User Story 3 - Cloud Backend, Auth & Storage (`taroturn-server`)

Goal: Deliver Kotlin + Spring Boot 3 backend for WeChat/Apple auth, PostgreSQL journal sync, and `pgvector` search.

- [x] T021 [P] [US3] Create Flyway PostgreSQL schema migrations in `server/taroturn-server/src/main/resources/db/migration/V1__init_schema.sql`
- [x] T022 [P] [US3] Implement WeChat code2Session and Apple OAuth2 authentication in `server/taroturn-server/src/main/kotlin/com/taroturn/server/auth/AuthService.kt`
- [x] T023 [P] [US3] Implement Reading Journal persistence and sync controller in `server/taroturn-server/src/main/kotlin/com/taroturn/server/journal/JournalController.kt`
- [x] T024 [P] [US3] Implement pgvector semantic search repository in `server/taroturn-server/src/main/kotlin/com/taroturn/server/journal/ReadingSessionRepository.kt`
- [x] T025 [US3] Implement Spring Boot AI interpretation service in `server/taroturn-server/src/main/kotlin/com/taroturn/server/ai/AiInterpretationService.kt`

---

## Phase 6: Polish, Verification & Quality Assurance

Goal: Execute cross-platform regression tests, memory safety audits, and contract/task gate linting.

- [x] T026 Implement cross-platform deterministic seed parity test suite in `tests/cross_platform_seed_test.rs`
- [x] T027 [P] Implement zero-panic fuzz test and ASan memory validation in `tests/fuzz_spread_inputs.rs`
- [x] T028 [P] Validate contract schemas and task definitions via `.specify/scripts/bash/lint-contracts.sh` and `.specify/scripts/bash/lint-tasks.sh`
