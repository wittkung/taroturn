# Feature Specification: Taroturn Core Engine & Cross-Platform Tarot System

- **Feature ID**: `001-taroturn-core-system`
- **Pipeline Mode**: `[Full SDD]`
- **Status**: `APPROVED`
- **Author**: Antigravity / CTO Persona
- **Target Subsystems**:
  - `taroturn-core` (Rust Domain Microkernel: Cards, Spreads, Shuffling, Rules, C-ABI/UniFFI/WASM)
  - `taroturn-cli` (Rust Terminal UI & Interactive Divination / AGY CLI AI Tool)
  - `taroturn-server` (Kotlin + Spring Boot 3 + PostgreSQL Cloud Sync, Auth & AI Interpretation Service)
  - `taroturn-client-ffi` (UniFFI bindings for iOS Swift, Android Kotlin, Desktop Win/macOS)
  - `taroturn-client-wasm` (WXWebAssembly bindings for WeChat Mini Program & Web)
  - `taroturn-ui` (Zen $\times$ WSJ Editorial $\times$ Kintsugi Gold Glassmorphic Design System)

---

## 1. Problem Statement & Motivation

Existing Tarot applications on the market suffer from fragmented implementations, non-deterministic random state, proprietary closed data formats, lack of verifiable shuffling entropy, rigid hardcoded spread layouts, low-resolution card art, inconsistent visual aesthetics, and poor cross-platform consistency:
1. **Fragmented Business Logic**: Most solutions re-implement card rules, spread layouts, and elemental dignity algorithms separately across iOS (Swift), Android (Java/Kotlin), Web (JS), and backend servers, leading to discrepancies in card interpretations, calculation biases, and maintenance overhead.
2. **Lack of Verifiable Randomness & Determinism**: Traditional apps use black-box PRNGs without reproducible seed logging, preventing users and Tarot practitioners from verifying shuffling fairness, auditing spreads, or replaying historical divination sessions.
3. **Restricted Spread & Interpretation Models**: Most apps only support 3-5 hardcoded spreads (e.g. 3-card, Celtic Cross) without a topological graph DSL for custom user-created spreads, dynamic card-slot constraints, or multi-dimensional interpretations (archetypal, astrological, elemental dignities, reversed polarity nuances).
4. **Platform, Auth & Sync Silos**: Native apps lack seamless offline-first execution in low-connectivity environments (such as WeChat Mini Programs or offline terminal environments) while still providing seamless WeChat OAuth authentication, Pro-gated cloud history journaling, AI-assisted synthesis, and premium subscription features.
5. **Sub-par Visual Design & Low-Res Assets**: Existing applications lack editorial elegance and visual depth, often employing compressed, blurry card art with tacky UI themes rather than refined, serene design systems.

**Taroturn** solves these challenges by establishing:
- A high-performance, memory-safe **Rust Core Microkernel (`taroturn-core`)** as the universal single source of truth.
- A **Zen $\times$ WSJ Editorial $\times$ Kintsugi Gold Design System (`taroturn-ui`)** inheriting `ttzip` high-precision visual aesthetics.
- A verified, high-definition **78-card public-domain Rider-Waite-Smith asset pipeline**.
- A secure **Kotlin + Spring Boot 3 + PostgreSQL** cloud backend supporting WeChat OAuth, Apple ID, Pro-exclusive encrypted history journaling, and AGY CLI desktop AI interpretation.

---

## 2. System Architecture & Boundaries

```
                           +-----------------------------------------------+
                           |                 taroturn-cli                  |
                           |   (Terminal UI / CLI / Offline Divination)    |
                           +-----------------------+-----------------------+
                                                   |
                                                   v
+----------------------------------------------------------------------------------------------------+
|                                         taroturn-core (Rust)                                       |
|  +---------------------+  +----------------------+  +---------------------+  +------------------+  |
|  | Card Deck Catalog   |  | Shuffling & Entropy  |  | Spread Graph Engine |  | Rule & Dignity   |  |
|  | (RWS/Thoth/Marseille|  | (ChaCha20 / Seeded   |  | (DAG Slots/Layout   |  | (Elements/Facets |  |
|  | Major/Minor/Polarity|  | Deterministic Replay)|  | Topology Constraints|  | Context Synthesis|  |
|  +---------------------+  +----------------------+  +---------------------+  +------------------+  |
+--------------------------------------------------+-------------------------------------------------+
           |                                       |                                    |
           v (UniFFI / C-ABI)                      v (WASM / WXWebAssembly)             v (Native / Serde)
+-------------------------+             +----------------------+            +-----------------------+
|  Native Mobile/Desktop  |             |  WeChat Mini Program |            |    taroturn-server    |
|   (iOS Swift, Android   |             |   (Offline WX-WASM   |            | (Kotlin + SpringBoot3 |
|    Kotlin, Win/macOS)   |             |  + Mini Program UI)  |            |   PostgreSQL + AI)    |
|  [Taroturn-UI System]   |             |  [Taroturn-UI System]|            +-----------+-----------+
+------------+------------+             +----------+-----------+                        |
             |                                     |                                    |
             +------------ REST / SSE / WeChat OAuth Sync (Pro Members Only) -----------+
```

---

## 3. Requirements & Functional Specifications

### 3.1 Domain Model & Card Catalog (`taroturn-core`)
- **REQ-01 (Standard 78-Card Archetype Registry)**:
  - Full support for 22 Major Arcana (0 The Fool through XXI The World) with Roman numeral indices, Hebrew/Astrological correspondences, and archetypal keywords.
  - Full support for 56 Minor Arcana across 4 Suits: Wands (Fire/Action), Cups (Water/Emotion), Swords (Air/Intellect), Pentacles (Earth/Material).
  - 14 Ranks per suit: Ace, 2-10, Page/Princess, Knight/Prince, Queen, King.
  - Complete card orientation tracking: `Upright` (正位) and `Reversed` (逆位) with distinct psychological and symbolic modifiers.
- **REQ-02 (Multi-Deck System & Custom Themes)**:
  - Built-in canonical decks: Rider-Waite-Smith (RWS 1909), Marseille Tarot, and Thoth Tarot.
  - Schema-driven Custom Deck Extensibility: Capability to ingest custom deck manifests (JSON/CBOR) defining custom card naming, artwork URIs, suit aliases, and custom interpretation facets without engine recompilation.

### 3.2 High-Definition Card Asset Pipeline
- **REQ-03 (Standardized HD RWS Public Domain Assets)**:
  - Integration of authentic 1909 Pamela Colman Smith original Rider-Waite-Smith high-resolution scans (Wikimedia Commons / Public Domain archive).
  - Multi-Resolution Image Asset Packaging:
    - **Ultra-HD (`@3x`)**: $1400 \times 2400$ WebP/AVIF for 4K desktop, iPad, and high-DPI zoom inspection.
    - **Retina (`@2x`)**: $700 \times 1200$ WebP for standard mobile & tablet divination displays.
    - **Thumbnail (`@1x`)**: $200 \times 342$ WebP for card drawer, history timeline, and mini-spread overview.
  - CDN and local caching protocol ensuring instantaneous card rendering and zero offline stutter.

### 3.3 Shuffling, Entropy & Deterministic Replay
- **REQ-04 (Cryptographic & Seeded Shuffling Engine)**:
  - Primary shuffling powered by CSPRNG (`rand_chacha` / ChaCha20) initialized via OS entropy (`getrandom`).
  - Deterministic Seed Protocol: Every shuffle operation yields a 64-byte or 32-byte hexadecimal `RngSeed` and `ShuffleStepLog`. Supplying the exact seed and step sequence to `taroturn-core` MUST deterministically reproduce the exact same card sequence and orientations.
- **REQ-05 (Physical Simulation Modes)**:
  - Support for multi-phase shuffling models: Wash/Overhand/Riffle shuffling, Cut deck (切牌 at arbitrary index $k \in [1, 77]$), and configurable reversal probability ($P_{rev} \in [0.0, 1.0]$, default 0.5, with option for upright-only spreads $P_{rev} = 0.0$).

### 3.4 Spread Topological Engine (牌阵拓扑引擎)
- **REQ-06 (Canonical Predefined Spreads)**:
  - 1 Card: Daily Oracle / Focus Draw (单张牌 / 每日启示).
  - 3 Cards: Past - Present - Future (时间之流), Situation - Obstacle - Advice (圣三角 / 抉择三要素), Mind - Body - Spirit (身心灵).
  - 4 Cards: Four Elements Balance (四要素平衡牌阵).
  - 5 Cards: Choice Spread (二选一抉择牌阵), Pentagram / Cross Spread (小十字 / 元素呼应).
  - 7 Cards: Horseshoe Spread (马蹄形牌阵), Hexagram Spread (六芒星 / 大卫星牌阵).
  - 10 Cards: Celtic Cross (凯尔特十字 - 10-slot deep reading: Heart, Crossing, Root, Past, Crown, Future, Self, Environment, Hopes/Fears, Outcome).
  - 12 Cards: Astrological 12 Houses / Zodiac Spread (黄道十二宫综合运势).
  - 10/11 Cards: Tree of Life / Kabbalistic Spread (生命之树牌阵).
- **REQ-07 (Dynamic Spread Graph DSL)**:
  - Graph-based Slot Definition: Each spread is represented as a directed layout graph where each slot possesses:
    - Unique Slot ID, Display Index, Title (e.g. "Core Dilemma", "Hidden Obstacle").
    - Spatial Coordinates `(x, y, rotation_deg, z_index)`.
    - Semantic Dimension (General, Love, Career, Spiritual, Subconscious).
    - Slot Constraints (e.g. Major Arcana only, specific suit only, or unconstrained).
  - Dynamic user spread creation and validation at runtime via JSON/DSL schemas.

### 3.5 Interpretation & Synthesis Rule Engine
- **REQ-08 (Multi-Faceted Interpretation Library)**:
  - Structured card definitions containing 6 standard interpretation facets: General Meaning, Love & Relationships, Career & Finance, Health & Well-being, Spiritual Growth, and Reversed Shadow Aspects.
- **REQ-09 (Elemental Dignity & Contextual Synthesis)**:
  - Elemental interactions between adjacent and intersecting cards:
    - Compatible/Reinforcing (Fire + Air, Water + Earth).
    - Antagonistic/Weakening (Fire + Water, Air + Earth).
    - Neutral/Passive (Fire + Earth, Air + Water).
  - Statistical Analysis Metrics: Major vs. Minor ratio calculation, dominant suit density, reversed card ratio, and numerological reduction (Quaternary / Pythagorean sum) for bottom-card / shadow-card synthesis.
- **REQ-10 (AI-Assisted Contextual Narrative Synthesis & AGY CLI Bridge)**:
  - Standardized JSON contract for AI Prompt generation. Combining user query, card draws, slot semantics, elemental dignities, and statistical balance into a structured prompt envelope for LLM deep interpretation.
  - Desktop & Terminal AI: Direct integration with `agy` CLI (`agy query`) for local developer/desktop AI interpretations.

### 3.6 Visual Design System (`Taroturn-UI` - Inheriting `ttzip` DNA)
- **REQ-11 (Zen $\times$ WSJ Editorial $\times$ Kintsugi Gold Visual System)**:
  - **Design Philosophy**: High-precision Japanese Zen (禅) minimalism combined with WSJ Editorial serif typography and macOS Sequoia/iOS 18 dynamic Kintsugi Gold (`#D4AF37`) glassmorphic translucency.
  - **Core Color & Material Tokens**:
    - `kintsugiGold`: `#D4AF37` / `#D4B87D` (Dynamic Gold Accent Line for header dividers, selected card halos, and Pro badges).
    - `deepGraphite`: `#1C1C1E` (Dark Mode canvas & sidebar background).
    - `inkBlack`: `#0B0B0C` (Zen deep background for night divination).
    - `washiPaper`: `#FBFBFD` (Warm soft Light Mode background).
    - `bambooGreen`: `#2E8B57` (Action affirmation, elemental growth, successful sync badges).
    - `cinnabarRed`: `#C84B31` (Reversed warning alerts and destructive delete actions).
    - `hairlineBorder`: `Color.primary.opacity(0.08)` ($0.8\text{pt}$ hairline border).
  - **Layout & Golden Rule Geometry**:
    - Standard $52\text{pt}$ Header Bar with $1.5\text{pt}$ `kintsugiGold` rule line precisely aligned at $Y = 90\text{pt}$.
    - Three-Column Desktop / Miller Column spread inspector: Sidebar ($200\text{pt}$), Spread Canvas ($600\text{pt}+$ flexible), Card Inspector ($300\text{pt}$).
    - Floating Glass Islands: $16\text{pt}$ continuous corner radius with subtle `Color.primary.opacity(0.025~0.04)` translucent fill and $0.8\text{pt}$ hairline border.

### 3.7 Rust CLI Tool (`taroturn-cli`)
- **REQ-12 (Terminal User Interface & Workflows)**:
  - Interactive mode with rich terminal UI (via `clap` + ANSI Kintsugi Gold/Zen color palette + box-drawing characters).
  - Commands:
    - `taroturn draw [spread_name]` (Interactive draw with terminal animation / cut options).
    - `taroturn interpret --seed <HEX_SEED> --spread <NAME>` (Deterministic interpretation output).
    - `taroturn interpret --spread <NAME> --ai --provider agy` (Local AGY CLI AI synthesis).
    - `taroturn list-spreads` (List all canonical and custom spreads).
    - `taroturn list-cards [--suit <SUIT>] [--major]` (Card catalog inspector).
    - `taroturn export --format <json|yaml|markdown>` (Export session to disk).

### 3.8 Cross-Platform FFI & WASM Delivery Matrix
- **REQ-13 (UniFFI Native Bridges)**:
  - `taroturn-core` exported via UniFFI producing zero-copy / type-safe bindings for:
    - Swift (macOS & iOS framework / Swift Package).
    - Kotlin (Android AAR / JVM library).
    - C-ABI headers for Windows / C++ integrations.
- **REQ-14 (WeChat Mini Program WASM Bridge)**:
  - WASM bundle compiled via `wasm-bindgen` and optimized for WeChat's `WXWebAssembly` runtime.
  - Zero dynamic heap compilation dependencies, strictly capped WASM binary footprint ($< 1.5\text{MB}$ uncompressed), offline-first local shuffling, card lookup, and spread calculations inside Mini Program JavaScript sandbox.

### 3.9 Cloud Backend, Auth & Strict Pro-Gated Architecture (`taroturn-server`)
- **REQ-15 (Authentication & Account Management)**:
  - WeChat Mini Program One-Click Auth via `wx.login` $\to$ WeChat `code2Session` API, retrieving `openid` and `unionid`.
  - Apple ID Sign-in (JWT signature verification) and Email/Passwordless token authentication for Desktop/Global users.
  - Account unification linking WeChat OpenID and Apple/Email credentials to a unified `user_id`.
- **REQ-16 (Strict Pro-Gated Reading History Journal & Cloud Persistence)**:
  - Non-members / Free users: Zero cloud history storage (ephemeral session only; closing app discards past draws; zero server journal persistence).
  - Pro / VIP members: Encrypted PostgreSQL relational schema storing:
    - `users` (Account info, subscription tier, preferences).
    - `reading_sessions` (Timestamp, spread ID, question, `rng_seed`, card draw indices with orientations, user reflections, tags).
    - `custom_spreads` (User-defined spread DAG definitions).
    - `share_tokens` (Secure expirable tokens for public web sharing cards).
  - `pgvector` vector embedding column for semantic search and resonance analysis across historical divination entries (Pro only).
- **REQ-17 (Tiered Monetization & Feature Gating)**:
  - **Free Tier (Non-Members)**:
    - Unlimited local offline draws & shuffles.
    - All 8 canonical spreads.
    - Standard local rule-based keyword definitions.
    - **No cloud history retention** (0 days).
    - **No cloud AI deep interpretations**.
  - **Pro / VIP Tier (Members)**:
    - Permanent unlimited encrypted cloud history journal & cross-device sync.
    - Deep AI Multi-Perspective Interpretation (LLM synthesis on love, career, shadow psychology).
    - Custom spread builder & custom deck manifest imports.
    - Timeline comparative reading (tracking life questions across multiple historical spreads).
    - High-resolution card face collection & private divination notes export (PDF/Markdown).

---

## 4. Non-Functional Requirements & Engineering Standards

1. **Memory Safety & Zero Panics**: `taroturn-core` MUST compile with `#![forbid(unsafe_code)]` in domain logic, zero panics on any malformed JSON spread inputs, and zero memory leaks under ASan/Valgrind stress tests.
2. **Determinism & Reproducibility**: Given identical seed and spread topology, `taroturn-core` MUST generate identical card sequences across all 5 target architectures (x86_64, aarch64, wasm32, iOS arm64, Android arm64).
3. **Low Latency & High Performance**:
   - Local draw and spread generation in $< 1\text{ms}$ on mobile/WASM.
   - Server REST endpoints response time $P_{99} < 50\text{ms}$ (excluding third-party LLM calls).
4. **Offline Resilience**: Mobile and WeChat Mini Program clients MUST function 100% offline for shuffling, card drawing, spread layouts, and rule lookups.

---

## 5. Success Criteria & Verification Matrix

| Metric | Target | Verification Method |
|---|---|---|
| **Card & Spread Coverage** | 78 Cards + 8 Canonical Spreads + Custom DAG DSL | Automated Unit Tests (`cargo test`) |
| **Deterministic Replay** | 100% Identical Output on Same Seed across all platforms | Cross-Platform Seed Test Suite |
| **WASM Binary Size** | $\le 1.5\text{MB}$ uncompressed, $\le 450\text{KB}$ gzip | `wasm-opt -Oz` artifact inspection |
| **FFI Memory Safety** | 0 Memory Leaks, 0 Panics, 0 Uncaught Exceptions | UniFFI Swift/Kotlin test suites + ASan |
| **UI Design Conformance**| Matches `ttzip` Zen/WSJ/Kintsugi Gold tokens ($Y=90\text{pt}$ header alignment) | Visual Regression & Design Review |
| **Pro Tier Gating** | 403 Forbidden for Non-Members on history sync & cloud AI | Server Authorization Unit & Integration Tests |
| **Mini Program Compatibility**| Passes WeChat DevTools & real device WXWebAssembly test | WeChat Mini Program Dev CI Suite |

---

## 6. Assumptions & Out-of-Scope

### 6.1 Assumptions
1. PostgreSQL 16+ with `pgvector` extension and WeChat Mini Program AppID/Secret are provisioned.
2. High-resolution Rider-Waite-Smith 1909 card assets are stored in CDN with WebP/AVIF multi-tier compression.

### 6.2 Out-of-Scope for Initial Baseline
1. Direct real-time WebRTC 1-on-1 video tarot master consultations (structured text consultations and AI synthesis are in scope, live video is deferred).
2. Physical card printing / physical hardware peripheral NFC readers.
