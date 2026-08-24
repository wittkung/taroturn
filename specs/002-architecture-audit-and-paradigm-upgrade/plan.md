# Implementation Plan: Architecture Optimization, SSOT Convergence & Paradigm Upgrade

- **Feature ID**: `002-architecture-audit-and-paradigm-upgrade`
- **Pipeline Mode**: `[Full SDD]`
- **Status**: `PLANNING APPROVED`
- **Author**: Antigravity / CTO Persona
- **Target Branch**: `main`

---

## 1. Technical Context & Scope

This implementation plan systematically resolves the 7 core architectural defects identified during the codebase audit:

1. **`taroturn-core` (Rust Microkernel)**:
   - Zero-allocation `StaticCardDefinition` table (`ALL_CARDS: [StaticCardDefinition; 78]`) with `std::sync::LazyLock` runtime cache.
   - Stream Drain CSP (Constraint Satisfaction Problem) deterministic slot constraint solver in `ShufflingEngine`.
   - Topological Spread DAG with 7 typed semantic relation edges (`SlotEdge`).
   - Classical Golden Dawn pairwise elemental dignity tensor matrix (`PairwiseDignity`) with orientation tension modulation.
   - Dynamic cross-platform timestamp provider (`current_timestamp_ms()`).
   - Full 78-card rich esoteric/psychological facet dataset (36 Decans, 4 Elemental Roots, 16 Court Personalities, 10 Sephiroth).
   - WASM export bindings via `wasm-bindgen` and `serde-wasm-bindgen`.

2. **`apps/taroturn-app` (Frontend SSOT Convergence)**:
   - Compile `crates/taroturn-core` to WASM.
   - Delete `apps/taroturn-app/src/data/cardsData.ts`.
   - Replace manual `Math.random() - 0.5` with `tarotCoreService.ts` WASM bindings.
   - Align spread coordinates and remove duplicate calculation logic.

3. **`server/taroturn-server` (Backend Security & Auth)**:
   - Implement `JwtAuthenticationFilter` (`OncePerRequestFilter`) and `JwtTokenProvider`.
   - Remove unverified `@RequestHeader("X-User-Id")`, replace with `@AuthenticationPrincipal principal: UserPrincipal`.
   - Implement `WechatAuthClient` with `jscode2session` official endpoint integration and Mock fallback.
   - Secure `/api/v1/journal/**` and `/api/v1/ai/**` endpoints behind authenticated JWT + Pro checks.

---

## 2. Constitution Check & Gate Evaluation

| Constitution Principle | Assessment | Status |
|---|---|---|
| **Principle 1: Single Source of Truth (Rust Core)** | Eliminates `cardsData.ts` and frontend JS shuffle, converging all calculations to Rust WASM | **PASS** |
| **Principle 2: Zero-Panic & Memory Safety** | `#![forbid(unsafe_code)]` in domain modules, zero dynamic heap allocations on card lookups | **PASS** |
| **Principle 3: Cryptographic Determinism** | 32-byte ChaCha20 CSPRNG seed protocol unified across Native, WASM, and Server | **PASS** |
| **Principle 4: Offline-First Architecture** | Web App and Mini Program execute 100% offline via `@taroturn/wasm` without server reliance | **PASS** |
| **Principle 5: Strict Contract & Schema Governance** | All new DAG, Dignity, and Auth schemas validated via `lint-contracts.sh` | **PASS** |

---

## 3. Implementation Phases & Architecture Workstream

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ Phase 0: Research & Consolidations                                               │
│   ├── Research memory layout & &'static str zero-heap structures                 │
│   ├── Research CSP natural shuffle drainage permutation mathematics              │
│   ├── Research Golden Dawn pairwise dignity interaction matrices                 │
│   └── Research Spring Security 6.3 Stateless JWT Filters                         │
├──────────────────────────────────────────────────────────────────────────────────┤
│ Phase 1: Design Artifacts & Contracts                                            │
│   ├── data-model.md (Updated Entity models, DAG types, Dignity types)            │
│   ├── contracts/*.json (JSON Schemas for DAG, Dignity, Session v2, Auth)         │
│   └── quickstart.md (Validation & test suites execution guide)                   │
├──────────────────────────────────────────────────────────────────────────────────┤
│ Phase 2: Tasks Breakdown & Implementation (Next Stage)                           │
│   ├── Core Microkernel Zero-Alloc & 78 Card Facets                               │
│   ├── Core CSP Solver & DAG Topological Spread Engine                            │
│   ├── Core Pairwise Dignity & Cross-Platform Timestamp                           │
│   ├── WASM Compilation & Frontend SSOT Migration                                 │
│   ├── Spring Boot Security & JWT Filter Hardening                                │
│   └── Multi-Tier Verification (Benchmarks, Security PoC, Cross-Platform Seed)     │
└──────────────────────────────────────────────────────────────────────────────────┘
```
