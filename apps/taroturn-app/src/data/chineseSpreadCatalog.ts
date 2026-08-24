// src/data/chineseSpreadCatalog.ts - Comprehensive Chinese Spread Purpose & Guidance Catalog

export interface ChineseSpreadMeta {
  id: string;
  name_zh: string;
  name_en: string;
  card_count: number;
  category: '日常冥想' | '时空因果' | '重大抉择' | '深度全景' | '星象能量';
  tag: string;
  purpose: string;
  best_for: string;
  difficulty: '入门' | '进阶' | '大师';
  structure_explanation: string;
  recommended_inquiries: string[];
}

export const CHINESE_SPREAD_CATALOG: Record<string, ChineseSpreadMeta> = {
  daily_single: {
    id: "daily_single",
    name_zh: "每日启示 / 单张牌",
    name_en: "Daily Focus / Oracle",
    card_count: 1,
    category: "日常冥想",
    tag: "每日能量 · 直觉提点",
    purpose: "抽取一张核心原型卡牌，用于晨间静心、日度运势观照，或针对某个具体事件获取最纯粹的即时宇宙直觉启示。",
    best_for: "今日心境观照、晨间冥想、突发事件即时定性、单一行动建议",
    difficulty: "入门",
    structure_explanation: "单核心卡位（100% 聚焦当前瞬间的潜意识主导能量与自性指引）。",
    recommended_inquiries: [
      "今日我最需要关注的核心心绪与灵性能量是什么？",
      "面对眼前这件事，潜意识给我的第一直觉提点为何？",
      "今天如何以最佳的内在状态应对外在挑战？",
    ],
  },
  three_cards_time: {
    id: "three_cards_time",
    name_zh: "时间之流 (过去-现在-未来)",
    name_en: "Time Stream (Past-Present-Future)",
    card_count: 3,
    category: "时空因果",
    tag: "时序演变 · 趋势预测",
    purpose: "通过过去根基、当下处境与未来自然走向三阶段的时空线性演进，剖析因果链条，看清事物发展的惯性势能与拐点。",
    best_for: "项目进展评估、阶段性事件复盘、未来三个月发展趋势推演",
    difficulty: "入门",
    structure_explanation: "过去位（历史成因与潜意识根基）→ 现在位（当下核心阻抗与局势）→ 未来位（若不改变当前路径的自然终局）。",
    recommended_inquiries: [
      "当前项目的时序演变节奏与未来三个月的发展趋势如何？",
      "过去经历的哪些模式仍在深刻影响我当下的决策？",
      "若保持当前行动方式不变，事情最终将走向何种结局？",
    ],
  },
  holy_triangle: {
    id: "holy_triangle",
    name_zh: "圣三角 (现状-障碍-指引)",
    name_en: "Holy Triangle (Situation-Obstacle-Advice)",
    card_count: 3,
    category: "重大抉择",
    tag: "破局诊断 · 行动纲领",
    purpose: "直击问题痛点。以现状为底座、障碍为杠杆、指引为顶点，提供极具实操性的破局诊断方案与心智调和指南。",
    best_for: "遭遇卡点瓶颈、陷入僵局脱困、行动力受阻诊断、战术级策略制定",
    difficulty: "入门",
    structure_explanation: "左底现状位（真实客观全貌）与右底障碍位（显性冲突/隐性阻抗）形成对立张力，由上方顶点指引位进行统合化解。",
    recommended_inquiries: [
      "当前困境的核心阻碍到底是什么？我该如何精准破局？",
      "在当前人际/业务僵局中，潜意识给出的最优破冰策略？",
      "为何事情推进停滞不前？我忽略了什么关键杠杆？",
    ],
  },
  four_elements: {
    id: "four_elements",
    name_zh: "四要素平衡牌阵",
    name_en: "Four Elements Balance",
    card_count: 4,
    category: "深度全景",
    tag: "炼金平衡 · 身心体检",
    purpose: "基于古典黄金黎明四大元素（火·意志/行动、水·情感/直觉、风·心智/逻辑、土·现实/物质），对求问者的身心综合状态进行全方位体检。",
    best_for: "个人身心能量失衡诊断、长期生活状态梳理、多维全景健康与心力评估",
    difficulty: "进阶",
    structure_explanation: "火位（创造冲动）与风位（理性规划）交互；水位（情感需求）与土位（物质安全）承托，直观诊断能量亏空与过载。",
    recommended_inquiries: [
      "我当前在意志、情感、心智与现实四个维度的能量平衡状态如何？",
      "是什么导致了最近心力憔悴？我哪个要素出现了严重亏空？",
      "如何调整日常精力分配以达成身心合一的良性运转？",
    ],
  },
  two_choices: {
    id: "two_choices",
    name_zh: "二选一抉择牌阵",
    name_en: "Two Choices / Crossroads Spread",
    card_count: 5,
    category: "重大抉择",
    tag: "两难抉择 · 平行对比",
    purpose: "当求问者面临十字路口（如跳槽 vs 留任、方案 A vs 方案 B、继续投入 vs 果断止损）时，对比两条平行路径的演变历程与最终收益代价。",
    best_for: "职业跳槽二选一、商业策略路线对比、重大投资决策、两难情感取舍",
    difficulty: "进阶",
    structure_explanation: "中央为当前抉择原点；左翼展开选项 A 的过程与结果；右翼展开选项 B 的过程与结果，形成对称清晰的 ROI 对比图景。",
    recommended_inquiries: [
      "选择 A 方案与选择 B 方案各自的演变历程、潜在代价与最终收益如何？",
      "面对职业转型的两个机会，潜意识与理性权衡下的最优解是哪一个？",
      "留在当前舒适区 vs 迈向未知新领域，两条路径分别将带来什么？",
    ],
  },
  hexagram_7: {
    id: "hexagram_7",
    name_zh: "六芒星 / 大卫星牌阵",
    name_en: "Hexagram / Star of David",
    card_count: 7,
    category: "深度全景",
    tag: "内在动机 · 外在场域",
    purpose: "源自神圣几何大卫星，将上三角（天之法则/内在愿景）与下三角（地之现实/外在环境）深度咬合，解构复杂事件的全维因果与终极结论。",
    best_for: "复杂多方利益博弈、重大人生转折关口、深度心理动力学剖析",
    difficulty: "进阶",
    structure_explanation: "过去位、现在位、未来位构成时间流；对策位、环境位、期望恐惧位构成场域网；中央第 7 张牌为最终统合结论。",
    recommended_inquiries: [
      "针对这件错综复杂的局势，各方势力的真实动机与事件的终极走向是什么？",
      "我的内在潜意识恐惧与外在客观环境是如何相互作用形成当前局面的？",
      "在当前多重博弈中，破局的最关键对策与最终结局为何？",
    ],
  },
  horseshoe_7: {
    id: "horseshoe_7",
    name_zh: "马蹄铁七星牌阵",
    name_en: "Horseshoe Seven Spread",
    card_count: 7,
    category: "深度全景",
    tag: "全景透视 · 环环相扣",
    purpose: "经典的马蹄形弧形牌阵，以严谨的逻辑链条从历史溯源一路推演到终局，特别关注外界环境影响与求问者内在真实态度。",
    best_for: "全面透视某项长期计划的推演、深入理解自身与外部世界的关系",
    difficulty: "进阶",
    structure_explanation: "1.过去 → 2.现在 → 3.隐秘影响 → 4.克服阻碍的途径 → 5.外界态度 → 6.求问者内心 → 7.最终结局。",
    recommended_inquiries: [
      "全景透视这项长期计划的每一个关键转折节点与最终产出？",
      "外部环境（周围人态度）对我达成本次目标是支持还是阻碍？",
      "有哪些我尚未觉察到的隐秘影响力量在暗中发挥作用？",
    ],
  },
  celtic_cross: {
    id: "celtic-cross",
    name_zh: "凯尔特十字牌阵",
    name_en: "The Celtic Cross",
    card_count: 10,
    category: "深度全景",
    tag: "宗师级经典 · 潜意识宏观全貌",
    purpose: "塔罗史上传承逾百年的宗师级牌阵。左侧十字解构当下矛盾压覆与潜意识根基，右侧权杖剖析自我定位、环境投射、内在恐惧与终局命运。",
    best_for: "年度大运推演、重大人生危机全息扫描、触及灵魂深处的全景自性化探究",
    difficulty: "大师",
    structure_explanation: "左侧中央十字（核心现状 + 阻碍压覆）+ 四方星（潜意识根基/过去/皇冠目标/近未来）+ 右侧四阶立柱（自性心智/外在环境/希望恐惧/终局走向）。",
    recommended_inquiries: [
      "全息深度剖析我当前面临的整个人生课题、深层潜意识盲区与终极天命走向？",
      "困扰我的核心冲突背后，压抑在潜意识底层的未竟情结是什么？",
      "未来一年我的自我演化轨迹、环境变迁与最终可能显化的形态为何？",
    ],
  },
};
