# Taroturn Apple Native Universal Client

A 100% pure, native Swift 6 and SwiftUI sanctuary application for macOS, iOS, and iPadOS, deeply integrated with Apple operating system features.

## Architecture

- **Core Microkernel Bridge**: Links `taroturn-core` Rust engine via UniFFI C-ABI with Swift 6 strict concurrency actor isolation (`TarotCoreActor`).
- **UI Framework**: SwiftUI + `@Observable` modern state management with Liquid Glass aesthetics and 120Hz ProMotion spring animations.
- **Persistence & Sync**: SwiftData models (`ReadingRecord`, `JournalEntryRecord`, `OtpDeckRecord`) with shared App Group container (`group.com.taroturn.app`) and Private CloudKit end-to-end encryption.
- **Apple System Integrations**:
  - **WidgetKit**: Daily Card and Spread interactive widgets on Lock Screen, StandBy, and Desktop.
  - **App Intents & Siri / Spotlight**: Hands-free voice intents (`DrawDailyCardIntent`, `PerformSpreadReadingIntent`) and CoreSpotlight search indexing.
  - **ActivityKit & Dynamic Island**: Live Activities for ongoing multi-card rituals.
  - **CoreHaptics & Audio**: Custom AHAP vibration patterns synchronized with 432Hz ambient temple acoustics.
  - **PencilKit (iPadOS)**: Freehand markup and handwritten reflections on spread art scrolls.
  - **Menu Bar Extra (macOS)**: Lightweight companion status item (`NSStatusItem`) with global keyboard shortcuts (`⌘K`, `⌘D`, `⌘N`, `Space`).
  - **StoreKit 2**: In-app unlocks and OTP custom deck management.

## Build & Test

```bash
# 1. Build Rust FFI and package XCFramework
./scripts/build_apple_xcframework.sh

# 2. Run Swift Package tests
cd apps/taroturn-apple/Packages/TaroturnCorePackage
swift test
```
