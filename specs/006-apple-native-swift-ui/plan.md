# Implementation Plan: Apple Native Swift UI Migration & Deep OS Integration

- **Feature ID**: `006-apple-native-swift-ui`
- **Specification**: [spec.md](./spec.md)
- **Data Model**: [data-model.md](./data-model.md)
- **Research**: [research.md](./research.md)
- **Contracts**: [contracts/](./contracts)
- **Quickstart**: [quickstart.md](./quickstart.md)
- **Status**: `PLANNING`

---

## 1. Technical Architecture & Component Structure

```
                               ┌──────────────────────────────────────────────┐
                               │         taroturn-core (Rust 2021)            │
                               │  RNG / Layouts / Dignities / OTP Loader FFI  │
                               └──────────────────────┬───────────────────────┘
                                                      │ UniFFI C-ABI
                                                      ▼
                               ┌──────────────────────────────────────────────┐
                               │   TaroturnCorePackage (Swift 6 Strict)       │
                               │   • TarotCoreActor (Actor-Isolated Bridge)   │
                               │   • Swift Value Models (Sendable Types)      │
                               └──────────────────────┬───────────────────────┘
                                                      │
                       ┌──────────────────────────────┼──────────────────────────────┐
                       ▼                              ▼                              ▼
        ┌─────────────────────────────┐┌─────────────────────────────┐┌─────────────────────────────┐
        │   Shared Native Domain      ││  Apple System Integrations  ││  SwiftData & Persistence    │
        │ • ReadingViewModel (@Obs.)  ││ • WidgetKit Extension       ││ • ReadingRecord (@Model)    │
        │ • SpreadDAGCanvasView (120Hz)││ • AppIntents (Siri/Shortcut)││ • JournalEntryRecord         │
        │ • Card3DFlipView (Physics)  ││ • ActivityKit Live Activity ││ • CloudKit Encrypted Sync   │
        │ • HapticSoundEngine (AHAP)  ││ • StoreKitManager (StoreKit2││ • App Group Shared Container│
        └──────────────┬──────────────┘└──────────────┬──────────────┘└──────────────┬──────────────┘
                       │                              │                              │
        ┌──────────────┴──────────────────────────────┼──────────────────────────────┴──────────────┐
        ▼                                             ▼                                             ▼
┌─────────────────────────────┐               ┌─────────────────────────────┐               ┌─────────────────────────────┐
│       macOS Native App      │               │       iOS Native App        │               │      iPadOS Native App      │
│ • ThreeColumnZenWorkspace   │               │ • MobileCarouselLayout      │               │ • Adaptive Split Layout     │
│ • MenuBarExtra (NSStatus)   │               │ • TabView Navigation        │               │ • PencilKit Freehand Markup │
│ • ⌘K Command Palette        │               │ • Dynamic Island Heads-up   │               │ • Stage Manager Multi-Window│
└─────────────────────────────┘               └─────────────────────────────┘               └─────────────────────────────┘
```

---

## 2. Implementation Phases

### Phase 1: Swift 6 Core Bridge & SwiftData Models
- Refine and harden `TarotCoreActor` and `TaroturnCorePackage` with Swift 6 strict concurrency.
- Create SwiftData schema models (`ReadingRecord`, `JournalEntryRecord`, `OtpDeckRecord`) configured with App Group container (`group.com.taroturn.app`) and Private CloudKit sync.
- Create unit tests in `TaroturnCoreTests` verifying Actor isolation, determinism, and data models.

### Phase 2: System Integrations (WidgetKit, AppIntents, ActivityKit)
- Implement `TarotDailyWidget` supporting Lock Screen (Rectangular/Circular), StandBy, and Home/Desktop widgets.
- Implement `DrawDailyCardIntent` and `PerformSpreadReadingIntent` conforming to Apple `AppIntent` protocol with Siri dialog support.
- Implement `TarotRitualActivityAttributes` and Dynamic Island presentation views.

### Phase 3: Multi-Sensory Engine (CoreHaptics AHAP + Spatial Audio)
- Create `HapticSoundEngine` singleton loading bespoke AHAP JSON waveforms (`card_shuffle_riffle.ahap`, `card_cut_snap.ahap`, `card_flip_reveal.ahap`).
- Synchronize audio triggers with 432Hz ambient temple bell sounds via `AVAudioEngine`.

### Phase 4: Platform-Specific Presentation Layers (macOS, iPadOS, iOS)
- **macOS**: Implement `MenuBarExtra` companion popover for instant draws, `⌘K` command palette, and 3-column Zen workspace.
- **iPadOS**: Implement `PencilKitSpreadCanvasView` allowing Apple Pencil handwritten notes over `SpreadDAGCanvasView`.
- **iOS**: Enhance `MobileCarouselLayout` with fluid 3D card tilt gestures and Dynamic Island ritual integration.
- Implement native `StoreKitManager` (StoreKit 2) for in-app unlocks.

### Phase 5: Verification & End-to-End Testing
- Compile entire Apple project with `swift build -Xswiftc -strict-concurrency=complete`.
- Run automated tests verifying contracts, WidgetKit data generation, and SwiftData migrations.
