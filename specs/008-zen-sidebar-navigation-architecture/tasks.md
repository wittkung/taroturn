# Tasks: Zen Sidebar Navigation & Native Tab Workspace Architecture

- **Feature ID**: `008-zen-sidebar-navigation-architecture`
- **Status**: `COMPLETED`
- **Created Date**: `2026-08-25`

---

## Phase 1: Navigation Core Types & Sidebar Component

- [x] T001: Define `TarotWorkspaceTab` and navigation metadata in `apps/taroturn-apple/Sources/TaroturnShared/Domain/Models/TarotWorkspaceTab.swift`
- [x] T002: Implement `ZenSidebarNavView.swift` following `ttzip-ui-design-system` with 5 navigation tabs, Kintsugi Gold highlights, and active profile footer in `apps/taroturn-apple/Sources/TaroturnShared/Features/Navigation/ZenSidebarNavView.swift`

---

## Phase 2: Full-Page Workspace Views Transformation

- [x] T003 [P]: Refactor `CardDeckCatalogSheet.swift` into embeddable `CardDeckCatalogView` with full-screen gallery and element filters in `apps/taroturn-apple/Sources/TaroturnShared/Features/Modals/CardDeckCatalogSheet.swift`
- [x] T004 [P]: Refactor `ReadingJournalSheet.swift` into embeddable `ReadingJournalView` with history cards and telemetry in `apps/taroturn-apple/Sources/TaroturnShared/Features/Modals/ReadingJournalSheet.swift`
- [x] T005 [P]: Refactor `SeekerProfileSheet.swift` into embeddable `SeekerProfileView` with astrological & natal arcanum calculator in `apps/taroturn-apple/Sources/TaroturnShared/Features/Modals/SeekerProfileSheet.swift`
- [x] T006 [P]: Refactor `SettingsSheet.swift` into embeddable `SanctuarySettingsView` with graphics, ritual, and cryptography controls in `apps/taroturn-apple/Sources/TaroturnShared/Features/Modals/SettingsSheet.swift`

---

## Phase 3: Root Layout & Header Integration

- [x] T007 [P]: Update `HeaderBarView.swift` with dynamic section labels, tab titles, and 52pt Kintsugi Gold rule alignment in `apps/taroturn-apple/Sources/TaroturnShared/Features/Navigation/HeaderBarView.swift`
- [x] T008: Integrate permanent `ZenSidebarNavView` and dynamic Workspace router in `apps/taroturn-apple/Sources/TaroturnApp/AdaptiveLayouts/ThreeColumnZenWorkspace.swift`

---

## Phase 4: Automated Verification & Build

- [x] T009: Run Swift 6 strict concurrency compilation, unit tests, and production build verification across `apps/taroturn-apple`
