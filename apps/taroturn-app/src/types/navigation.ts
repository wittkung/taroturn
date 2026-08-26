// src/types/navigation.ts - Workspace Navigation Contract & Tab Definitions

export type ActiveWorkspaceTab =
  | 'divination' // 圣所推演 / 牌阵仪式
  | 'journal'    // 历史账本 / 占卜复盘
  | 'catalog'    // 牌典图谱 / 78 卡牌画廊
  | 'profiles'   // 本命神殿 / 多求问者图谱
  | 'settings';  // 认知中枢 / 系统设置与 AI 私有节点

export interface WorkspaceTabMeta {
  id: ActiveWorkspaceTab;
  nameZh: string;
  nameEn: string;
  sectionCode: string;
  iconName: 'Sparkles' | 'History' | 'Layers' | 'User' | 'Sliders';
  descriptionZh: string;
}

export const WORKSPACE_TABS: WorkspaceTabMeta[] = [
  {
    id: 'divination',
    nameZh: '圣所推演',
    nameEn: 'Divination Sanctuary',
    sectionCode: 'DIVINATION_SANCTUARY',
    iconName: 'Sparkles',
    descriptionZh: '经典牌阵展开、洗牌意图聚焦与动态推演工作区',
  },
  {
    id: 'journal',
    nameZh: '历史账本',
    nameEn: 'Reading Journal',
    sectionCode: 'ARCHIVAL_JOURNAL',
    iconName: 'History',
    descriptionZh: '历史占卜记录、四要素长时心智轨迹与 AI 复盘',
  },
  {
    id: 'catalog',
    nameZh: '牌典图谱',
    nameEn: 'Deck Catalog',
    sectionCode: 'DECK_CATALOG',
    iconName: 'Layers',
    descriptionZh: '78 张伟特原典画廊、要素切片与秘传符号学',
  },
  {
    id: 'profiles',
    nameZh: '本命神殿',
    nameEn: 'Seeker Sanctuary',
    sectionCode: 'SEEKER_SANCTUARY',
    iconName: 'User',
    descriptionZh: '多求问者本命档案库、生命灵数与心智画像',
  },
  {
    id: 'settings',
    nameZh: '认知中枢',
    nameEn: 'Sanctuary Settings',
    sectionCode: 'SANCTUARY_SETTINGS',
    iconName: 'Sliders',
    descriptionZh: 'AI 私有节点接入、四大导师流派与系统音效',
  },
];
