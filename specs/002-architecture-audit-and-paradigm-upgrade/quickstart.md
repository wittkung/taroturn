# Quickstart & Verification Guide: Architecture Upgrade (v2)

- **Feature ID**: `002-architecture-audit-and-paradigm-upgrade`
- **Target**: `taroturn-core`, `apps/taroturn-app`, `taroturn-server`

---

## 1. Prerequisites

- Rust Toolchain 1.80+ (`cargo`, `rustc`)
- Node.js 20+ & npm / vite
- `wasm-pack` (`cargo install wasm-pack` or npm `wasm-pack`)
- Java 21+ & Gradle 8+

---

## 2. Core Microkernel Verification

### 2.1 Run Automated Unit Tests & Invariant Checks
```bash
cargo test --workspace
```
*Expected Outcome*:
- `test_deterministic_shuffling_parity` passes.
- `test_csp_slot_constraints` passes without card duplicates.
- `test_golden_dawn_pairwise_dignities` passes.
- `test_canonical_spreads_dag_invariance` passes with valid DAG edges.

### 2.2 Run Zero-Allocation Benchmark
```bash
cargo test --test cross_platform_seed_test
```

---

## 3. WebAssembly & Frontend Verification

### 3.1 Build WASM Package
```bash
wasm-pack build crates/taroturn-core --target web --out-dir ../../packages/taroturn-wasm --features wasm
```

### 3.2 Verify Frontend Build with WASM Single Source of Truth
```bash
cd apps/taroturn-app
npm run build
```
*Expected Outcome*:
- TypeScript typechecks cleanly.
- `cardsData.ts` removed; all data loaded directly from WASM.

---

## 4. Backend Spring Security Verification

### 4.1 Run Security Integration & Negative Test Suites
```bash
cd server/taroturn-server
./gradlew test
```
*Expected Outcome*:
- Unauthenticated requests to `/api/v1/journal/**` and `/api/v1/ai/**` return HTTP 401 Unauthorized.
- Spoofed `X-User-Id` header without valid JWT is rejected at the filter level.
- Valid Pro-tier JWT access succeeds with HTTP 200 OK.
