# Tasks: Apple Architecture SSOT, UniFFI Toolchain & QA Governance

- **Feature ID**: `009-apple-architecture-uniffi-qa-governance`
- **Status**: `COMPLETED`
- **Created Date**: `2026-08-26`

---

## Phase 1: SPM Directory Cleanup & Single Source of Truth

- [x] T001: Update `apps/taroturn-apple/Package.swift` to use canonical paths `Shared` and `macOS`
- [x] T002: Remove duplicate directory `apps/taroturn-apple/Sources` and verify single SSOT build in `apps/taroturn-apple`

---

## Phase 2: Toolchain Build Script Hardening

- [x] T003: Upgrade `scripts/build_apple_xcframework.sh` with explicit `MACOSX_DEPLOYMENT_TARGET=14.0` and multi-target compilation
- [x] T004: Rebuild `TaroturnCoreFFI.xcframework` and eliminate Darwin 26.0 linker warnings

---

## Phase 3: Industrial-Grade Swift QA Test Suite

- [x] T005: Rewrite `ReadingViewModelTests.swift` with async state machine validation in `apps/taroturn-apple/Packages/TaroturnCorePackage/Tests/TaroturnCoreTests/ReadingViewModelTests.swift`
- [x] T006: Rewrite `SwiftDataSyncTests.swift` with in-memory container persistence CRUD in `apps/taroturn-apple/Packages/TaroturnCorePackage/Tests/TaroturnCoreTests/SwiftDataSyncTests.swift`
- [x] T007: Run `swift test` and ensure 100% test pass with zero warnings

---

## Phase 4: Platform Manifesto & Micro-Interaction Polish

- [x] T008 [P]: Create `PLATFORM_MANIFESTO.md` in repository root to establish multi-repo platform boundaries and entity pre-checking rules
- [x] T009 [P]: Add keyboard shortcuts (`Cmd+1~5`) and spatial transitions in `apps/taroturn-apple/Shared/Features/Navigation/ZenSidebarNavView.swift`
