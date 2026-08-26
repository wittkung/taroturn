# Tasks: Multi-Profile Natal Tarot Registry

- **Feature ID**: `007-multi-profile-natal-tarot`
- **Status**: `COMPLETED`
- **Created Date**: `2026-08-25`

---

## Phase 1: Domain Types & Core Service Migration

- [x] T001: Extend `SeekerProfile` and `UserSettings` interfaces with `id`, `name`, `profiles`, and `activeProfileId` in `apps/taroturn-app/src/types/settings.ts`
- [x] T002: Implement multi-profile CRUD methods, single-profile auto-migration, and active profile synchronization in `apps/taroturn-app/src/services/userSettingsService.ts`

---

## Phase 2: UI Component Upgrades & Registry Management

- [x] T003 [P]: in `apps/taroturn-app/src/components/UserProfileModal.tsx` implement multi-profile switcher, quick creation modal, and reactive profile state binding
- [x] T004 [P]: in `apps/taroturn-app/src/components/SettingsModal.tsx` implement profile registry card list, editor drawer/modal, and single-profile delete protection
- [x] T005 [P]: in `apps/taroturn-app/src/components/Header.tsx` ensure active seeker name and title render dynamically from active profile

---

## Phase 3: Automated Testing & Integration Verification

- [x] T006: Create comprehensive unit test suite covering CRUD, migration, and edge cases in `apps/taroturn-app/scripts/test_user_settings.mjs`
- [x] T007: Run TypeScript typecheck, build validation, and test execution across `apps/taroturn-app`
