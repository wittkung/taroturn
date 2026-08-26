# Feature Specification: Apple Architecture SSOT, UniFFI Toolchain & QA Testing Governance

- **Feature ID**: `009-apple-architecture-uniffi-qa-governance`
- **Pipeline Mode**: `[Full SDD]`
- **Status**: `SPECIFIED`
- **Author**: Antigravity / CTO Persona
- **Target Branch**: `main`
- **Created Date**: `2026-08-26`

---

## Clarifications

### Session 2026-08-26
- **Q: 为什么必须彻底消除 `apps/taroturn-apple/` 下的 `Shared` vs `Sources/TaroturnShared` 双重源码树？**  
  **A:** 物理双份代码破坏了单一事实来源 (SSOT)，极易引发“修改未生效”的幽灵 Bug 和团队协作合并分叉。通过修改 `Package.swift` 显式将 Target `path` 指向 `Shared`、`macOS` 和 `iOS`，删除冗余的 `Sources/` 目录，能同时保证 Xcode 与 `swift build` 单点构建一致性。
- **Q: 如何彻底消除 `swift test` 中 UniFFI 出现的 Darwin 26.0 内核版本推断警告？**  
  **A:** 在 `scripts/build_apple_xcframework.sh` 中显式设置 `export MACOSX_DEPLOYMENT_TARGET=14.0` 与 `export IPHONEOS_DEPLOYMENT_TARGET=17.0`，并通过 `--target` 分别编译 `aarch64-apple-darwin`, `x86_64-apple-darwin`, `aarch64-apple-ios`, `aarch64-apple-ios-sim`，用 `lipo` 打包为真正的 Universal XCFramework。
- **Q: 现有的 6 个测试用例为什么需要全面重构？**  
  **A:** 现有测试仅测试结构体赋值与枚举互斥，业务逻辑覆盖率为 0%。必须引入 Swift Testing（`@Suite`, `@Test`）覆盖 `ReadingViewModel` 的异步状态机流转（`Idle -> Shuffling -> Dealing -> Complete`）、内存级 SwiftData 容器 CRUD，以及 Swift 6 Actor 并发安全测试。
- **Q: 如何杜绝跨语言（Rust/TS/Swift）字段名凭空臆断问题？**  
  **A:** 在开发流程中设立前置检查闸门，任何写 UI 代码前必须调用 `view_file` 查阅目标模型定义，并在根目录设立 `PLATFORM_MANIFESTO.md` 明确平台边界。

---

## 1. Executive Summary & User Value

本特性全面落地 6 项系统级工程治理与架构重构，彻底解决 Taroturn 在开发、架构、构建与测试体系中的历史包袱与技术债务：

1. **Apple 端源码单一事实来源 (SSOT)**：修改 `apps/taroturn-apple/Package.swift` 显式映射 `Shared/` 与 `macOS/`，物理删除 `Sources/` 目录，拯救 `iOS/` 孤岛，保证单份代码绝对一致。
2. **Rust-UniFFI 构建链锁死与多架构 XCFramework**：在构建脚本中锁死 `MACOSX_DEPLOYMENT_TARGET=14.0`，消除 Darwin 26.0 内核版本漂移警告，构建包含 macOS (ARM64+x86_64) 与 iOS (ARM64+Simulator) 的 Universal XCFramework。
3. **工业级 Swift 质量工程与测试矩阵**：清理 6 个无意义简单断言，编写 `ReadingViewModel` 完整异步状态机测试、内存隔离 SwiftData 读写测试与 Actor 并发测试。
4. **桌面端信息架构深化**：将卡牌详情检视器全面接入右侧三栏 Inspector 架构，为侧边栏 Tab 注入 `Cmd+1~5` 快捷键与呼吸感转场。
5. **平台宪章与开发契约前置**：在仓库根目录建立 `PLATFORM_MANIFESTO.md`，确立多端职责边界与模型前置检查铁律。

---

## 2. User Stories & Acceptance Scenarios

### User Story 1 (P1): 开发者享受干净唯一的 Apple 代码库与零歧义构建
> **As an** Apple 平台开发者与系统构建者，  
> **I want to** 在唯一的 `Shared/` 与 `macOS/` 目录下编写和调试 Swift 代码，  
> **So that** 无论通过 Xcode 还是 CLI `swift build`，修改均 100% 立即生效，不再有双树同步负担和幽灵 Bug。

- **Scenario 1.1 (SPM 路径直指与无 Sources 冗余)**:
  - *Given* 开发者删除了 `apps/taroturn-apple/Sources` 目录，
  - *When* 在 `apps/taroturn-apple` 下运行 `swift build`，
  - *Then* 构建系统自动读取 `Shared/` 与 `macOS/` 中的源码，0 警告 0 错误生成二进制可执行文件。

---

### User Story 2 (P1): 消除 UniFFI 构建警告与跨平台 ABI 一致性
> **As a** 系统架构师，  
> **I want to** 运行 `swift test` 与 `swift build` 时没有任何 Darwin 26.0 与 macOS 14.0 的版本冲突警告，  
> **So that** 底层 Rust 核心与 Swift 运行时的 ABI 兼容性得到严格保障。

- **Scenario 2.1 (XCFramework 统一目标构建)**:
  - *Given* 重新执行重构后的 `scripts/build_apple_xcframework.sh`，
  - *When* 在 `apps/taroturn-apple` 下执行 `swift test`，
  - *Then* 链接器无任何 `built for newer macOS version` 警告，且同时支持 Apple Silicon 与 Intel 架构。

---

### User Story 3 (P1): 具备可信度的自动化测试与状态机保护网
> **As an** 质量工程负责人，  
> **I want to** 拥有覆盖异步推演状态机、SwiftData 内存持久化读写的测试套件，  
> **So that** 任何状态流转退化或持久化异常均能在 CI 阶段被精准拦截。

- **Scenario 3.1 (异步状态机测试验证)**:
  - *Given* 执行 `swift test`，
  - *When* 测试运行 `ReadingViewModelTests` 与 `SwiftDataPersistenceTests`，
  - *Then* 状态机生命周期（`Idle -> Shuffling -> Dealing -> Complete`）与内存容器读写 100% 断言通过。

---

## 3. Functional Requirements

- **FR-001**: `apps/taroturn-apple/Package.swift` 必须使用显式 `path: "Shared"` 和 `path: "macOS"`，彻底移除对 `Sources/` 目录的依赖。
- **FR-002**: 必须物理删除 `apps/taroturn-apple/Sources` 目录，确保全仓仅存在唯一一份 Swift 源码。
- **FR-003**: `scripts/build_apple_xcframework.sh` 必须显式导出 `MACOSX_DEPLOYMENT_TARGET=14.0` 与 `IPHONEOS_DEPLOYMENT_TARGET=17.0`，并支持 Universal macOS / iOS 交叉编译。
- **FR-004**: 移除 `TaroturnCorePackage/Tests/` 下原有的 6 个无效枚举比较测试，替换为基于真实逻辑的异步状态机与 SwiftData 内存隔离测试。
- **FR-005**: 根目录创建 `PLATFORM_MANIFESTO.md` 明确 Web React、Apple SwiftUI 与 Rust Core 的架构边界与平台规范。

---

## 4. Success Criteria & Measurable Outcomes

- **SC-001**: `apps/taroturn-apple/Sources` 彻底移除，`apps/taroturn-apple` 目录代码冗余率降为 0%。
- **SC-002**: `swift build` 与 `swift test` 编译执行 0 警告、0 错误，完全消除 Darwin 26.0 版本漂移提示。
- **SC-003**: Swift 原生自动化测试用例全部覆盖真实业务逻辑（状态机流转与持久化 CRUD），测试通过率 100%。
