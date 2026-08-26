# Feature Specification: Multi-Profile Natal Tarot Registry (多求问者本命塔罗档案管理)

- **Feature ID**: `007-multi-profile-natal-tarot`
- **Pipeline Mode**: `[Full SDD]`
- **Status**: `SPECIFIED`
- **Author**: Antigravity / CTO Persona
- **Target Branch**: `main`
- **Created Date**: `2026-08-25`

---

## Clarifications

### Session 2026-08-25
- **Q: 如何在保持极简前端架构的同时，确保多求问者档案与现有单 `profile` 逻辑 100% 向后兼容？**  
  **A:** 在 `UserSettings` 中保留 `profile: SeekerProfile` 作为当前活跃求问者的计算视图，同时新增 `profiles: SeekerProfile[]` 和 `activeProfileId: string`。读取时自动将旧单档案升格为数组第一项；更新或切换活跃档案时，同步更新 `activeProfileId` 与 `profile` 镜像，使所有依赖 `settings.profile` 的旧代码无缝正常工作。
- **Q: 档案删除与空状态如何防御？**  
  **A:** 施加底线保护（Invariant）：`profiles` 列表长度必须 $\ge 1$。当只剩最后 1 个档案时，删除操作被强制禁用。若删除的是当前活跃档案，系统自动将 `activeProfileId` 切换为列表中首个有效档案。
- **Q: 本命塔罗计算的触发时机与字段联动规则是什么？**  
  **A:** 当且仅当修改或输入出生日期（`birthdate`）时，系统自动调用 `calculateSeekerProfile(birthdate)` 重新演算灵数、本命灵魂牌、个性牌、星座与元素；用户可独立修改姓名（`name`）、昵称（`nickname`）与称号（`title`），互不影响。

---

Taroturn 引入**多求问者本命塔罗档案管理体系 (Multi-Profile Natal Tarot Registry)**。以往系统仅支持单一求问者（Seeker Profile）配置，限制了用户为伴侣、亲友、合伙人或塔罗咨询客户进行独立本命盘推演与长期心智轨迹追踪的场景。

本特性使用户能够：
1. **多档案独立命名与保存**：为不同人物分别创建专属本命档案，独立设置姓名/备注、身份称号与出生年月日。
2. **确定性本命算法即时演算**：依据输入出生日期，自动计算生命灵数 (Life Path Number)、灵魂本命牌 (Soul Arcanum)、个性牌 (Personality Arcanum)、黄道星座与主导四元素，并输出深度优势禀赋与潜意识阴影转化课题。
3. **无缝多档案切换与沉浸式神殿透视**：在求问者神殿（UserProfileModal）与系统设置（SettingsModal）中提供直观的档案切换器与管理面板，切换后全系统（神殿、历史推演、AI 解读上下文）即时绑定当前活跃档案。
4. **无损向后兼容与数据主权**：平滑升级已有单一用户数据，导出备份与导入功能完整支持多档案列表。

---

## 2. User Stories & Acceptance Scenarios

### User Story 1 (P1): 多求问者档案的新建、命名与自动计算
> **As a** 塔罗研习者或日常求问者，  
> **I want to** 为自己以及身边的亲友（如伴侣、朋友、客户）分别建立独立的本命档案并自定义命名，  
> **So that** 我无需反复修改覆盖个人生日，即可快速查看不同人物的本命灵魂牌与心智画像。

- **Scenario 1.1 (新建档案与动态灵数计算)**:
  - *Given* 用户打开设置或神殿中的档案管理界面，
  - *When* 点击“新建求问者档案”，输入姓名“林澈 (伴侣)”、称号“星轨共鸣者”、选择生日“1995-11-23”，
  - *Then* 系统实时计算出生命灵数（4数）、灵魂本命牌（#4 皇帝）、黄道星座（射手座）与火元素主导，并在保存后自动添加到档案库中。
- **Scenario 1.2 (档案命名与必填校验)**:
  - *Given* 用户正在创建或编辑档案，
  - *When* 档案名称为空或未选择有效日期，
  - *Then* 界面进行内联友好校验提示，禁止提交不完整数据。

---

### User Story 2 (P1): 档案快速切换与活跃状态即时联动
> **As a** 用户，  
> **I want to** 在求问者神殿或主界面一键切换当前活跃的求问者档案，  
> **So that** 神殿展示的本命牌面、元素能量和 AI 解读能即时切换为该人物的上下文。

- **Scenario 2.1 (神殿内一键切换)**:
  - *Given* 用户拥有 3 个已保存档案（“我自己”、“林澈”、“合伙人 Alex”），
  - *When* 在“求问者神殿”顶部选择“林澈”，
  - *Then* 神殿立刻刷新展示林澈的本命灵魂牌、生命灵数、优势禀赋和专属格言，系统活跃求问者全局更新。
- **Scenario 2.2 (主界面与顶栏状态同步)**:
  - *Given* 切换活跃求问者为“林澈”，
  - *When* 关闭神殿回到主界面或打开设置，
  - *Then* 所有界面均统一展示当前活跃求问者为“林澈”。

---

### User Story 3 (P2): 档案编辑、删除与边界保护
> **As a** 用户，  
> **I want to** 随时修改已有档案信息，或删除不需要的人物档案，  
> **So that** 我的本命求问者列表始终保持整洁准确。

- **Scenario 3.1 (编辑已有档案)**:
  - *Given* 用户选择编辑某个档案，修改其出生日期或昵称，
  - *When* 点击保存，
  - *Then* 该档案的本命牌与灵数自动重新计算并持久化存储。
- **Scenario 3.2 (安全删除与底线防护)**:
  - *Given* 档案列表中存在多个档案，
  - *When* 用户删除当前活跃档案，
  - *Then* 系统弹出二次确认，删除后自动将活跃档案回退切换至列表首个有效档案；若只剩最后一个档案，则禁止删除以防止空状态异常。

---

### User Story 4 (P2): 数据平滑迁移与全量导入导出
> **As a** 已有历史数据的 Taroturn 用户，  
> **I want to** 在系统升级后自动保留我原有的求问者生日与设置，并支持多档案的完整导出备份，  
> **So that** 我的个人数据资产零丢失。

- **Scenario 4.1 (无缝升级与自动数据迁移)**:
  - *Given* 用户本地 localStorage 存在旧版单对象 `profile: SeekerProfile`，
  - *When* 用户加载新版应用，
  - *Then* `UserSettingsService` 自动将其封装为 `profiles: [profile]` 并设置 `activeProfileId = profile.id`，用户无感知且数据完好。
- **Scenario 4.2 (全量备份与跨设备恢复)**:
  - *Given* 用户导出全量圣所备份 JSON，
  - *When* 在新设备或浏览器导入该 JSON，
  - *Then* 所有多求问者档案完整恢复，当前活跃档案状态准确还原。

---

## 3. Functional Requirements

- **FR-001**: 系统必须支持保存不限数量（或合理上限如 50 个）的独立求问者档案（SeekerProfile）。
- **FR-002**: 每个求问者档案必须包含：唯一标识符 `id`、展示姓名/备注 `name`、昵称 `nickname`、身份契约称号 `title`、出生日期 `birthdate` (YYYY-MM-DD)、生命灵数 `lifePathNumber`、灵魂牌 ID `soulCardId`、个性牌 ID `personalityCardId`、黄道星座 `dominantZodiac`、主导元素 `dominantElement`、本命格言 `personalMotto`、创建时间 `createdAt` 与更新时间 `updatedAt`。
- **FR-003**: 系统必须维护全局 `activeProfileId`，标识当前所选的活跃求问者。
- **FR-004**: 修改出生日期时，系统必须调用既有确定性算法 `calculateSeekerProfile(birthdate)` 重新计算灵数、本命牌与心智画像。
- **FR-005**: 求问者神殿 (`UserProfileModal`) 必须集成多档案切换下拉框/标签栏及快速新建/管理入口。
- **FR-006**: 设置中枢 (`SettingsModal`) 的“求问者与本命灵数”Tab 必须升级为多档案管理与编辑中枢。
- **FR-007**: 系统必须实现向后兼容机制，首次读取旧版数据时自动执行结构升级。
- **FR-008**: 必须提供边界保护：禁止删除系统中唯一的求问者档案。
- **FR-009**: 数据导出 (`exportFullBackupJson`) 与导入 (`importBackupJson`) 必须完整序列化与反序列化多档案数据结构。

---

## 4. Key Entities & Data Schema

### Entity: `SeekerProfile`
```typescript
export interface SeekerProfile {
  id: string; // 唯一 UUID 或 timestamp
  name: string; // 命名/姓名，如 "我自己" 或 "林澈"
  nickname: string; // 昵称
  title: string; // 称号，如 "自性化求问者"
  birthdate: string; // YYYY-MM-DD
  lifePathNumber: number; // 生命灵数 (1-9, 11, 22, 33)
  soulCardId: number; // 0-21 灵魂本命大阿卡纳牌 ID
  personalityCardId: number; // 0-21 个性大阿卡纳牌 ID
  dominantZodiac: string; // 黄道星座
  dominantElement: 'Fire' | 'Water' | 'Air' | 'Earth'; // 主导元素
  personalMotto: string; // 本命格言
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
```

### Entity: `UserSettings` (Extended)
```typescript
export interface UserSettings {
  profile: SeekerProfile; // 兼容当前活跃求问者视图
  profiles: SeekerProfile[]; // 全部已保存求问者档案列表
  activeProfileId: string; // 当前激活求问者档案 ID
  ai: AiSanctuarySettings;
  ritual: RitualSettings;
  audio: ZenAudioSettings;
  theme: 'dark' | 'light' | 'system';
  isPro: boolean;
}
```

---

## 5. Success Criteria & Measurable Outcomes

- **SC-001**: 用户可在 3 次点击内完成新求问者档案的创建并查看其本命灵魂牌。
- **SC-002**: 档案切换响应时间 $<16\text{ms}$，神殿与全局状态无闪烁即时更新。
- **SC-003**: 100% 保证历史单档案旧数据平滑升级，无数据丢失或 JavaScript 运行时错误。
- **SC-004**: 档案管理 CRUD 操作覆盖单元测试与端到端状态验证，单档案删除拦截率 100%。
