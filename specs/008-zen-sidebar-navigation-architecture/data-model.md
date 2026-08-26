# Data Model & UI Navigation Contract: Zen Sidebar Workspaces

- **Feature ID**: `008-zen-sidebar-navigation-architecture`
- **Schema Version**: `1.3.0`
- **Date**: 2026-08-25

---

## 1. UI Navigation Types

```typescript
export type ActiveWorkspaceTab =
  | 'divination' // 圣所推演 / 牌阵仪式
  | 'journal'    // 历史账本 / 占卜复盘
  | 'catalog'    // 牌典图谱 / 78 卡牌画廊
  | 'profiles'   // 本命神殿 / 多求问者图谱
  | 'settings';  // 认知中枢 / AI 私有节点与系统设置

export interface WorkspaceTabMeta {
  id: ActiveWorkspaceTab;
  nameZh: string;
  nameEn: string;
  sectionCode: string; // e.g. "DIVINATION_SANCTUARY", "ARCHIVAL_JOURNAL"
  iconName: string;
  badgeCount?: number;
  descriptionZh: string;
}
```

---

## 2. Tab Metadata Registry

| Tab ID | 中文板块名 | 英文代号 | Section 英文标签 | 图标 | 描述 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `divination` | 圣所推演 | Divination Sanctuary | `DIVINATION_SANCTUARY` | `Sparkles` | 牌阵矩阵展开、洗牌仪式、切牌与翻牌推演 |
| `journal` | 历史账本 | Reading Journal | `ARCHIVAL_JOURNAL` | `History` | 历史推演记录、四要素长时心智轨迹、AI 复盘重放 |
| `catalog` | 牌典图谱 | Deck Catalog | `DECK_CATALOG` | `Layers` | 78 张伟特原典画廊、四要素切片筛选、秘传符号学 |
| `profiles` | 本命神殿 | Seeker Sanctuary | `SEEKER_SANCTUARY` | `User` | 多求问者档案库、生命灵数演算、灵魂本命牌与心智图谱 |
| `settings` | 认知中枢 | Sanctuary Settings | `SANCTUARY_SETTINGS` | `Sliders` | AI 私有节点（TTAgy/BYOK）、四大流派导师、仪式物理引擎与音效 |
