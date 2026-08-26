# Data Model: Multi-Profile Natal Tarot Registry

- **Feature ID**: `007-multi-profile-natal-tarot`
- **Schema Version**: `1.2.0`
- **Date**: 2026-08-25

---

## 1. Entity Definitions

### 1.1 `SeekerProfile` (求问者独立档案)

| 字段名 | 类型 | 必填 | 默认值 | 描述 |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `string` | 是 | - | 档案唯一标识符 (e.g. `profile_1724567890_a1b2c3` 或 `default-seeker`) |
| `name` | `string` | 是 | `漫游探求者` | 档案展示名称 / 姓名 / 备注 (e.g. "我自己", "林澈", "合伙人 Alex") |
| `nickname` | `string` | 是 | `漫游探求者` | 称谓昵称 |
| `title` | `string` | 是 | `自性化求问者` | 身份契约称号 (e.g. "星轨观测者", "潜意识漫游者") |
| `birthdate` | `string` | 是 | `1998-08-08` | 出生年月日 (ISO 8601 格式: `YYYY-MM-DD`) |
| `lifePathNumber` | `number` | 是 | `7` | 生命灵数计算结果 (1-9, 11, 22, 33) |
| `soulCardId` | `number` | 是 | `9` | 灵魂本命大阿卡纳牌编号 (0-21) |
| `personalityCardId` | `number` | 是 | `9` | 个性大阿卡纳牌编号 (0-21) |
| `dominantZodiac` | `string` | 是 | `狮子座 (Leo)` | 出生日对应的黄道星座 |
| `dominantElement` | `'Fire' \| 'Water' \| 'Air' \| 'Earth'` | 是 | `'Fire'` | 星座对应的四要素主导属性 |
| `personalMotto` | `string` | 是 | - | 对应本命牌的灵魂格言 |
| `createdAt` | `string` | 否 | `new Date().toISOString()` | 档案创建时间戳 |
| `updatedAt` | `string` | 否 | `new Date().toISOString()` | 档案最后更新时间戳 |

---

### 1.2 `UserSettings` (用户全局设置 - 扩展)

| 字段名 | 类型 | 必填 | 描述 |
| :--- | :--- | :---: | :--- |
| `profile` | `SeekerProfile` | 是 | **当前激活求问者档案的镜像视图**（保障既有单档案消费逻辑 100% 兼容） |
| `profiles` | `SeekerProfile[]` | 是 | **全部已保存的求问者档案列表**（长度 $\ge 1$） |
| `activeProfileId` | `string` | 是 | **当前激活的求问者档案 ID** |
| `ai` | `AiSanctuarySettings` | 是 | AI 算力与导师流派设置 |
| `ritual` | `RitualSettings` | 是 | 占卜与仪式物理引擎设置 |
| `audio` | `ZenAudioSettings` | 是 | 禅意音效引擎配置 |
| `theme` | `'dark' \| 'light' \| 'system'` | 是 | 界面色彩主题 |
| `isPro` | `boolean` | 是 | 专业版标记 |

---

## 2. State Invariants & Validation Rules

1. **Non-Empty Invariant**: `profiles.length >= 1` 始终成立。任何删除操作在 `profiles.length === 1` 时必须被拦截拒绝。
2. **Active ID Consistency**: `activeProfileId` 必须始终存在于 `profiles.map(p => p.id)` 中。若删除当前活跃档案，系统必须自动重定向至 `profiles[0].id`。
3. **Synchronized Active Mirror**: `profile` 字段必须始终深拷贝自 `profiles.find(p => p.id === activeProfileId)`。
4. **Deterministic Natal Derivation**: 只要 `birthdate` 发生变化，`lifePathNumber`, `soulCardId`, `personalityCardId`, `dominantZodiac`, `dominantElement`, `personalMotto` 必须立即通过 `calculateSeekerProfile(birthdate)` 重新计算。
