# Feature Specification: Apple Native Swift UI Migration & Deep OS Integration

- **Feature ID**: `006-apple-native-swift-ui`
- **Pipeline Mode**: `[Full SDD]`
- **Status**: `SPECIFIED & CLARIFIED`
- **Author**: Antigravity / CTO Persona
- **Target Branch**: `main`
- **Created Date**: `2026-08-25`

---

## Clarifications

### Session 2026-08-25
- **Q: What is the primary architecture for cross-Apple multiplatform UI sharing vs platform-specific customization?**  
  **A:** Use a shared core UI module (`Shared/`) containing domain models, `@Observable` ViewModels, UniFFI actors, 3D card physics, and Canvas DAG rendering, with platform-specific presentation layers (`macOS/` for 3-column Zen workspace & Menu Bar popover, `iOS/` for Mobile Carousel & TabView, `iPadOS/` for SplitView & PencilKit markup).
- **Q: How will SwiftData and CloudKit handle offline seed reproduction and reading sync without server dependency?**  
  **A:** All reading session records store the raw 64-hex seed (`rngSeed`), `spreadId`, question, and timestamps; on any device, the reading can be either hydrated from local cached JSON or deterministically recomputed on-the-fly via `TarotCoreActor` in offline mode.
- **Q: What is the fallback behavior if an unauthenticated or offline user invokes Siri or WidgetKit?**  
  **A:** Widgets and Siri AppIntents execute 100% locally against the local UniFFI Rust microkernel and shared App Group storage without requiring network or cloud authentication.

---

## 1. Executive Summary & User Value

Taroturn transitions its entire Apple platform frontend (macOS, iOS, iPadOS, and expandable to watchOS/visionOS) from hybrid/web interfaces into a 100% pure, native Swift 6 and SwiftUI experience. By bridging directly to the Rust microkernel (`taroturn-core`) via UniFFI C-ABI with strict actor concurrency, Taroturn unlocks the full hardware and operating system capabilities of the Apple ecosystem:

1. **Pure Native Swift 6 Universal Client**:
   - High-fidelity Apple Silicon Liquid Glass aesthetics, 120Hz ProMotion fluid spring animations, tactile haptics, and zero-overhead native rendering across macOS, iOS, and iPadOS.
2. **Deep Apple Operating System Integrations**:
   - **WidgetKit**: Lock Screen, StandBy, Home Screen, and macOS Desktop widgets for daily card draws, lunar phases, and astrological hours.
   - **App Intents & Siri Shortcuts**: System-wide voice actions ("*Hey Siri, draw my daily tarot card*") and Spotlight search indexing (`CoreSpotlight`) for personal reading journals.
   - **ActivityKit & Dynamic Island**: Live Activities for ongoing contemplative ritual sessions and sacred timers.
   - **PencilKit & Scribble**: Tactile Apple Pencil markup and freehand ritual journaling on iPadOS.
   - **Continuity, Handoff & CloudKit**: Seamless reading transition across Mac, iPad, and iPhone with end-to-end encrypted SwiftData CloudKit sync.
   - **CoreHaptics & Spatial Soundscapes**: Precise AHAP tactile impulses synchronized with binaural 432Hz spatial audio.
   - **macOS Native Ergonomics**: Menu Bar status item (`NSStatusItem`) for instantaneous daily draws, native multi-window workflows, and keyboard command palette (`⌘K`).
   - **StoreKit 2**: Frictionless native in-app subscriptions and OTP deck unlocks with StoreKit Transaction listeners.

---

## 2. User Stories & Acceptance Scenarios

### User Story 1 (P1): 100% Native Swift Universal App Architecture
> **As an** Apple ecosystem user on Mac, iPhone, or iPad,  
> **I want to** experience a pure, native SwiftUI interface that loads instantly, responds at 120Hz ProMotion, and respects Apple design guidelines,  
> **So that** divination feels organic, instantaneous, and deeply integrated into my daily digital sanctuary.

- **Scenario 1.1 (Native Swift 6 & Rust Microkernel Execution)**:
  - *Given* an iPhone 16 Pro running iOS 18 or a Mac running macOS Sequoia,
  - *When* the user requests a 10-card Celtic Cross reading with custom seed,
  - *Then* the calculation completes via `TarotCoreActor` in $<10\text{ms}$ with zero memory leaks, zero web view overhead, and zero dropped frames during 3D card layout rendering.
- **Scenario 1.2 (Responsive Adaptive Universal Layout)**:
  - *Given* dynamic window resizing on macOS or rotation on iPadOS Stage Manager,
  - *When* transitioning between Compact, Regular, and Expanded size classes,
  - *Then* the UI smoothly adapts between 3-column Zen workspace, side-by-side canvas/dignity inspector, and mobile vertical carousel without state destruction.

---

### User Story 2 (P1): WidgetKit & Siri / App Intents Deep System Anchors
> **As a** daily tarot seeker,  
> **I want to** view my daily card directly on my Lock Screen, StandBy mode, and Mac desktop, and trigger readings via Siri or Shortcuts,  
> **So that** I can receive sacred guidance without opening the full application.

- **Scenario 2.1 (Interactive Daily Arcana Widget)**:
  - *Given* a configured medium or circular Lock Screen / StandBy widget,
  - *When* the clock strikes midnight or the user taps "Reveal Card" directly on the widget,
  - *Then* the widget executes an `AppIntent`, updates the deterministic daily card state in shared App Group storage, and renders the card artwork with elemental dignity glow.
- **Scenario 2.2 (Siri Voice Shortcut & Spotlight Indexing)**:
  - *Given* Siri query "*Hey Siri, draw my daily tarot card*",
  - *When* invoked hands-free via AirPods or HomePod,
  - *Then* the system performs the draw via `DrawDailyCardIntent`, announces the card name and core archetypal meaning through Siri dialog, and indexes the entry into Spotlight for instant spotlight search.

---

### User Story 3 (P1): Dynamic Island, Live Activities & CoreHaptics Tactile Audio
> **As a** user performing an immersive meditation or multi-step spread ritual,  
> **I want to** feel distinct physical vibrations matching card riffles and cuts, and see live session progress on the Dynamic Island,  
> **So that** the ritual feels tactile, grounded, and physically authentic.

- **Scenario 3.1 (Dynamic Island Ritual State)**:
  - *Given* an active divination session on iPhone with Dynamic Island,
  - *When* the app enters background,
  - *Then* the Live Activity displays the active spread progress (e.g., "Celtic Cross: Card 4 of 10") in the Dynamic Island with quick tap-to-resume.
- **Scenario 3.2 (CoreHaptics AHAP Shuffling Experience)**:
  - *Given* a supported iPhone or Force Touch trackpad on Mac,
  - *When* the user scrubs across the deck to cut cards or flips a major arcana,
  - *Then* a bespoke transient AHAP haptic waveform triggers in $<5\text{ms}$ synchrony with 432Hz ambient bell acoustic playback.

---

### User Story 4 (P2): SwiftData CloudKit Sync & Continuity Handoff
> **As a** multi-device Apple user,  
> **I want my** reading journals, custom OTP decks, and active unfinished spreads to synchronize automatically across iPhone, iPad, and Mac,  
> **So that** I can start a reading on my iPhone and continue analyzing dignity relations on my Mac.

- **Scenario 4.1 (Handoff Continuation)**:
  - *Given* an active reading session open on iPhone,
  - *When* the user approaches their Mac and clicks the Handoff dock icon,
  - *Then* macOS opens Taroturn with the exact 64-char seed, spread topology, flipped card set, and zoom position preserved.
- **Scenario 4.2 (SwiftData + Private CloudKit Database)**:
  - *Given* a new reading saved to the local SwiftData journal on Mac,
  - *When* network connectivity is restored,
  - *Then* the encrypted record syncs silently to the user's private iCloud container and appears on iPad and iPhone within seconds.

---

### User Story 5 (P2): Platform-Specific Native Enhancements (macOS Menu Bar, iPad PencilKit, StoreKit 2)
> **As a** power user on iPadOS and macOS,  
> **I want** native macOS Menu Bar quick-access, iPad Apple Pencil freehand annotations, and native Apple In-App Purchases,  
> **So that** the app leverages the unique strengths of each Apple device form factor.

- **Scenario 5.1 (macOS Menu Bar Companion)**:
  - *Given* Taroturn running in the background on macOS,
  - *When* clicking the Zen glyph in the macOS menu bar,
  - *Then* a lightweight popover presents the current daily card, quick query input, and quick deck switcher.
- **Scenario 5.2 (iPadOS PencilKit Spread Annotation)**:
  - *Given* a completed reading canvas on iPadOS,
  - *When* the user touches Apple Pencil to the screen,
  - *Then* a native `PKCanvasView` overlay activates allowing handwriting, sketching insights, and saving annotated art scrolls.
- **Scenario 5.3 (StoreKit 2 Native Purchases)**:
  - *Given* an unowned premium OTP deck or esoteric masterclass subscription,
  - *When* the user taps "Unlock with Apple Pay / Touch ID",
  - *Then* StoreKit 2 handles transaction verification, entitlement updates, and offline receipt caching natively.

---

## 3. Functional Requirements (FR-###)

- **FR-001**: The Apple application MUST be 100% native Swift 6 and SwiftUI, deprecating any embedded web views for core divination, journal, and catalog flows.
- **FR-002**: The Swift client MUST interface with `taroturn-core` via `TarotCoreActor` and UniFFI C-ABI with strict Swift 6 concurrency compliance (`-strict-concurrency=complete`).
- **FR-003**: The app MUST implement `WidgetKit` extensions supporting Small, Medium, Large, Lock Screen (Rectangular/Circular/Inline), and StandBy layouts for Daily Card and Spread of the Day.
- **FR-004**: The app MUST implement `AppIntents` (e.g., `DrawDailyCardIntent`, `PerformSpreadReadingIntent`, `GetElementalBalanceIntent`) with Siri and Shortcuts support.
- **FR-005**: The app MUST integrate `CoreSpotlight` indexing reading history entries with keywords, archetype names, and spread titles.
- **FR-006**: The app MUST implement `ActivityKit` Live Activities and Dynamic Island presentations for ongoing multi-card rituals.
- **FR-007**: The app MUST implement `CoreHaptics` with customized AHAP (Apple Haptic Audio Pattern) files for card shuffling, cutting, dealing, and flipping.
- **FR-008**: The app MUST implement SwiftData models (`ReadingSessionRecord`, `DeckPreferenceRecord`, `JournalNoteRecord`) with automatic Private iCloud CloudKit syncing.
- **FR-009**: The app MUST support `NSUserActivity` and Handoff for active reading sessions across iOS, iPadOS, and macOS.
- **FR-010**: The macOS client MUST provide an `NSStatusItem` menu bar companion app with quick draw capabilities and global keyboard shortcuts.
- **FR-011**: The iPadOS client MUST embed `PencilKit` (`PKCanvasView` / `PKToolPicker`) for handwritten notes directly on divination art canvases.
- **FR-012**: The app MUST implement `StoreKit 2` (`Product.products`, `Transaction.updates`, `@Observable StoreManager`) for native digital purchases.
- **FR-013**: The app MUST support system-wide Drag and Drop for `.otp` and `.tarot` deck package files using Uniform Type Identifiers (`com.taroturn.otp-package`).
- **FR-014**: The app MUST adhere to Apple Human Interface Guidelines (HIG) with dynamic typography, dark/light mode adaptation, and VoiceOver accessibility labels (`accessibilityLabel`, `accessibilityHint`).
- **FR-015**: The export engine MUST use SwiftUI `ImageRenderer` to generate 300DPI lossless PNG/PDF reading scrolls with system share sheet (`ShareLink`).

---

## 4. Success Criteria (SC-###)

- **SC-001**: Clean compilation under Swift 6 compiler with zero concurrency warnings, zero actor isolation violations, and zero memory leaks under Xcode Instruments Leaks/Allocations.
- **SC-002**: Cold launch time to interactive canvas $<300\text{ms}$ on Apple Silicon hardware (M-series / A17+).
- **SC-003**: 60fps/120fps steady rendering during complex 10-card Celtic Cross 3D perspective flips and DAG Bézier curve rendering.
- **SC-004**: Siri voice intent execution completes with rich voice & visual response in $<600\text{ms}$.
- **SC-005**: 100% deterministic seed parity with Rust core calculations for all Widget, Intent, and UI draws.
- **SC-006**: WidgetKit updates consume zero background battery drain beyond scheduled Apple budget.

---

## 5. Assumptions & Technical Constraints

1. Minimum deployment targets: **iOS 17.0+**, **iPadOS 17.0+**, **macOS 14.0+ (Sonoma)** (enabling `@Observable`, `SwiftData`, `WidgetKit` interactive widgets, `StoreKit 2`, and Swift 6 language mode).
2. Shared App Group (`group.com.taroturn.app`) is configured for sharing SwiftData stores and seed caches between main app, Widgets, and App Intents.
3. Cryptographic deterministic seed calculations are performed natively in Rust via UniFFI.
