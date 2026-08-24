# Implementation Plan: Taroturn Core Engine & Cross-Platform Tarot System

- **Feature ID**: `001-taroturn-core-system`
- **Pipeline Mode**: `[Full SDD]`
- **Status**: `READY_FOR_TASKS`
- **Author**: Antigravity / CTO Persona

---

## 1. Technical Context & Architecture Overview

The Taroturn system establishes an offline-first, memory-safe, unified divination architecture spanning 5 delivery targets:
1. **`taroturn-core` (Rust)**: Pure domain microkernel implementing the 78-card catalog, ChaCha20 deterministic CSPRNG shuffling, topological spread graph DAG engine, and elemental dignity/synthesis algorithms.
2. **`taroturn-cli` (Rust)**: Terminal interface providing interactive draws, seed replays, ANSI Kintsugi Gold styling, and seamless AGY CLI integration for desktop AI interpretation.
3. **`taroturn-client-ffi` & `taroturn-client-wasm`**: UniFFI bindings for iOS (Swift) / Android (Kotlin) / Desktop and WXWebAssembly static bundle for WeChat Mini Program.
4. **`taroturn-server` (Kotlin + Spring Boot 3 + PostgreSQL 16 `pgvector`)**: Cloud synchronization service handling WeChat `code2Session` authentication, reading history journaling, and vector-enabled semantic search.
5. **`taroturn-ui` Design System**: Unified design tokens adhering to TTZip standards ($52\text{pt}$ header, $Y=90\text{pt}$ gold line, `#D4AF37` Kintsugi Gold, `#1C1C1E` deep graphite, `#2E8B57` bamboo green, and floating glass islands).
6. **HD Asset Pipeline**: High-resolution 1909 Pamela Colman Smith RWS public-domain card art packaged in multi-tier WebP formats (`@3x`, `@2x`, `@1x`).

---

## 2. Constitution & Gate Checks

| Constitution Principle | Compliance Status | Verification Strategy |
|---|---|---|
| **Principle 1: Single Source of Truth (Rust)** | ✅ COMPLIANT | All card rules, spreads, and dignities strictly in `taroturn-core`. |
| **Principle 2: Zero-Panic & Memory Safety** | ✅ COMPLIANT | `#![forbid(unsafe_code)]` enabled, structured error envelopes. |
| **Principle 3: Cryptographic Determinism** | ✅ COMPLIANT | ChaCha20 Seeded Rng ensures 100% reproducible cross-platform output. |
| **Principle 4: Offline-First Architecture** | ✅ COMPLIANT | Core divination runs 100% offline; async journal sync when online. |
| **Principle 5: Strict Contract Governance** | ✅ COMPLIANT | All 6 contracts verified via `lint-contracts.sh` (0 violations). |

---

## 3. Implementation Phasing & Component Breakdown

```
+---------------------------------------------------------------------------------------------+
| Phase 1: Foundation & Rust Core Engine (`taroturn-core`)                                    |
| - Cargo workspace setup (`crates/taroturn-core`, `crates/taroturn-cli`)                     |
| - 78-Card catalog model with Major/Minor arcana, suits, elements, and 6-facet interpretations|
| - ChaCha20 deterministic CSPRNG shuffling engine with hex seed generation & replay          |
| - Spread DAG layout engine (8 canonical spreads + dynamic slot graph DSL)                   |
| - Elemental dignity calculator, dominant suit ratio & numerological shadow card reducer      |
+---------------------------------------------------------------------------------------------+
                                              |
                                              v
+---------------------------------------------------------------------------------------------+
| Phase 2: CLI Tool & AGY AI Integration (`taroturn-cli`)                                     |
| - `clap` CLI command definitions (`draw`, `interpret`, `list-spreads`, `list-cards`)         |
| - ANSI terminal renderer with Zen / Kintsugi Gold palette and Unicode card box layouts      |
| - Subprocess bridge to AGY CLI (`agy query`) for desktop AI deep interpretation             |
+---------------------------------------------------------------------------------------------+
                                              |
                                              v
+---------------------------------------------------------------------------------------------+
| Phase 3: Cross-Platform FFI & WASM Delivery Layer                                           |
| - UniFFI UDL definition & bindings generation (Swift for iOS/macOS, Kotlin for Android)     |
| - `wasm-bindgen` compilation & `wasm-opt` size optimization for WeChat `WXWebAssembly`      |
| - HD 1909 RWS card image asset download and multi-resolution packaging script               |
+---------------------------------------------------------------------------------------------+
                                              |
                                              v
+---------------------------------------------------------------------------------------------+
| Phase 4: Cloud Backend, Auth & Storage (`taroturn-server`)                                  |
| - Gradle Kotlin Spring Boot 3.3 skeleton & Flyway PostgreSQL migrations                     |
| - WeChat Mini Program `code2Session` authentication & Apple ID OAuth2 service               |
| - Reading journal sync endpoint with UUIDv7 idempotency and conflict resolution             |
| - `pgvector` semantic embedding indexing for historical reading search                      |
+---------------------------------------------------------------------------------------------+
                                              |
                                              v
+---------------------------------------------------------------------------------------------+
| Phase 5: Verification, Benchmarking & Convergence                                           |
| - Cross-platform deterministic seed regression test suite                                   |
| - Memory safety, leak checks (ASan) & zero-panic fuzz testing                               |
| - Mini Program WASM runtime compliance & binary size audit (<1.5MB)                          |
+---------------------------------------------------------------------------------------------+
```

---

## 4. Generated Design Artifacts

- **Research Document**: [research.md](file:///Users/kevintung/Documents/dev/products/taroturn/specs/001-taroturn-core-system/research.md)
- **Data Model & DB Schema**: [data-model.md](file:///Users/kevintung/Documents/dev/products/taroturn/specs/001-taroturn-core-system/data-model.md)
- **JSON Contracts**:
  1. [card-schema.json](file:///Users/kevintung/Documents/dev/products/taroturn/specs/001-taroturn-core-system/contracts/card-schema.json)
  2. [spread-schema.json](file:///Users/kevintung/Documents/dev/products/taroturn/specs/001-taroturn-core-system/contracts/spread-schema.json)
  3. [reading-session-schema.json](file:///Users/kevintung/Documents/dev/products/taroturn/specs/001-taroturn-core-system/contracts/reading-session-schema.json)
  4. [error-envelope-schema.json](file:///Users/kevintung/Documents/dev/products/taroturn/specs/001-taroturn-core-system/contracts/error-envelope-schema.json)
  5. [ai-prompt-envelope-schema.json](file:///Users/kevintung/Documents/dev/products/taroturn/specs/001-taroturn-core-system/contracts/ai-prompt-envelope-schema.json)
  6. [sync-journal-schema.json](file:///Users/kevintung/Documents/dev/products/taroturn/specs/001-taroturn-core-system/contracts/sync-journal-schema.json)
- **Validation Guide**: [quickstart.md](file:///Users/kevintung/Documents/dev/products/taroturn/specs/001-taroturn-core-system/quickstart.md)
