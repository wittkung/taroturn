# Technical Research & Architecture Decisions: Apple Native Swift UI Migration

- **Feature**: `006-apple-native-swift-ui`
- **Scope**: Full Apple Ecosystem Native UI (macOS, iOS, iPadOS, WidgetKit, AppIntents, ActivityKit, SwiftData, CoreHaptics, StoreKit 2)
- **Author**: Antigravity / CTO Persona
- **Status**: `COMPLETED`

---

## 1. Swift 6 Strict Concurrency & UniFFI Bridge

### Context & Challenge
Apple's Swift 6 compiler introduces compile-time data race safety with `-strict-concurrency=complete`. Calling across the C-ABI into the Rust `taroturn-core` microkernel requires non-blocking execution, thread safety, and `Sendable` value types.

### Decision
- Wrap UniFFI bindings in an isolated `actor TarotCoreActor`.
- All data models crossing FFI boundaries (`Card`, `Spread`, `ReadingSession`, `DignitySummary`) conform to `Sendable` and are immutable value types (`struct`).
- UI ViewModels use `@Observable` and are annotated with `@MainActor`.

### Rationale
- Completely eliminates data races at compile time.
- Prevents UI thread stalling during ChaCha20 seed shuffling and dignity tensor calculations by offloading to background Swift cooperative thread pool.

### Alternatives Considered
- Direct `@Observable` classes with internal locks: Rejected due to Swift 6 strict concurrency violations and potential deadlock hazards.

---

## 2. WidgetKit & Interactive App Intents Architecture

### Context & Challenge
Users expect daily tarot guidance on Lock Screen, StandBy, Home Screen, and macOS desktop without opening the main app, with instant tap-to-reveal interactions.

### Decision
- Implement `TarotDailyWidget` using `TimelineProvider` and `AppIntentTimelineProvider`.
- Use an interactive `AppIntent` (`DrawDailyCardIntent`) with shared App Group storage (`group.com.taroturn.app`).
- Daily card seed is computed deterministically using `date_string + user_salt` so widget and app views remain 100% identical.

### Rationale
- Interactive widgets (iOS 17+ / macOS 14+) allow flipping or drawing cards directly on the Home/Lock Screen without launching the app.
- Shared App Group ensures the widget and main app read from the identical SwiftData store and seed cache.

---

## 3. Dynamic Island & Live Activities (ActivityKit)

### Context & Challenge
During multi-card spreads (e.g. 10-card Celtic Cross or 7-card Chakra spreads), users engage in contemplative meditation. Backgrounding the app should not lose ritual context.

### Decision
- Create `TarotRitualActivityAttributes` conforming to `ActivityAttributes`.
- Support Dynamic Island compact leading (active card icon), compact trailing (step count), expanded (card title + prompt + progress bar), and Lock Screen live activity banner.

### Rationale
- Provides persistent, subtle ritual grounding while the seeker journals or meditates.

---

## 4. SwiftData & Private CloudKit Persistence Architecture

### Context & Challenge
Users require private, encrypted, multi-device sync (iPhone, iPad, Mac) for reading archives, journal entries, and custom OTP decks, without requiring third-party accounts.

### Decision
- Define `@Model` classes: `ReadingRecord`, `JournalEntryRecord`, `OtpDeckRecord`.
- Configure `ModelConfiguration` with App Group container and CloudKit sync enabled (`CloudKitDatabase.private`).
- In offline mode, SwiftData operates seamlessly against the local SQLite store; when online, CloudKit background syncs changes automatically.

### Rationale
- Zero backend maintenance cost; preserves user privacy with Apple end-to-end encryption.

---

## 5. CoreHaptics & Spatial Audio Multi-Sensory Pipeline

### Context & Challenge
Digital card divination often feels flat without physical feedback.

### Decision
- Implement `HapticSoundEngine` singleton using `CHHapticEngine` on iOS/iPadOS and `NSHapticFeedbackManager` on macOS.
- Define custom AHAP JSON files for:
  - `card_shuffle_riffle.ahap` (continuous modulated vibration with crescendo)
  - `card_cut_snap.ahap` (sharp transient impulse)
  - `card_flip_reveal.ahap` (soft resonant impulse)
- Mix with `AVAudioEngine` playing 432Hz ambient harmonic resonance.

---

## 6. iPadOS PencilKit Freehand Markup & macOS Multi-Window Ergonomics

### Context & Challenge
Desktop and tablet users have distinct interaction modalities (Apple Pencil vs Mouse/Keyboard/Menu Bar).

### Decision
- **iPadOS**: Embed `PKCanvasView` and `PKToolPicker` overlaying the `SpreadDAGCanvasView` for freehand drawing of astrological glyphs, energy flows, and handwritten notes.
- **macOS**: Provide `MenuBarExtra("Taroturn", systemImage: "sparkles")` for instant menu bar popover draws, support multi-window `WindowGroup(id: "reading-canvas")`, and register global keyboard shortcuts (`⌘K` Command Palette, `Space` Flip Card).

---

## 7. StoreKit 2 Architecture

### Context & Challenge
Monetization and OTP deck ecosystem access must be native, transparent, and work offline once purchased.

### Decision
- Implement `@Observable @MainActor StoreKitManager` utilizing `Product.products(for:)`, `Transaction.updates`, and `Transaction.currentEntitlements`.
- Cache cryptographically signed JWS transaction tokens in local keychain for offline entitlement verification.
