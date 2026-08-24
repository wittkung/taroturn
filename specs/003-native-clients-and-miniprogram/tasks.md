# Tasks: Native Clients & WeChat Mini Program Integration

- **Feature ID**: `003-native-clients-and-miniprogram`
- **Specification**: [spec.md](./spec.md)
- **Plan**: [plan.md](./plan.md)
- **Data Model**: [data-model.md](./data-model.md)
- **Contracts**: [contracts/](./contracts)
- **Status**: `COMPLETED`

---

## Phase 1: Setup & Project Initialization

- [x] T001 Initialize WeChat Mini Program project structure in `apps/taroturn-miniprogram/project.config.json`
- [x] T002 [P] Configure TypeScript and subpackage routing in `apps/taroturn-miniprogram/app.json`
- [x] T003 [P] Initialize Apple Swift Package and project directory in `apps/taroturn-apple/Packages/TaroturnCorePackage/Package.swift`

---

## Phase 2: Foundational Multi-Platform Packaging

- [x] T004 Create Apple Universal XCFramework build script in `scripts/build_apple_xcframework.sh`
- [x] T005 [P] Mirror canonical card deck and CSP shuffling TS logic in `apps/taroturn-miniprogram/core/card_deck.ts`
- [x] T006 [P] Configure Swift 6 Sendable extensions for UniFFI models in `apps/taroturn-apple/Packages/TaroturnCorePackage/Sources/TaroturnCore/TaroturnCore+Sendable.swift`

---

## Phase 3: User Story 1 - WeChat Mini Program Ecosystem

**Goal**: Deliver a zero-install, 60fps responsive WeChat Mini Program with offline CSP divination and silent WeChat OAuth.
**Independent Test Criteria**: Mini Program main package $<500\text{KB}$; silent `wx.login` credential exchange executes with automatic 401 retry; offline draws complete in $<50\text{ms}$.

- [x] T007 [US1] Implement `TaroturnApiClient` with automatic 401 token refresh in `apps/taroturn-miniprogram/utils/api_client.ts`
- [x] T008 [P] [US1] Implement `AuthStorage` token persistence in `apps/taroturn-miniprogram/utils/auth_storage.ts`
- [x] T009 [P] [US1] Implement WXS 0-latency 3D card drag & flip in `apps/taroturn-miniprogram/components/tarot-card/gesture.wxs`
- [x] T010 [US1] Implement `SoundManager` audio pool and `HapticFeedback` in `apps/taroturn-miniprogram/utils/sound_manager.ts`
- [x] T011 [US1] Build Tarot Reading Board interactive page in `apps/taroturn-miniprogram/subpackages/tarot/pages/reading-board/index.ts`
- [x] T012 [P] [US1] Build Spread Selector and AI Interpretation in `apps/taroturn-miniprogram/subpackages/tarot/pages/spread-select/index.ts`

---

## Phase 4: User Story 2 - Apple SwiftUI Universal Ecosystem

**Goal**: Deliver an authentic Apple Native app on iOS and macOS with Swift 6 concurrency, 120Hz DAG Canvas, and StoreKit 2.
**Independent Test Criteria**: Xcode builds with zero Swift 6 concurrency warnings; 120Hz ProMotion card flips animate smoothly without dropped frames.

- [x] T013 [US2] Implement `TarotCoreActor` wrapping UniFFI bindings in `apps/taroturn-apple/Shared/Domain/Actors/TarotCoreActor.swift`
- [x] T014 [P] [US2] Implement `@Observable` `ReadingViewModel` state machine in `apps/taroturn-apple/Shared/Features/Sanctuary/ReadingViewModel.swift`
- [x] T015 [P] [US2] Implement `SpreadDAGCanvasView` Bézier topological flow in `apps/taroturn-apple/Shared/Features/Canvas/SpreadDAGCanvasView.swift`
- [x] T016 [US2] Implement `Card3DFlipView` with perspective rotation and specular glare in `apps/taroturn-apple/Shared/Features/Canvas/Card3DFlipView.swift`
- [x] T017 [P] [US2] Implement macOS 3-column Zen workspace in `apps/taroturn-apple/macOS/AdaptiveLayouts/ThreeColumnZenWorkspace.swift`
- [x] T018 [P] [US2] Implement iOS mobile carousel layout in `apps/taroturn-apple/iOS/AdaptiveLayouts/MobileCarouselLayout.swift`
- [x] T019 [US2] Implement `StoreKitManager` (StoreKit 2) and `SwiftData` persistence in `apps/taroturn-apple/Shared/Infrastructure/StoreKit/StoreKitManager.swift`

---

## Phase 5: User Story 3 - Multi-Sensory Ritual & Sharing Art Card Exporter

**Goal**: Unify 4-stage Spring physical dynamics, 432Hz ambient soundscapes, and 300DPI editorial art scroll export across all clients.
**Independent Test Criteria**: Exported PNG art scrolls contain full 9:16 high-resolution graphics and ChaCha20 seed proofs.

- [x] T020 [P] [US3] Implement WebAudio / MiniProgram / Apple Zen Soundscape Engine in `apps/taroturn-app/src/services/zenAudioEngine.ts`
- [x] T021 [US3] Implement WeChat Mini Program `OffscreenCanvas` 2D art card exporter in `apps/taroturn-miniprogram/subpackages/tarot/utils/card_exporter.ts`
- [x] T022 [P] [US3] Implement Apple SwiftUI `ImageRenderer` 300DPI art scroll exporter in `apps/taroturn-apple/Shared/Features/Interpretation/ReadingArtCardExporter.swift`

---

## Phase 6: Polish & Multi-Tier Verification

- [x] T023 Verify deterministic cross-platform seed parity test in `tests/cross_platform_seed_test.rs`
- [x] T024 [P] Run WeChat Mini Program build validation and package size audit
- [x] T025 [P] Run Swift Package tests under Swift 6 strict concurrency

---

## Dependencies & Execution Strategy

```
Phase 1 (Setup) ──► Phase 2 (Foundational Multi-Platform Packaging)
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
Phase 3 (WeChat Mini Program)   Phase 4 (Apple SwiftUI Universal)
             │                           │
             └─────────────┬─────────────┘
                           ▼
Phase 5 (Multi-Sensory Ritual & Art Scroll Exporter)
                           │
                           ▼
Phase 6 (Polish & Cross-Platform Verification)
```
