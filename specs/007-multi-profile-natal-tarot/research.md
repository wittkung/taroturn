# Technical Research: Multi-Profile Natal Tarot Registry

- **Feature ID**: `007-multi-profile-natal-tarot`
- **Target**: Web App (`apps/taroturn-app`) & Cross-Platform State Management
- **Date**: 2026-08-25

---

## 1. Existing State Architecture & Storage Model

### Source 1: `apps/taroturn-app/src/types/settings.ts`
- 现有 `SeekerProfile` 定义缺少 `id` 与 `name`，但包含完整命理字段：
  - `nickname`, `title`, `birthdate`, `lifePathNumber`, `soulCardId`, `personalityCardId`, `dominantZodiac`, `dominantElement`, `personalMotto`。
- 现有 `UserSettings` 仅包含单一 `profile: SeekerProfile`。

### Source 2: `apps/taroturn-app/src/services/userSettingsService.ts`
- 状态持久化基于 `localStorage.getItem('taroturn_user_settings_v1')`。
- `UserSettingsService.getSettings()` 在初次加载时执行 `DEFAULT_SETTINGS` 与 localStorage 数据的深层合并。
- 提供了全局观察者订阅机制 `UserSettingsService.subscribe(listener)`，任何设置或档案变更可毫秒级广播给已注册的 UI 组件（如 `Header`, `UserProfileModal`, `SettingsModal`, `Inspector`）。

### Source 3: `apps/taroturn-app/src/services/tarotCalculators.ts`
- 核心算法函数 `calculateSeekerProfile(birthdate: string)`：
  - 输入：`YYYY-MM-DD` 格式的出生日期。
  - 输出：`lifePathNumber`, `soulCardId`, `personalityCardId`, `soulCardNameZh`, `soulCardNameEn`, `archetypeTitle`, `dominantZodiac`, `dominantElement`, `soulMotto`, `coreStrengths`, `shadowChallenges`。
  - 纯函数计算，零副作用，执行耗时 $<0.1\text{ms}$。

---

## 2. Architectural Design Decisions

### Decision 1: Dual-Layer State Model (Active View + Registry Array)
- 为了保证所有消费 `settings.profile` 的现有组件（包括 AI 提示词生成、神殿展示、顶部 Header 状态）零破坏、零回归，在 `UserSettings` 结构中：
  - `activeProfileId: string`: 标识当前激活的档案 ID。
  - `profiles: SeekerProfile[]`: 存储全部求问者档案列表。
  - `profile: SeekerProfile`: 作为活跃档案的即时镜像视图。
- 当用户调用 `UserSettingsService.setActiveProfile(id)` 或 `updateProfile(...)` 时，Service 自动保证 `profile` 与 `profiles.find(p => p.id === activeProfileId)` 严格同步。

### Decision 2: Zero-Dependency ID Generation
- 使用标准轻量级生成策略：`profile_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`。
- 默认迁移档案指定固定唯一 ID：`default-seeker`。

### Decision 3: UI Ergonomics & Component Modularity
- **`UserProfileModal` (求问者神殿)**：
  - 顶部增加求问者切换 Selector（下拉列表或 Pill 胶囊），展示当前人物名字与称号。
  - 提供“＋新建求问者”与“管理档案”快捷跳转按钮。
- **`SettingsModal` (设置中枢)**：
  - “求问者与本命灵数”Tab 升级为“多档案档案库 + 详情编辑表单”双模态交互：
    1. 档案卡片列表：网格/列表展示所有人物卡片，显示名字、称号、本命牌缩略图与灵数徽章，支持一键切换活跃、编辑、删除。
    2. 档案编辑/新建面板：支持修改姓名、称号、生日，实时更新并演算本命牌。
