#!/usr/bin/env bash
# ============================================================
# Taroturn macOS 重新构建并启动 (100% Pure Rust + Swift SPM)
# ============================================================

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "============================================================"
echo "  ⚡ 启动 Taroturn 全量重新构建与运行流水线..."
echo "  架构: 纯 Rust 内核 (crates/taroturn-core) + Swift 6 原生 App"
echo "============================================================"

./scripts/build_macos_app.sh --open
