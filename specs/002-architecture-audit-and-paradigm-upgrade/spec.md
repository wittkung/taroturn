# Feature Specification: Architecture Audit, Microkernel SSOT Convergence & Topological Graph Paradigm Upgrade

- **Feature ID**: `002-architecture-audit-and-paradigm-upgrade`
- **Pipeline Mode**: `[Full SDD]`
- **Status**: `PROPOSED`
- **Author**: Antigravity / CTO Persona
- **Target Subsystems**:
  - `taroturn-core` (Rust Microkernel: Static Card Registry, CSP Slot Solver, Topological DAG, Pairwise Dignities)
  - `taroturn-client-wasm` (WASM Bundle & `@taroturn/core-wasm` npm package for Web & Mini Program)
  - `apps/taroturn-app` (SSOT Convergence: Elimination of duplicate logic, pure WASM engine integration)
  - `taroturn-server` (JWT Security Filter, WeChat `jscode2session` integration, Real Vector RAG)
  - `taroturn-cli` (Rich Terminal DAG visualizer & streaming AGY AI integration)

---

## 1. Problem Statement & Executive Architectural Audit

A comprehensive multi-tier architectural audit of the Taroturn codebase revealed 7 structural defects, 3 violations of the project constitution, and major opportunities for paradigm-level upgrades:

### 1.1 Critical Defects & Constitution Violations Identified
1. **Violation of Single Source of Truth (Constitution Principle 1)**:
   - `apps/taroturn-app` re-implements card catalogs (`cardsData.ts`), canonical spreads, biased random shuffling (`Math.random() - 0.5`), and elemental ratio calculations in TypeScript instead of invoking `taroturn-core`.
2. **Heap Memory Thrashing in Rust Microkernel**:
   - `CardDeck::get_by_id(u8)` dynamically allocates all 78 `Card` heap structs and hundreds of `String` objects on every single lookup. Zero static memoization or compile-time static lookup tables are utilized.
3. **Hardcoded Session Timestamps**:
   - `ReadingSession::create` in `session.rs` hardcodes `created_at = 1724490000000`, breaking timeline integrity and cross-platform session auditing.
4. **Slot Constraint Solver Inaction**:
   - `SlotConstraint` enum (`MajorOnly`, `MinorOnly`, `SpecificSuit`) is defined in `SpreadSlot`, but `ShufflingEngine` and `ReadingSession` completely ignore it during card dealing.
5. **Lack of Pairwise Topological Dignities**:
   - `dignity.rs` only computes coarse global element percentages rather than calculating classical Golden Dawn pairwise topological dignities across adjacent/crossing slots.
6. **Critical Security Hole in `taroturn-server`**:
   - `SecurityConfig.kt` permits all requests to `/api/v1/journal/**` and `/api/v1/ai/**` without JWT authentication, reading `X-User-Id` directly from arbitrary untrusted HTTP headers.
7. **Templated Minor Arcana Facet Placeholders**:
   - All 56 Minor Arcana cards contain generic string formatting placeholders instead of rich archetypal, esoteric, and psychological interpretations.

---

## 2. Target Architecture & Paradigm Upgrades

```
+---------------------------------------------------------------------------------------------------------+
|                                        taroturn-core (Rust 2021)                                        |
|  +-----------------------------+  +-------------------------------+  +-------------------------------+  |
|  |     Static Card Registry    |  |     CSPRNG & Shuffling        |  |    Topological Spread Graph   |  |
|  |  - Zero-alloc &'static str  |  |  - ChaCha20 Seed Protocol     |  |  - DAG Nodes & Edge Rel types|  |
|  |  - 78 Complete Archetypes   |  |  - CSP Slot Constraint Solver |  |  - Pairwise Dignity Matrix |  |
|  +-----------------------------+  +-------------------------------+  +-------------------------------+  |
+---------------------------------------------------------------------------------------------------------+
                |                                        |                                        |
                v (wasm-bindgen / wasm-opt)              v (UniFFI v0.28)                         v (C-ABI / #[repr(C)])
+------------------------------------+  +--------------------------------+  +-----------------------------+
|    @taroturn/core-wasm Package     |  |   Native Swift / Kotlin SDK    |  |   Universal C / C++ Header  |
| (Web App & WeChat Mini Program)    |  |  (iOS, Android, macOS Desktop) |  |   (Windows, Linux, Embedded)|
+-----------------+------------------+  +---------------+----------------+  +--------------+--------------+
                  |                                     |                                  |
                  v                                     v                                  v
+------------------------------------+  +--------------------------------+  +-----------------------------+
|          taroturn-app              |  |         taroturn-cli           |  |       taroturn-server       |
|  - Zero duplicate domain logic     |  |  - ASCII/ANSI DAG Visualizer   |  |  - Spring Boot 3 + JWT Auth |
|  - Pure WASM calculation microkernel| |  - Live AGY AI Streaming Bridge|  |  - pgvector Archetypal RAG  |
+------------------------------------+  +--------------------------------+  +-----------------------------+
```

---

## 3. User Scenarios & Acceptance Criteria

### Scenario 1: Zero-Allocation Instantaneous Card & Spread Calculations
- **Given** any client application or server querying card archetypes or dealing complex spreads,
- **When** calling `get_card_by_id`, `draw_reading_session`, or calculating elemental dignities,
- **Then** the core executes with zero repeated heap allocations for static card metadata, completing full Celtic Cross calculations in $< 0.05\text{ms}$.

### Scenario 2: Topological Constraint Satisfaction Spreads
- **Given** a custom or canonical spread requiring slot-specific constraints (e.g. Major Arcana for Slot 0, Pentacles for Slot 3),
- **When** drawing a session using a valid CSPRNG seed,
- **Then** the engine solves constraints deterministically without card duplication, placing valid matching cards in constrained slots.

### Scenario 3: Single Source of Truth Convergence in Frontend App
- **Given** `taroturn-app` running in a browser or WeChat environment,
- **When** the user shuffles, draws cards, or inspects card facets,
- **Then** the app executes calculation purely via `@taroturn/core-wasm`, guaranteeing 100% numerical and interpretative parity with CLI and backend.

### Scenario 4: Secure Pro-Gated Cloud Sync & AI Synthesis
- **Given** an unauthenticated or free-tier request to `taroturn-server`,
- **When** calling `/api/v1/journal/sync`, `/api/v1/journal/history`, or `/api/v1/ai/interpret`,
- **Then** the server validates the Bearer JWT token, rejects spoofed headers, and strictly enforces 403 Forbidden for non-Pro tiers.

---

## 5. Functional Requirements

- **REQ-AUDIT-01 (Zero-Allocation Static Card Registry)**:
  - Refactor `CardDeck` to use static `&'static str` data structures with `LazyLock` or compile-time static arrays. `get_by_id` MUST return references or lightweight copies with zero string heap allocations.
- **REQ-AUDIT-02 (Rich 78-Card Esoteric Facet Registry)**:
  - Populate all 56 Minor Arcana cards with complete psychological keywords, love, career, spiritual, and shadow facets matching the depth of Major Arcana.
- **REQ-AUDIT-03 (Topological Graph DAG & Pairwise Dignity Matrix)**:
  - Upgrade `Spread` to include explicit slot relationship edges (`SlotEdge { source_id, target_id, relation_type }`).
  - Calculate pairwise elemental tensions (Strengthening, Weakening, Neutral) based on graph adjacencies.
- **REQ-AUDIT-04 (Constraint-Satisfaction Shuffling Engine)**:
  - Update `ShufflingEngine::draw_cards` to respect and enforce `SlotConstraint` parameters without breaking seed replay determinism.
- **REQ-AUDIT-05 (WASM Core Packaging & Web App SSOT Integration)**:
  - Compile `taroturn-core` to WASM and bind directly in `apps/taroturn-app`, deleting duplicate logic in `cardsData.ts` and `App.tsx`.
- **REQ-AUDIT-06 (Strict Server Security & Real WeChat OAuth Integration)**:
  - Implement Spring Security JWT Authentication Filter; remove `X-User-Id` trust; add real WeChat `jscode2session` client configuration with mock fallback.

---

## 6. Non-Functional Requirements & Success Criteria

| Metric / Requirement | Target Baseline | Verification Method |
|---|---|---|
| **Core Microkernel Allocation** | 0 heap string allocations on card lookup | Valgrind / `cargo bench` |
| **Spread Calculation Latency** | $P_{99} < 0.1\text{ms}$ | Rust Criterion Benchmarks |
| **Web App Domain Logic Parity** | 100% driven by WASM core, 0 duplicate files | Code review & Jest/Playwright tests |
| **Server Security Audit** | 0 unauthenticated access to journal/AI endpoints | Spring Security Integration Tests |
| **Deterministic Seed Parity** | 100% identical outputs across WASM, Native, CLI | `cross_platform_seed_test.rs` |
