# Quickstart & Verification Guide: Apple Native Swift UI

- **Feature**: `006-apple-native-swift-ui`
- **Platforms**: macOS 14.0+ (Sonoma), iOS 17.0+, iPadOS 17.0+
- **Toolchain**: Xcode 16.0+, Swift 6.0, Rust 1.80+ (`aarch64-apple-darwin`, `aarch64-apple-ios`, `aarch64-apple-ios-sim`)

---

## 1. Prerequisites & Environment Setup

Ensure Xcode 16 and Rust Apple cross-compilation targets are installed:

```bash
# Verify Swift 6 compiler
swift --version

# Add Rust Apple targets if compiling from source
rustup target add aarch64-apple-darwin
rustup target add aarch64-apple-ios
rustup target add aarch64-apple-ios-sim
rustup target add x86_64-apple-ios
```

---

## 2. Compile & Validate Swift 6 Strict Concurrency

Run strict concurrency analysis across all Swift packages:

```bash
cd apps/taroturn-apple/Packages/TaroturnCorePackage

# Complete Swift 6 strict concurrency check
swift build -Xswiftc -strict-concurrency=complete

# Run core package unit tests
swift test
```

---

## 3. End-to-End Test Scenarios

### Scenario A: Deterministic Seed Draw via `TarotCoreActor`
```swift
import TaroturnCore
import XCTest

final class ReadingTests: XCTestCase {
    func testDeterministicSeedDraw() async throws {
        let actor = TarotCoreActor.shared
        let session = try await actor.drawReadingSession(
            spreadId: "celtic_cross",
            question: "What is my spiritual trajectory?",
            seedHex: "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
            reversalRate: 0.5
        )
        XCTAssertEqual(session.placedCards.count, 10)
        XCTAssertFalse(session.rngSeed.isEmpty)
    }
}
```

### Scenario B: WidgetKit Timeline Generation
Validate that `DailyCardTimelineEntry` generates a deterministic entry using the day's seed without throwing errors.

### Scenario C: Siri AppIntent Execution
Execute `DrawDailyCardIntent().perform()` and verify spoken dialog returns localized title and archetypal meaning.

---

## 4. Contract Schema Validation

Run deterministic schema linter:

```bash
.specify/scripts/bash/lint-contracts.sh specs/006-apple-native-swift-ui/contracts
```
