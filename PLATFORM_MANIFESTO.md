# Taroturn Platform Architecture Manifesto & Multi-Repo Protocols

- **Document Version**: `1.0.0`
- **Effective Date**: `2026-08-26`
- **Scope**: All AI Agents, Subagents, and Human Contributors across `taroturn`

---

## 1. Multi-Platform Architectural Boundaries (平台架构边界)

| 平台 / 工程 | 技术栈 | 职责与体验定位 | 严禁行为 |
| :--- | :--- | :--- | :--- |
| **Apple Native (`apps/taroturn-apple`)** | Swift 6, SwiftUI, SwiftData, Metal, UniFFI | **Primary Desktop & Mobile Experience (SSOT)**<br>承载 macOS 桌面级 Zen 3 栏架构、52pt 顶栏金缮金线、Metal 流体着色、原生 CoreHaptics 与 CloudKit 同步。 | 严禁在此目录建立双重 `Sources/` 镜像目录；必须使用 `Shared/` 与 `macOS/` 作为权威源码。 |
| **Web Client (`apps/taroturn-app`)** | React 19, TypeScript, Tailwind CSS, Vite | **Universal Web Companion**<br>作为 Web 轻量探索、跨平台 Web 展示与 API 接入的补充端。 | 严禁将针对 macOS SwiftUI 的设计规范（如 `ttzip-ui-design-system`）盲目生搬硬套到 Web 前端。 |
| **Rust Core (`crates/taroturn-core`)** | Rust 2021, UniFFI, ChaCha20 CSPRNG | **Cryptographic & Archetype SSOT**<br>唯一的密码学洗牌、确定性推演状态机与 78 张卡牌原典/四要素尊位判定微内核。 | 严禁手写平台模型产生字段漂移；必须以 Rust 模型为唯一源头生成跨端契约。 |

---

## 2. Hard Quality Guardrails (开发硬性铁律)

### 铁律 1: 平台路由前置确权 (Platform Dispatch Gate)
在 Spec Kit 的 `specify` 与 `clarify` 阶段，必须显式声明目标平台：
- 若需求涉及 macOS 桌面级体验、Zen 侧边栏或 SwiftUI 视图，**必须且只能**路由到 `apps/taroturn-apple`。
- 若需求涉及 Web 浏览器体验，必须显式标明 `[Target: Web React]`。

### 铁律 2: 实体定义强制前置查阅 (No Hallucinated Properties)
在编写任何涉及跨模块、跨语言的 UI 或业务代码前，**必须调用 `view_file` 查阅目标数据模型（如 Swift Struct / TS Interface）的真实属性**。严禁凭空猜测 `number`, `imageName`, `cards`, `keywords` 等常见字段名。

### 3. 构建与部署目标锁死 (Toolchain Pinning)
- Apple 平台最低部署目标为 `macOS 14.0` 与 `iOS 17.0`。
- Rust 构建必须显式传递 `export MACOSX_DEPLOYMENT_TARGET=14.0` 与具体 Target 架构（如 `aarch64-apple-darwin`），严禁回退至 Darwin 宿主内核版本推断。
