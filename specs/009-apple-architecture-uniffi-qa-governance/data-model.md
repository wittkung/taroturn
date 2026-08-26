# Data Model & Architecture Contracts: Apple Governance

- **Feature ID**: `009-apple-architecture-uniffi-qa-governance`
- **Schema Version**: `1.4.0`
- **Date**: 2026-08-26

---

## 1. Apple SPM Target Path Mapping

```
apps/taroturn-apple/
├── Package.swift               <- SPM manifest (Explicit canonical paths)
├── Packages/
│   └── TaroturnCorePackage/    <- Rust UniFFI Framework package
├── Shared/                     <- Target: "TaroturnShared" (path: "Shared")
│   ├── Domain/
│   ├── Features/
│   ├── Infrastructure/
│   └── Integrations/
├── macOS/                      <- Target: "TaroturnApp" (path: "macOS")
│   ├── AdaptiveLayouts/
│   ├── App/
│   ├── MenuBar/
│   └── Shortcuts/
└── iOS/                        <- Target: "TaroturniOS" (path: "iOS", ready for iOS target)
```

---

## 2. Toolchain Environment Model

| 环境变量 / 参数 | 设定值 | 目的 |
| :--- | :--- | :--- |
| `MACOSX_DEPLOYMENT_TARGET` | `14.0` | 锁定 macOS 最低支持系统版本，消除 Darwin 26.0 漂移 |
| `IPHONEOS_DEPLOYMENT_TARGET` | `17.0` | 锁定 iOS 最低支持系统版本 |
| `aarch64-apple-darwin` | Rust Target | 编译 Apple Silicon macOS 原生静态库 |
| `x86_64-apple-darwin` | Rust Target | 编译 Intel macOS 原生静态库 |
| `aarch64-apple-ios` | Rust Target | 编译 iOS 物理设备原生静态库 |
| `aarch64-apple-ios-sim` | Rust Target | 编译 Apple Silicon iOS 模拟器原生静态库 |

---

## 3. Asynchronous Test State Machine Model

```
[Idle] 
  ──(startShuffling)──> [Shuffling (60fps Fluid Active)] 
  ──(dealCards)───────> [Dealing (Sequential Flip)] 
  ──(staggerComplete)─> [Complete (All Placed Slots Exposed)]
```
