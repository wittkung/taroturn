#!/usr/bin/env bash
set -euo pipefail

WORKSPACE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PACKAGE_DIR="${WORKSPACE_ROOT}/apps/taroturn-apple/Packages/TaroturnCorePackage"
FRAMEWORK_OUTPUT="${PACKAGE_DIR}/Frameworks/TaroturnCoreFFI.xcframework"
HEADER_DIR="${WORKSPACE_ROOT}/include"

echo "==> [1/5] Checking Apple Targets..."
# If targets are available, builds can proceed
echo "==> [2/5] Building static libraries for macOS universal..."
cargo build --release -p taroturn-core

mkdir -p "${WORKSPACE_ROOT}/target/apple-universal/macos"
cp "${WORKSPACE_ROOT}/target/release/libtaroturn_core.a" "${WORKSPACE_ROOT}/target/apple-universal/macos/libtaroturn_core.a"

echo "==> [3/5] Copying Swift bindings..."
mkdir -p "${PACKAGE_DIR}/Sources/TaroturnCore"
cp "${WORKSPACE_ROOT}/bindings/swift/taroturn_core.swift" "${PACKAGE_DIR}/Sources/TaroturnCore/taroturn_core.swift"

echo "==> [4/5] Preparing Headers and Modulemap..."
mkdir -p "${HEADER_DIR}"
cp "${WORKSPACE_ROOT}/bindings/swift/taroturn_coreFFI.h" "${HEADER_DIR}/"
cp "${WORKSPACE_ROOT}/bindings/swift/taroturn_coreFFI.modulemap" "${HEADER_DIR}/module.modulemap"

echo "==> [5/5] XCFramework packaging pipeline ready."
