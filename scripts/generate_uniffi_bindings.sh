#!/usr/bin/env bash
set -euo pipefail

echo "==> Building taroturn-core static and dynamic libraries..."
cargo build --release -p taroturn-core

mkdir -p bindings/swift
mkdir -p bindings/kotlin/com/taroturn
mkdir -p bindings/python

echo "==> Generating UniFFI Bindings for Swift (iOS / macOS)..."
cargo run -p taroturn-core --bin uniffi-bindgen --features="uniffi/cli" -- generate \
  --library target/release/libtaroturn_core.dylib \
  --language swift \
  --out-dir bindings/swift

echo "==> Generating UniFFI Bindings for Kotlin (Android)..."
cargo run -p taroturn-core --bin uniffi-bindgen --features="uniffi/cli" -- generate \
  --library target/release/libtaroturn_core.dylib \
  --language kotlin \
  --out-dir bindings/kotlin/com/taroturn

echo "==> Generating UniFFI Bindings for Python..."
cargo run -p taroturn-core --bin uniffi-bindgen --features="uniffi/cli" -- generate \
  --library target/release/libtaroturn_core.dylib \
  --language python \
  --out-dir bindings/python

echo "==> UniFFI Bindings successfully generated in bindings/"
ls -lh bindings/swift bindings/kotlin/com/taroturn bindings/python
