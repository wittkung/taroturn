# Technical Research & Architecture Decisions: Taroturn System

- **Feature ID**: `001-taroturn-core-system`
- **Target**: Core Rust Engine, CLI, UniFFI/WASM Bridges, Kotlin Spring Boot Server, PostgreSQL
- **Date**: 2026-08-24

---

## 1. Domain & Microkernel Architecture (`taroturn-core`)

### 1.1 Decision: Zero-Panic Pure Rust Core with `#![forbid(unsafe_code)]`
- **Decision**: All card catalog metadata, card state transformations, spread topologies, random entropy shuffling, and elemental dignity rules will be implemented in a standalone, pure Rust crate `taroturn-core` with `#![forbid(unsafe_code)]` enabled.
- **Rationale**:
  - Eliminates class of memory safety vulnerabilities, buffer overflows, and null-pointer dereferences across cross-language FFI boundaries.
  - Enables effortless compilation to `wasm32-unknown-unknown` without C dependencies.
- **Alternatives Considered**:
  - *C/C++ Core Engine*: Higher memory safety risk and complex toolchain integration across iOS/Android/WASM.
  - *Platform-specific implementations (Swift/Kotlin/JS)*: Breaks calculation consistency and duplicates maintenance by 4x.
- **Source**: Rust API Guidelines, Mozilla UniFFI documentation.

### 1.2 Decision: Deterministic CSPRNG Shuffling with ChaCha20
- **Decision**: Shuffling uses `rand_chacha::ChaCha20Rng` seeded from hardware entropy (`getrandom`), returning an explicit 64-byte hexadecimal seed (`RngSeed`) alongside the spread.
- **Rationale**:
  - Cryptographically secure and unbiased Fisher-Yates shuffle distribution.
  - Total determinism: Providing the same `RngSeed` reproduces the identical card order and upright/reversed orientation sequence on any CPU architecture (x86_64, aarch64, wasm32).
- **Alternatives Considered**:
  - `rand::thread_rng()` without seed logging: Non-reproducible, impossible to audit or replay.
- **Source**: RFC 7539 (ChaCha20 and Poly1305 for IETF Protocols), `rand` Rust crate specification.

### 1.3 Decision: Spread Topology Representation via Directed Graph (DAG) & Slot DSL
- **Decision**: Spreads are defined as structured JSON schemas with node slots containing spatial coordinates `(x, y, rotation, z_order)`, relational edges (e.g. Card 2 crosses Card 1), and semantic evaluation context.
- **Rationale**:
  - Accommodates both standard canonical spreads (Celtic Cross, Horseshoe, Zodiac 12 Houses) and custom user-defined spreads dynamically without code modification.
- **Alternatives Considered**:
  - Hardcoded Enum/Switch statements for spreads: Inflexible, requires engine rebuild for every new spread.
- **Source**: Graph data modeling best practices, Open Tarot Specification proposals.

---

## 2. Cross-Platform FFI & WASM Delivery Matrix

### 2.1 Decision: UniFFI for Native Swift & Kotlin Bindings
- **Decision**: Native mobile and desktop clients integrate `taroturn-core` via Mozilla `uniffi-rs`.
- **Rationale**:
  - Generates idiomatic Swift and Kotlin bindings from a single UDL/Proc-macro definition.
  - Automatically handles string allocation, record marshaling, and error conversion safely.
- **Alternatives Considered**:
  - *Manual `extern "C"` C-ABI + Swift/JNI glue*: Extremely error-prone, high risk of memory leaks and pointer ownership mismanagement.
- **Source**: Mozilla UniFFI Documentation (`https://mozilla.github.io/uniffi-rs/`).

### 2.2 Decision: `wasm-bindgen` + `WXWebAssembly` for WeChat Mini Program
- **Decision**: Compile `taroturn-core` to `wasm32-unknown-unknown` via `wasm-bindgen`, optimized with `wasm-opt -Oz`, loading via WeChat's `WXWebAssembly` runtime.
- **Rationale**:
  - Mini Programs have strict binary package size constraints (<2MB per subpackage) and do not support runtime JIT compilation (`eval` / dynamic `WebAssembly.compile`). Pre-compiled static WASM runs 100% offline within WeChat client.
- **Alternatives Considered**:
  - *Pure JS Transpilation*: Slower execution for complex dignity matrices and higher code divergence.
- **Source**: WeChat Mini Program WebAssembly Official Documentation.

---

## 3. Server Architecture, Auth & Storage (`taroturn-server`)

### 3.1 Decision: Kotlin 2.x + Spring Boot 3.3 + PostgreSQL 16 (`pgvector`)
- **Decision**: Cloud backend built on Spring Boot 3.3 with Kotlin coroutines, Spring Security with WeChat `code2Session` & Apple ID OAuth2, and PostgreSQL 16 with `pgvector`.
- **Rationale**:
  - Type-safe, concise server codebase with seamless non-blocking I/O.
  - `pgvector` enables vector embeddings of divination questions and card syntheses, powering intelligent cross-reading semantic search and theme resonance.
- **Alternatives Considered**:
  - *MongoDB / Document DB*: Lacks relational integrity for user tiers, subscriptions, and relational join queries.
- **Source**: Spring Boot 3 Reference Guide, PostgreSQL `pgvector` Documentation.

### 3.2 Decision: Offline-First Incremental Journal Sync Protocol
- **Decision**: Client maintains an append-only local journal of reading sessions with UUIDv7 IDs. When online, client syncs records with optimistic concurrency control and idempotency keys.
- **Rationale**:
  - Zero disruption when practicing divination in airplanes, nature retreats, or low-connectivity zones.
- **Alternatives Considered**:
  - *Synchronous Cloud-Only Storage*: Fails completely when offline.
- **Source**: Offline First Engineering Principles, UUIDv7 RFC 9562.

---

## 4. UI Design System Integration (`taroturn-ui`)

### 4.1 Decision: Strict Adoption of TTZip Zen / WSJ / Kintsugi Gold Token Architecture
- **Decision**: UI across macOS, iOS, Android, and WeChat Mini Program adheres to TTZip's Design Tokens (`kintsugiGold: #D4AF37`, `deepGraphite: #1C1C1E`, `inkBlack: #0B0B0C`, `washiPaper: #FBFBFD`, `bambooGreen: #2E8B57`, `cinnabarRed: #C84B31`, $52\text{pt}$ header with $Y=90\text{pt}$ gold rule line, $16\text{pt}$ continuous corner glassmorphic islands).
- **Rationale**:
  - Delivers a calm, meditative, luxury editorial reading experience.
- **Source**: [TTZip UI Design System](file:///Users/kevintung/.agents/skills/ttzip-ui-design-system/SKILL.md).

---

## 5. HD Card Asset Packaging

### 5.1 Decision: 1909 Pamela Colman Smith RWS Multi-Tier Asset Pipeline
- **Decision**: Authentic 1909 RWS scans packaged in 3 tiers (`@3x` 1400x2400 WebP, `@2x` 700x1200 WebP, `@1x` 200x342 WebP) hosted on CDN with local LRU caching.
- **Rationale**:
  - Verified Public Domain status globally. High aesthetic fidelity without licensing or trademark entanglements.
- **Source**: Wikimedia Commons (Roses & Lilies 1909 RWS collection).
