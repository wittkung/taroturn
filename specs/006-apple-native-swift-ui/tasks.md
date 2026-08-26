# Tasks: Apple Native Swift UI Migration & Deep OS Integration

- **Feature ID**: `006-apple-native-swift-ui`
- **Specification**: [spec.md](./spec.md)
- **Plan**: [plan.md](./plan.md)
- **Data Model**: [data-model.md](./data-model.md)
- **Status**: `COMPLETED`

---

## Dependencies & Story Sequence

```
Phase 1 (Setup) ──► Phase 2 (Foundational)
                         │
        ┌────────────────┼────────────────┬────────────────┐
        ▼                ▼                ▼                ▼
 Phase 3 (US1)     Phase 4 (US2)    Phase 5 (US3)    Phase 6 (US4)
 Universal UI        Widgets/Siri     Haptics/LiveAct   CloudKit Sync
        │                │                │                │
        └────────────────┼────────────────┴────────────────┘
                         ▼
                   Phase 7 (US5)
            Platform Extras & StoreKit 2
                         ▼
                   Phase 8 (Polish)
```

---

## Phase 1: Setup & Toolchain Configuration

- [x] T001 Verify Xcode 16 and Swift 6 compiler toolchain settings in `apps/taroturn-apple/Packages/TaroturnCorePackage/Package.swift`
- [x] T002 [P] Configure App Group entitlements for shared container in `apps/taroturn-apple/Shared/TaroturnShared.entitlements`
- [x] T003 [P] Setup Uniform Type Identifiers for OTP package dropzone in `apps/taroturn-apple/Shared/Info.plist`
- [x] T004 Build and link the latest UniFFI `TaroturnCoreFFI.xcframework` using `scripts/build_apple_xcframework.sh`

---

## Phase 2: Foundational Architecture & Shared Domain

- [x] T005 Harden Swift 6 actor-isolated bridge in `apps/taroturn-apple/Shared/Domain/Actors/TarotCoreActor.swift`
- [x] T006 [P] Implement SwiftData `@Model` classes in `apps/taroturn-apple/Shared/Infrastructure/Persistence/SwiftDataModels.swift`
- [x] T007 [P] Implement CloudKit-enabled ModelContainer factory in `apps/taroturn-apple/Shared/Infrastructure/Persistence/ModelContainerFactory.swift`
- [x] T008 Implement foundational `@Observable` MainActor state machine in `apps/taroturn-apple/Shared/Features/Sanctuary/ReadingViewModel.swift`

---

## Phase 3: User Story 1 (P1) - Native Swift Universal UI Architecture

- [x] T009 [P] [US1] Build 120Hz ProMotion Topological Canvas in `apps/taroturn-apple/Shared/Features/Canvas/SpreadDAGCanvasView.swift`
- [x] T010 [P] [US1] Implement 3D card perspective spring physics in `apps/taroturn-apple/Shared/Features/Canvas/Card3DFlipView.swift`
- [x] T011 [P] [US1] Implement 3-column Zen workspace for macOS in `apps/taroturn-apple/macOS/AdaptiveLayouts/ThreeColumnZenWorkspace.swift`
- [x] T012 [P] [US1] Implement mobile responsive touch carousel for iOS in `apps/taroturn-apple/iOS/AdaptiveLayouts/MobileCarouselLayout.swift`
- [x] T013 [US1] Implement high-resolution 300DPI art scroll exporter in `apps/taroturn-apple/Shared/Features/Interpretation/ReadingArtCardExporter.swift`
- [x] T014 [US1] Add universal unit tests for reading orchestration in `apps/taroturn-apple/Packages/TaroturnCorePackage/Tests/TaroturnCoreTests/ReadingViewModelTests.swift`

---

## Phase 4: User Story 2 (P1) - WidgetKit & Siri / App Intents Deep Integration

- [x] T015 [P] [US2] Implement WidgetKit timeline provider and Daily Card widget in `apps/taroturn-apple/Shared/Integrations/Widgets/DailyCardWidget.swift`
- [x] T016 [P] [US2] Implement Lock Screen and StandBy interactive widget views in `apps/taroturn-apple/Shared/Integrations/Widgets/LockScreenStandByWidgetViews.swift`
- [x] T017 [P] [US2] Implement `DrawDailyCardIntent` conforming to AppIntent in `apps/taroturn-apple/Shared/Integrations/AppIntents/DrawDailyCardIntent.swift`
- [x] T018 [P] [US2] Implement `PerformSpreadReadingIntent` with Siri voice dialog in `apps/taroturn-apple/Shared/Integrations/AppIntents/PerformSpreadReadingIntent.swift`
- [x] T019 [US2] Implement CoreSpotlight indexer for reading entries in `apps/taroturn-apple/Shared/Integrations/Spotlight/ReadingSpotlightIndexer.swift`

---

## Phase 5: User Story 3 (P1) - Dynamic Island, Live Activities & CoreHaptics Engine

- [x] T020 [P] [US3] Create bespoke AHAP waveform JSON assets in `apps/taroturn-apple/Shared/Resources/Haptics/card_shuffle_riffle.ahap`
- [x] T021 [P] [US3] Implement CoreHaptics and spatial sound engine in `apps/taroturn-apple/Shared/Infrastructure/AudioHaptics/HapticSoundEngine.swift`
- [x] T022 [P] [US3] Define ActivityKit `TarotRitualActivityAttributes` in `apps/taroturn-apple/Shared/Integrations/LiveActivities/TarotRitualActivityAttributes.swift`
- [x] T023 [P] [US3] Implement Dynamic Island compact and expanded UI in `apps/taroturn-apple/Shared/Integrations/LiveActivities/TarotDynamicIslandView.swift`
- [x] T024 [US3] Connect ritual state transitions in `ReadingViewModel` to `HapticSoundEngine` and `ActivityKit`

---

## Phase 6: User Story 4 (P2) - SwiftData CloudKit Sync & Continuity Handoff

- [x] T025 [P] [US4] Implement reading session persistence repository in `apps/taroturn-apple/Shared/Infrastructure/Persistence/ReadingSessionRepository.swift`
- [x] T026 [P] [US4] Implement journal entry Markdown editor in `apps/taroturn-apple/Shared/Features/Journal/JournalEntryEditorView.swift`
- [x] T027 [P] [US4] Implement `NSUserActivity` Handoff coordinator in `apps/taroturn-apple/Shared/Infrastructure/Continuity/HandoffCoordinator.swift`
- [x] T028 [US4] Add SwiftData and CloudKit conflict-free merge tests in `apps/taroturn-apple/Packages/TaroturnCorePackage/Tests/TaroturnCoreTests/SwiftDataSyncTests.swift`

---

## Phase 7: User Story 5 (P2) - Platform-Specific Extras & StoreKit 2

- [x] T029 [P] [US5] Implement macOS Menu Bar Extra status item in `apps/taroturn-apple/macOS/MenuBar/TaroturnMenuBarExtra.swift`
- [x] T030 [P] [US5] Implement iPadOS PencilKit canvas overlay in `apps/taroturn-apple/iOS/PencilKit/PencilKitSpreadCanvasView.swift`
- [x] T031 [P] [US5] Implement StoreKit 2 subscription and OTP manager in `apps/taroturn-apple/Shared/Infrastructure/StoreKit/StoreKitManager.swift`
- [x] T032 [P] [US5] Implement Drag-and-Drop OTP package importer in `apps/taroturn-apple/Shared/Features/DeckManagement/OtpDropzoneView.swift`
- [x] T033 [US5] Implement global keyboard shortcut manager (`⌘K`, `Space`) in `apps/taroturn-apple/macOS/Shortcuts/KeyboardShortcutManager.swift`

---

## Phase 8: Polish & End-to-End Validation

- [x] T034 [P] Run full Swift 6 strict concurrency audit across all targets in `apps/taroturn-apple/Packages/TaroturnCorePackage`
- [x] T035 [P] Execute contract linting script across all schemas via `.specify/scripts/bash/lint-contracts.sh`
- [x] T036 Execute complete test suite with zero warnings via `swift test`
- [x] T037 Update project documentation in `apps/taroturn-apple/README.md`
