# Quickstart & Verification Guide: Taroturn System

- **Feature ID**: `001-taroturn-core-system`
- **Target**: `taroturn-core`, `taroturn-cli`, `taroturn-server`, WASM & FFI

---

## 1. Prerequisites

- **Rust**: `rustc 1.80+` & `cargo`
- **WASM**: `wasm-pack`, `wasm-opt`
- **Kotlin / JVM**: `JDK 21+`, `Gradle 8.7+`
- **Database**: PostgreSQL 16+ with `pgvector`
- **AGY CLI**: `agy` executable in PATH (for Desktop AI interpretation)

---

## 2. Core Engine & CLI Local Validation (`taroturn-core` & `taroturn-cli`)

### 2.1 Deterministic Shuffling & Draw Scenario
```bash
# 1. Run unit and integration tests across core engine
cargo test -p taroturn-core

# 2. Interactive terminal draw for Celtic Cross spread with ANSI Zen theme
cargo run -p taroturn-cli -- draw celtic_cross --reversal-rate 0.5

# 3. Deterministic replay of a specific seed
cargo run -p taroturn-cli -- interpret \
  --seed "d4af37bamboo2e8b57cinnabarc84b31washi0b0b0c1c1c1e0000000000000000" \
  --spread celtic_cross \
  --format json
```

### 2.2 Desktop AI Interpretation via AGY CLI
```bash
# Execute local AI synthesis using agy CLI bridge
cargo run -p taroturn-cli -- interpret \
  --spread three_cards_time \
  --question "Should I transition to full-time independent product development?" \
  --ai --provider agy
```

---

## 3. WeChat Mini Program WASM Build & Verification

```bash
# 1. Compile taroturn-core into WebAssembly with size optimization
wasm-pack build crates/taroturn-core \
  --target web \
  --release \
  --out-dir ../taroturn-miniprogram/wasm

# 2. Optimize WASM binary for WeChat WXWebAssembly runtime limit (<1.5MB)
wasm-opt -Oz -o ../taroturn-miniprogram/wasm/taroturn_core_bg.wasm \
  ../taroturn-miniprogram/wasm/taroturn_core_bg.wasm

# 3. Inspect binary size
ls -lh ../taroturn-miniprogram/wasm/taroturn_core_bg.wasm
```

---

## 4. UniFFI Multiplatform Mobile / Desktop Packaging

```bash
# 1. Generate Swift Bindings for macOS & iOS
cargo run -p uniffi-bindgen generate \
  crates/taroturn-core/src/taroturn.udl \
  --language swift \
  --out-dir bindings/swift

# 2. Generate Kotlin Bindings for Android
cargo run -p uniffi-bindgen generate \
  crates/taroturn-core/src/taroturn.udl \
  --language kotlin \
  --out-dir bindings/kotlin
```

---

## 5. Server & PostgreSQL Cloud Sync Verification (`taroturn-server`)

```bash
# 1. Apply Flyway migrations and verify pgvector extension
./gradlew flywayMigrate

# 2. Start Spring Boot 3 server
./gradlew bootRun

# 3. Test WeChat Code2Session Auth & Sync Endpoint
curl -X POST http://localhost:8080/api/v1/auth/wechat \
  -H "Content-Type: application/json" \
  -d '{"code": "mock_wx_code_001"}'

# 4. Push local offline reading journal
curl -X POST http://localhost:8080/api/v1/journal/sync \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d @specs/001-taroturn-core-system/contracts/sync-journal-schema.json
```
