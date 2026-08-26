# Feature Specification: Zen Sidebar Navigation & Native Tab Workspace Architecture

- **Feature ID**: `008-zen-sidebar-navigation-architecture`
- **Pipeline Mode**: `[Full SDD]`
- **Status**: `SPECIFIED`
- **Author**: Antigravity / CTO Persona
- **Target Branch**: `main`
- **Created Date**: `2026-08-25`

---

## Clarifications

### Session 2026-08-25
- **Q: 为什么需要将原有的全量 Modal 弹窗体系全面重构成常驻侧边栏与 Tab 工作区？**  
  **A:** 居中 Modal 浮层弹窗破坏了沉浸式桌面级仪轨体验，导致图谱浏览、历史复盘、本命盘透视与设置之间产生割裂感。统一重构为 TTZip / TTSubs 级常驻侧边栏导航后，所有核心能力升格为一等公民工作区（Top-Level Workspaces），实现平滑无缝的视图切换。
- **Q: 5 个顶级 Tab 工作区如何划分？**  
  **A:** 
  1. `divination`（圣所推演 / 牌阵仪式）：核心抽牌、洗牌、牌阵展开与动态推演工作区。
  2. `journal`（历史账本 / 占卜复盘）：历次会话复盘、要素沉淀、AI 报告浏览与会话重放。
  3. `catalog`（牌典图谱 / 典籍画廊）：78 张原版图鉴、四大要素切片、搜索与卡牌深度象征解析。
  4. `profiles`（本命神殿 / 求问者图谱）：多求问者本命盘管理、生命灵数计算、优势禀赋与心智画像。
  5. `settings`（认知中枢 / 系统设置）：AI 算力节点（TTAgy/BYOK）、流派导师、仪式物理与音效管理。
- **Q: 抽屉与瞬态弹窗（如 FocusIntentionModal、ReadingDrawer）如何保留？**  
  **A:** 仅保留推演过程中的瞬态意图聚焦（FocusIntentionModal）与右侧深度分析抽屉（ReadingDrawer），其他全局管理功能全部内化为常驻工作区页面。

---

## 1. Executive Summary & User Value

Taroturn 全面升级为 **TT 系列原生桌面级 Zen 侧边栏与多工作区架构 (Zen Sidebar Navigation & Multi-Tab Workspace Architecture)**，彻底消除传统 Web 应用中割裂、杂乱的居中弹窗（Modals），与 TTZip / TTSubs 设计语言（`ttzip-ui-design-system`）实现 100% 视觉与交互统一：

1. **常驻 Zen 玻璃拟态侧边栏 (210pt Sidebar)**：提供品牌徽标、5 大核心 Tab 导航胶囊、Kintsugi 金线指示器、当前活跃求问者身份徽章及 PRO 状态。
2. **5 大沉浸式顶级工作区 (Top-Level Workspaces)**：
   - **圣所推演 (Divination Canvas)**：牌阵矩阵、洗牌触感底栏与动态推演。
   - **历史账本 (Reading Journal Workspace)**：全景复盘历次推演卡片、四要素统计与 RAG 沉淀。
   - **牌典图谱 (Deck Catalog Gallery Workspace)**：78 张伟特卡牌高保真画廊、要素切片筛选与秘传符号学。
   - **本命神殿 (Seeker Sanctuary Workspace)**：多求问者档案库管理、灵数即时推演与优势/阴影心智图谱。
   - **认知中枢 (Sanctuary Settings Workspace)**：AI 私有节点直连、四大导师流派与系统音效。
3. **精准 WSJ 编辑排版与 54pt 金线顶栏**：统一顶栏 Header 结构，Y = 54pt 标配 1.5pt 金缮金线（Kintsugi Gold Rule Line），板块副标题与状态徽章标准对齐。

---

## 2. User Stories & Acceptance Scenarios

### User Story 1 (P1): 侧边栏一键无缝切换 5 大核心工作区
> **As a** 塔罗研习者与日常求问者，  
> **I want to** 在左侧直观的侧边栏中随时切换推演、历史、图鉴、本命神殿与设置，  
> **So that** 我无需反复打开/关闭层层叠叠的弹窗即可顺畅浏览与管理所有数据。

- **Scenario 1.1 (工作区即时切换与状态保持)**:
  - *Given* 用户正在进行牌阵推演（已抽牌），
  - *When* 点击侧边栏“牌典图谱”查看愚者牌的详细象征，再切换回“圣所推演”，
  - *Then* 当前牌阵的卡牌摆放与翻牌进度完好无损，视图切换耗时 $<16\text{ms}$，零闪烁。
- **Scenario 1.2 (侧边栏视觉反馈与金线高亮)**:
  - *Given* 用户在侧边栏选中不同 Tab，
  - *When* 点击对应项，
  - *Then* 激活项呈现 Kintsugi 金线高光背景与左侧金线指示条，未激活项呈现柔和微透明态。

---

### User Story 2 (P1): 全景牌典图谱工作区 (Deck Catalog Workspace)
> **As a** 塔罗学习者，  
> **I want to** 在主工作区以全屏画廊形式浏览 78 张塔罗原典与要素分类，  
> **So that** 画廊体验宽阔宏大、典雅沉浸，而非挤在小弹窗中。

- **Scenario 2.1 (要素切片与即时搜索)**:
  - *Given* 处于“牌典图谱”工作区，
  - *When* 点击“大阿卡纳”或输入搜索“皇帝”，
  - *Then* 工作区自适应渲染高分辨率卡牌画廊，展示中英文名称、要素徽章与编号。

---

### User Story 3 (P1): 全景历史账本与本命神殿工作区
> **As a** 资深用户，  
> **I want to** 在宽敞的工作区中直接管理我的所有历史推演与多位求问者本命档案，  
> **So that** 查阅长期心智轨迹和管理伴侣/好友档案更加一览无余。

- **Scenario 3.1 (历史账本全景展示与一键重载)**:
  - *Given* 处于“历史账本”工作区，
  - *When* 点击历史会话卡片上的“重放推演”，
  - *Then* 系统自动切换至“圣所推演”Tab，载入对应的牌阵、卡牌与问题。
- **Scenario 3.2 (本命神殿全景管理)**:
  - *Given* 处于“本命神殿”工作区，
  - *When* 新建或切换求问者档案，
  - *Then* 本命灵魂牌大图与心智画像即时在主面板展开。

---

## 3. Functional Requirements

- **FR-001**: 应用程序根布局重构为常驻侧边栏（Sidebar）+ 主工作区（Main Workspace）的桌面级架构。
- **FR-002**: 侧边栏必须支持 5 个核心 Tab：
  1. `divination`: 圣所推演 (Sparkles)
  2. `journal`: 历史账本 (History)
  3. `catalog`: 牌典图谱 (Layers)
  4. `profiles`: 本命神殿 (User)
  5. `settings`: 认知中枢 (Sliders/Settings)
- **FR-003**: 顶栏 Header 必须自适应当前 Tab：显示当前板块名称（如 `DIVINATION SANCTUARY`, `DECK CATALOG`）、中文标题与操作快捷按钮。
- **FR-004**: 原 `CardDeckCatalogModal` 转换为 `CardDeckCatalogView` 嵌入 `catalog` Tab。
- **FR-005**: 原 `ReadingJournalModal` 转换为 `ReadingJournalView` 嵌入 `journal` Tab。
- **FR-006**: 原 `UserProfileModal` 转换为 `UserProfileView` 嵌入 `profiles` Tab。
- **FR-007**: 原 `SettingsModal` 转换为 `SettingsView` 嵌入 `settings` Tab。
- **FR-008**: 必须全面遵循 `ttzip-ui-design-system`：
  - Kintsugi Gold 动态金线高光 (`#D4AF37`)。
  - 54pt 顶栏 Header，Y 轴 1.5pt 金线规则。
  - 玻璃拟态材质与 16pt 连续圆角。
  - 消除硬编码黑盒，支持和纸白/午夜紫罗兰自适应。
- **FR-009**: 切换 Tab 时必须保持 `divination` 工作区中的推演进度和未完成会话状态。

---

## 4. Key UI & Layout Specification

```
+---------------------------------------------------------------------------------------------------+
| Top Header Bar (Height: 54pt) | Section Name + Tab Title | Active Seeker Badge | Theme & Pro Button |
| [====================================== Kintsugi Gold Line 1.5pt ===============================] |
+-----------------------+---------------------------------------------------------------------------+
| Sidebar (Width: 210pt) | Active Tab Workspace (Flex-1, Scrollable, Zen Background)                 |
|                       |                                                                           |
| ✦ 圣所推演 (Divination)| [Tab: Divination]                                                         |
| 📖 历史账本 (Journal)  |   SpreadCanvas + Bottom RitualDock + ReadingDrawer (Right)                |
| 🎴 牌典图谱 (Catalog)  | [Tab: Journal]                                                            |
| 👤 本命神殿 (Profiles) |   Session Grid + 4-Element Radar + AI Review Details                      |
| ⚙️ 认知中枢 (Settings) | [Tab: Catalog]                                                            |
|                       |   78-Card Arcana Gallery + Element Filters + Search Filter                |
| --------------------- | [Tab: Profiles]                                                           |
| Current Seeker: 我自己|   Multi-Profile Registry Grid + Realtime Natal Arcanum Calculator         |
| PRO License Active    | [Tab: Settings]                                                           |
| v1.2.0 ChaCha20 Core  |   TTAgy AI Local/Remote + Personas + Ritual Physics Engine                |
+-----------------------+---------------------------------------------------------------------------+
```

---

## 5. Success Criteria & Measurable Outcomes

- **SC-001**: 消除所有全屏大弹窗覆盖层，所有核心功能均可在 1 次侧边栏点击内直接到达。
- **SC-002**: 侧边栏与工作区切换延迟 $<10\text{ms}$，无状态丢失与视图重绘闪烁。
- **SC-003**: 100% 符合 `ttzip-ui-design-system` 设计规范（54pt 顶栏 + 1.5pt 金线 + 玻璃拟态）。
- **SC-004**: 构建打包 `npm run build` 0 警告 0 错误，单元测试 100% 通过。
