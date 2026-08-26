#!/usr/bin/env bash
set -euo pipefail

# 1. 显式锁定部署目标（消除 Darwin 26.0 内核版本推断漂移）
export MACOSX_DEPLOYMENT_TARGET=14.0
export IPHONEOS_DEPLOYMENT_TARGET=17.0

WORKSPACE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PACKAGE_DIR="${WORKSPACE_ROOT}/apps/taroturn-apple/Packages/TaroturnCorePackage"
FRAMEWORK_OUTPUT="${PACKAGE_DIR}/Frameworks/TaroturnCoreFFI.xcframework"
HEADER_DIR="${WORKSPACE_ROOT}/include"

echo "==> [1/5] Compiling Rust Core with explicit target aarch64-apple-darwin..."
cargo build --release -p taroturn-core --target aarch64-apple-darwin

mkdir -p "${WORKSPACE_ROOT}/target/apple-universal/macos"
cp "${WORKSPACE_ROOT}/target/aarch64-apple-darwin/release/libtaroturn_core.a" "${WORKSPACE_ROOT}/target/apple-universal/macos/libtaroturn_core.a"

echo "==> [2/5] Regenerating UniFFI Swift bindings from dynamic library..."
mkdir -p "${WORKSPACE_ROOT}/bindings/swift"
cargo run --features=uniffi/cli -p taroturn-core --bin uniffi-bindgen generate \
    --library "${WORKSPACE_ROOT}/target/aarch64-apple-darwin/release/libtaroturn_core.dylib" \
    --language swift \
    --out-dir "${WORKSPACE_ROOT}/bindings/swift"

mkdir -p "${PACKAGE_DIR}/Sources/TaroturnCore"
cp "${WORKSPACE_ROOT}/bindings/swift/taroturn_core.swift" "${PACKAGE_DIR}/Sources/TaroturnCore/taroturn_core.swift"

# Swift 6 Strict Concurrency fix for UniFFI global lazy initialization variable
sed -i '' 's/private var initializationResult/private let initializationResult/g' "${PACKAGE_DIR}/Sources/TaroturnCore/taroturn_core.swift"

echo "==> [3/5] Preparing Headers and Modulemap..."
mkdir -p "${HEADER_DIR}"
cp "${WORKSPACE_ROOT}/bindings/swift/taroturn_coreFFI.h" "${HEADER_DIR}/"
cp "${WORKSPACE_ROOT}/bindings/swift/taroturn_coreFFI.modulemap" "${HEADER_DIR}/module.modulemap"

echo "==> [4/5] Generating XCFramework..."
rm -rf "${FRAMEWORK_OUTPUT}"
mkdir -p "${PACKAGE_DIR}/Frameworks"
xcodebuild -create-xcframework \
    -library "${WORKSPACE_ROOT}/target/apple-universal/macos/libtaroturn_core.a" \
    -headers "${HEADER_DIR}" \
    -output "${FRAMEWORK_OUTPUT}"

echo "==> [5/5] 🎉 XCFramework successfully built at ${FRAMEWORK_OUTPUT}."
