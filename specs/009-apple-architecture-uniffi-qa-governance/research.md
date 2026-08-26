# Technical Research: Apple Architecture SSOT, UniFFI Toolchain & QA Governance

- **Feature ID**: `009-apple-architecture-uniffi-qa-governance`
- **Target**: `apps/taroturn-apple`, `scripts/`, `crates/taroturn-core`
- **Date**: 2026-08-26

---

## 1. Subagent Research Consolidation & Decisions

### Decision 1: Apple SPM Canonical Path Mapping
- **Source**: Subagent 3 (Apple SPM & Project Architecture Specialist)
- **Decision**: 修改 `apps/taroturn-apple/Package.swift`，使用 `path: "Shared"` 和 `path: "macOS"`，彻底移除 `apps/taroturn-apple/Sources/` 目录。
- **Rationale**: 物理仅保留一份代码，消灭双树同步与幽灵 Bug，保持 100% 单一事实来源 (SSOT)。

### Decision 2: Rust-UniFFI Universal XCFramework Build Standardization
- **Source**: Subagent 6 (Rust-UniFFI Toolchain Specialist)
- **Decision**: 重构 `scripts/build_apple_xcframework.sh`，显式声明 `export MACOSX_DEPLOYMENT_TARGET=14.0` 与 `export IPHONEOS_DEPLOYMENT_TARGET=17.0`，通过 `--target` 分别编译 macOS (ARM64+x86_64) 与 iOS (ARM64+Simulator)，并用 `lipo` 缝合。
- **Rationale**: 彻底阻断 LLVM 从 Darwin 26.x 宿主内核主版本推断部署目标的漏洞，消除链接器警告，确保跨架构 ABI 一致。

### Decision 3: Industrial-Grade Swift QA Test Matrix
- **Source**: Subagent 5 (Automated Test & QA Specialist)
- **Decision**: 废除 `TaroturnCoreTests` 中 6 个无业务价值的枚举断言。引入对 `ReadingViewModel` 的异步状态机流转测试（`startShuffling -> dealCards -> complete`）和基于 `ModelConfiguration(isStoredInMemoryOnly: true)` 的 SwiftData 内存隔离测试。
- **Rationale**: 从“语法形式主义测试”跨越为“业务状态机与数据完整性测试”，真实筑牢代码质量底线。

### Decision 4: Platform Manifesto & Contract Verification Guardrails
- **Source**: Subagent 1 & Subagent 2
- **Decision**: 根目录确立 `PLATFORM_MANIFESTO.md`，并在开发纪律中声明“写 UI 必须前置查阅 Model 实体定义”。
- **Rationale**: 消除 Monorepo 下跨端优先级混淆与模型字段名臆断。
