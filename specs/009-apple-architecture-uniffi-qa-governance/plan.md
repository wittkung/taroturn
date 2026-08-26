# Implementation Plan: Apple Architecture SSOT, UniFFI Toolchain & QA Governance

- **Feature ID**: `009-apple-architecture-uniffi-qa-governance`
- **Status**: `PLANNED`
- **Author**: Antigravity / CTO Persona
- **Target Branch**: `main`
- **Created Date**: `2026-08-26`

---

## 1. Technical Context & Scope

治理重构覆盖 5 大模块：
1. **`apps/taroturn-apple/Package.swift` & 目录清理**：切换 Target 路径至 `Shared` 与 `macOS`，删除 `apps/taroturn-apple/Sources`。
2. **`scripts/build_apple_xcframework.sh`**：强制注入 `MACOSX_DEPLOYMENT_TARGET=14.0`，多架构编译与 `lipo` 缝合。
3. **`apps/taroturn-apple/Packages/TaroturnCorePackage/Tests/`**：重写 `ReadingViewModelTests.swift` 与 `SwiftDataSyncTests.swift` 为真实业务状态机与内存容器读写测试。
4. **`PLATFORM_MANIFESTO.md`**：在根目录确立多端定位与开发规范。
5. **桌面端微观交互打磨**：Tab 快捷键（`Cmd+1~5`）与柔和呼吸转场。

---

## 2. Execution Phases

### Phase 1: Directory & SPM Architecture Cleanup
- 修改 `Package.swift`，执行 `rm -rf apps/taroturn-apple/Sources`。
- 运行 `swift build` 验证路径映射与编译完整性。

### Phase 2: Toolchain Build Script Upgrade
- 重构 `scripts/build_apple_xcframework.sh`，锁定环境变量与 Universal Target。
- 重新编译生成 `TaroturnCoreFFI.xcframework`，消除链接警告。

### Phase 3: QA Test Suite Deepening
- 编写 `ReadingViewModelTests.swift` 测试异步状态机。
- 编写 `SwiftDataSyncTests.swift` 测试真实内存 CRUD。
- 执行 `swift test` 验证。

### Phase 4: Platform Manifesto & UI Polish
- 创建 `PLATFORM_MANIFESTO.md`。
- 为 `ZenSidebarNavView` 添加快捷键与转场动画。
