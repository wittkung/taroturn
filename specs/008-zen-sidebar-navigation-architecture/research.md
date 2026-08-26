# Technical Research: Zen Sidebar Navigation & Multi-Tab Architecture

- **Feature ID**: `008-zen-sidebar-navigation-architecture`
- **Target**: `apps/taroturn-app` & TTZip Design System Alignment
- **Date**: 2026-08-25

---

## 1. Existing State Architecture & Modals Audit

### Source 1: `apps/taroturn-app/src/App.tsx`
- 当前布局为单一页面视图，所有的辅助功能均通过 Modal 弹窗渲染：
  - `isDeckCatalogOpen` -> `CardDeckCatalogModal`
  - `isJournalOpen` -> `ReadingJournalModal`
  - `isSettingsOpen` -> `SettingsModal`
  - `isProfileOpen` -> `UserProfileModal`
- 缺点：
  1. 窗口居中遮罩弹出，面积受限，在宽屏桌面上造成巨大留白与视觉压迫感。
  2. 弹窗无法与主工作区并行查看，用户在查阅卡牌图鉴或历史复盘时必须关闭弹窗才能回到牌阵。
  3. 与 TTZip / TTSubs 的三栏/常驻侧边栏设计规范不一致。

### Source 2: `ttzip-ui-design-system`
- 规范要点：
  - 侧边栏宽度：`200pt ~ 220pt`。
  - 顶栏高度：`52pt ~ 54pt`，带 Y 轴 1.5pt 金缮金线 (`#D4AF37`)。
  - 颜色令牌：`kintsugiGold`, `bambooGreen`, `cinnabarRed`, `deepGraphite`, `inkBlack`, `washiPaper`, `hairlineBorder`。
  - 玻璃拟态卡片：`Color.primary.opacity(0.025~0.04)` + `16pt continuous cornerRadius`。

---

## 2. Refactoring Design Plan

### Decision 1: Workspace Tab Router State
- 在 `App.tsx` 中定义顶级路由状态：
  ```typescript
  export type ActiveWorkspaceTab = 'divination' | 'journal' | 'catalog' | 'profiles' | 'settings';
  ```
- 将 `App.tsx` 重构为：
  - 左侧：常驻 `<Sidebar activeTab={activeTab} onSelectTab={setActiveTab} />`
  - 顶部：全局统一 `<Header activeTab={activeTab} ... />`
  - 中央主工作区：
    - `activeTab === 'divination'`: `<SpreadCanvas />` + `<RitualDock />`
    - `activeTab === 'journal'`: `<ReadingJournalView />`
    - `activeTab === 'catalog'`: `<CardDeckCatalogView />`
    - `activeTab === 'profiles'`: `<UserProfileView />`
    - `activeTab === 'settings'`: `<SettingsView />`

### Decision 2: Dual Mode for Views (Workspace View + Optional Modal)
- 将现有的 4 个 Modal 组件重构为全屏/内嵌视图组件（Views），支持在全景工作区中无遮罩流畅呈现，同时支持必要时的弹窗形态，实现代码最大复用与组件化。
