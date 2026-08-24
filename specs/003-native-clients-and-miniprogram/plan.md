# Implementation Plan: Native Clients & WeChat Mini Program Integration

- **Feature ID**: `003-native-clients-and-miniprogram`
- **Specification**: [spec.md](./spec.md)
- **Data Model**: [data-model.md](./data-model.md)
- **Research**: [research.md](./research.md)
- **Contracts**: [contracts/](./contracts)
- **Quickstart**: [quickstart.md](./quickstart.md)
- **Status**: `PLANNING`

---

## 1. Technical Context & Multi-Tier Architecture

Taroturn multi-platform clients consume a single source of truth (SSOT) from `taroturn-core` via two primary bridges:
1. **UniFFI XCFramework Bridge** for Apple SwiftUI Native (macOS/iOS): Direct native C-ABI static library (`libtaroturn_core.a`) execution within Swift 6 Actor isolation.
2. **TypeScript SSOT & WXS Engine** for WeChat Mini Program (`apps/taroturn-miniprogram`): Subpackage-split client with 0-delay WXS 3D gesture manipulation, WebAudio context pool, and automatic 401 JWT refresh.

```
                           ┌────────────────────────────────────────────────┐
                           │      crates/taroturn-core (Rust Microkernel)   │
                           └───────────────────────┬────────────────────────┘
                                                   │
                   ┌───────────────────────────────┴───────────────────────────────┐
                   ▼                                                               ▼
    [UniFFI C-ABI Static Lib Matrix]                                [SSOT Canonical JSON / TS Core]
    • macOS Universal (ARM64/x86_64)                                • 78 Cards + 36 Decans + Sephiroth
    • iOS Device (ARM64)                                            • ChaCha20 Deterministic CSP Solver
    • iOS Simulator (Universal)                                     • Golden Dawn Pairwise Dignity Tensors
                   │                                                               │
                   ▼                                                               ▼
    ┌───────────────────────────────┐                               ┌───────────────────────────────┐
    │     apps/taroturn-apple       │                               │   apps/taroturn-miniprogram   │
    │  • Swift 6 Strict Concurrency │                               │  • Main package < 500KB       │
    │  • TarotCoreActor Isolation   │                               │  • subpackages/tarot (preload)│
    │  • SwiftUI 120Hz DAG Canvas   │                               │  • WXS 0-latency 3D Gestures  │
    │  • StoreKit 2 & SwiftData     │                               │  • wx.vibrateShort & Audio    │
    └───────────────────────────────┘                               └───────────────────────────────┘
```

---

## 2. Phase Breakdown & Implementation Roadmap

### Phase 1: Setup & Project Initialization
- Create `apps/taroturn-miniprogram` with standard WeChat Mini Program project structure, `project.config.json`, `app.json`, subpackage routing, and TS configuration.
- Create `apps/taroturn-apple` with Swift Package Manager (SPM) manifest (`Package.swift`) and UniFFI XCFramework build script (`scripts/build_apple_xcframework.sh`).

### Phase 2: User Story 1 - WeChat Mini Program Ecosystem
- Implement `TaroturnApiClient` with automatic 401 interception, `wx.login` exchange, and `wx.setStorageSync` JWT storage.
- Implement WXS-driven 3D card drag & flip (`card-gesture.wxs`) running directly on the render thread.
- Implement `SoundManager` audio pool with `wx.createWebAudioContext()` and `HapticFeedback` matrix.
- Assemble `subpackages/tarot` with Spread Selection, 3D Reading Board, and AI Interpretation Drawer.

### Phase 3: User Story 2 - Apple SwiftUI Universal Ecosystem
- Implement `TarotCoreActor` wrapping UniFFI functions with Swift 6 `@Sendable` compliance.
- Implement `SpreadDAGCanvasView` rendering animated Bézier curve energy flows (`SlotEdge`) on SwiftUI `Canvas`.
- Implement `Card3DFlipView` with perspective rotation, drag tilt, and specular highlights.
- Implement responsive multi-column workspace for macOS (`NavigationSplitView`) and mobile carousel for iOS.
- Implement `StoreKitManager` (StoreKit 2) and `SwiftData` offline journal persistence.

### Phase 4: User Story 3 - Multi-Sensory Ritual & Sharing Art Card Exporter
- Build Web Audio / Mini Program / Apple 4-stage Spring physics and 432Hz ambient sound engine.
- Implement 300DPI editorial art scroll exporter (OffscreenCanvas for Web/WeChat, `ImageRenderer` for SwiftUI).
- Verify 100% parity of reading sessions and dignity tensors across Web, WeChat, CLI, and Apple clients for identical seeds.

---

## 3. Verification & Quality Gates

1. **WeChat Mini Program Gate**: Package analyzer confirms main package $<500\text{KB}$; silent login and offline spread simulation execute with zero exceptions.
2. **Apple SwiftUI Gate**: `swift build` and `swift test` succeed with zero Swift 6 concurrency warnings under `-strict-concurrency=complete`.
3. **Parity Gate**: Seed test vectors run identically across Rust Core, Web, Mini Program, and Swift native clients.
