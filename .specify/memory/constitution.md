# Taroturn Project Constitution & Engineering Governance

- **Project Name**: `taroturn`
- **Version**: `1.0.0`
- **Ratification Date**: `2026-08-24`
- **Last Amended Date**: `2026-08-24`
- **Governance Lead**: CTO / Chief Architect Persona

---

## 1. Core Principles

### Principle 1: Single Source of Truth Microkernel (Rust Core)
All domain rules, card catalog metadata, spread topological layouts, RNG/shuffling algorithms, and elemental dignity calculations MUST reside strictly within `taroturn-core` (Rust). No client platform (iOS, Android, Web, WeChat Mini Program) or backend server may re-implement or diverge from core calculation logic.

### Principle 2: Zero-Panic & Memory Safety
`taroturn-core` MUST enforce `#![forbid(unsafe_code)]` in all domain modules. Any FFI/C-ABI boundary must perform complete pointer and boundary validation with structured error envelopes (`TaroturnErrorInfo`), ensuring zero Undefined Behavior (UB), zero panics, and zero memory leaks.

### Principle 3: Cryptographic Determinism & Replayability
Every card shuffle and spread draw MUST be verifiable and reproducible via a deterministic seed protocol (`RngSeed`). Any session recorded with its seed and parameters must reproduce the exact same card layout across all target platforms (x86_64, aarch64, wasm32).

### Principle 4: Offline-First Architecture
All client applications (CLI, Desktop, Mobile, WeChat Mini Program) MUST support 100% offline core divination workflows (shuffling, drawing, spreading, rule-based interpretation) without network dependency. Cloud sync to `taroturn-server` is an asynchronous, conflict-free augmentation.

### Principle 5: Strict Contract & Schema Governance
All cross-boundary communication (C-ABI structs, UniFFI interface definitions, WASM exports, REST JSON envelopes, PostgreSQL DDL) must be governed by deterministic schema contracts and validated through automated linting scripts (`lint-contracts.sh`, `lint-tasks.sh`).

---

## 2. Governance & Workflow

- **Specification State Machine**: Feature lifecycles strictly follow `constitution → specify → clarify → plan → tasks → implement → converge → analyze`.
- **Pre-Flight Gates**: No implementation code may be written before contracts pass `lint-contracts.sh` and task lists pass `lint-tasks.sh`.
- **Quality Verification**: All PRs must compile cleanly with zero warnings, pass unit tests across Rust, Kotlin, and client targets, and maintain backward-compatible database migrations.
