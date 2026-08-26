// ChineseSpreadCatalog.swift - Comprehensive Chinese Spread Purpose & Guidance Catalog
import Foundation

public struct ChineseSpreadMeta: Identifiable, Sendable {
    public let id: String
    public let nameZh: String
    public let nameEn: String
    public let cardCount: Int
    public let category: String
    public let tag: String
    public let purpose: String
    public let bestFor: String
    public let difficulty: String
    public let structureExplanation: String
    public let recommendedInquiries: [String]

    public init(
        id: String,
        nameZh: String,
        nameEn: String,
        cardCount: Int,
        category: String,
        tag: String,
        purpose: String,
        bestFor: String,
        difficulty: String,
        structureExplanation: String,
        recommendedInquiries: [String]
    ) {
        self.id = id
        self.nameZh = nameZh
        self.nameEn = nameEn
        self.cardCount = cardCount
        self.category = category
        self.tag = tag
        self.purpose = purpose
        self.bestFor = bestFor
        self.difficulty = difficulty
        self.structureExplanation = structureExplanation
        self.recommendedInquiries = recommendedInquiries
    }
}

public struct ChineseSpreadCatalog {
    public static let allSpreads: [ChineseSpreadMeta] = [
        ChineseSpreadMeta(
            id: "daily_single",
            nameZh: "每日启示 / 单张牌",
            nameEn: "Daily Focus / Oracle",
            cardCount: 1,
            category: "日常冥想",
            tag: "每日能量 · 直觉提点",
            purpose: "抽取一张核心原型卡牌，用于晨间静心、日度运势观照，或针对具体事件获取即时直觉启示。",
            bestFor: "今日心境观照、晨间冥想、突发事件即时定性、单一行动建议",
            difficulty: "入门",
            structureExplanation: "单核心卡位（聚焦当前瞬间的潜意识主导能量与自性指引）。",
            recommendedInquiries: [
                "今日我最需要关注的核心心绪与灵性能量是什么？",
                "面对眼前这件事，潜意识给我的第一直觉提点为何？",
                "今天如何以最佳的内在状态应对外在挑战？"
            ]
        ),
        ChineseSpreadMeta(
            id: "three_cards_time",
            nameZh: "时间之流 (过去-现在-未来)",
            nameEn: "Time Stream (Past-Present-Future)",
            cardCount: 3,
            category: "时空因果",
            tag: "时序演变 · 趋势预测",
            purpose: "通过过去根基、当下处境与未来自然走向三阶段的时空线性演进，剖析因果链条，看清发展惯性与拐点。",
            bestFor: "项目进展评估、阶段性事件复盘、未来三个月发展趋势推演",
            difficulty: "入门",
            structureExplanation: "过去位（历史成因）→ 现在位（当下阻抗与局势）→ 未来位（自然终局）。",
            recommendedInquiries: [
                "当前项目的时序演变节奏与未来三个月的发展趋势如何？",
                "过去经历的哪些模式仍在深刻影响我当下的决策？",
                "若保持当前行动方式不变，事情最终将走向何种结局？"
            ]
        ),
        ChineseSpreadMeta(
            id: "holy_triangle",
            nameZh: "圣三角 (现状-障碍-指引)",
            nameEn: "Holy Triangle (Situation-Obstacle-Advice)",
            cardCount: 3,
            category: "重大抉择",
            tag: "破局诊断 · 行动纲领",
            purpose: "直击问题痛点。以现状为底座、障碍为杠杆、指引为顶点，提供极具实操性的破局诊断方案。",
            bestFor: "遭遇卡点瓶颈、陷入僵局脱困、行动力受阻诊断、战术级策略制定",
            difficulty: "入门",
            structureExplanation: "现状位（客观事实）+ 障碍位（核心阻力）→ 顶点指引位（破局关键）。",
            recommendedInquiries: [
                "我在当前困局中最关键的内在与外在阻碍是什么？",
                "打破目前僵局最有力的单一突破口在哪里？"
            ]
        ),
        ChineseSpreadMeta(
            id: "four_elements",
            nameZh: "四元素全景 (火水风土)",
            nameEn: "Four Elements Panorama",
            cardCount: 4,
            category: "深度全景",
            tag: "四维立体 · 整体平衡",
            purpose: "将事物拆解为行动意志(火)、情感流动(水)、理性认知(风)与物质现实(土)四大维度，透视全息状态。",
            bestFor: "全面深度体检、重大人生阶段复盘、心智与现实脱节诊断",
            difficulty: "进阶",
            structureExplanation: "火位(意志) + 水位(情感) + 风位(思维) + 土位(物质资源)。",
            recommendedInquiries: [
                "我当前在意志、情感、思维与物质四个维度的能量平衡如何？",
                "哪个维度的匮乏或过剩正在拖累整体推进？"
            ]
        ),
        ChineseSpreadMeta(
            id: "two_choices",
            nameZh: "二选一抉择牌阵",
            nameEn: "Two Choices Decision Spread",
            cardCount: 5,
            category: "重大抉择",
            tag: "双轨对比 · 路径模拟",
            purpose: "在两难抉择时，分别模拟选择方案 A 与方案 B 的后续演化路径及最终结果，辅助清醒决断。",
            bestFor: "职业跳槽二选一、创业路线分歧、生活重心取舍",
            difficulty: "进阶",
            structureExplanation: "现状核心 + 选项A路径/结果 + 选项B路径/结果。",
            recommendedInquiries: [
                "若我选择路径 A，其短期阻力与长期成果为何？",
                "若我选择路径 B，其代价与潜在收益如何对比？"
            ]
        ),
        ChineseSpreadMeta(
            id: "hexagram_7",
            nameZh: "六芒星 / 大卫之星",
            nameEn: "Hexagram (Star of David)",
            cardCount: 7,
            category: "星象能量",
            tag: "天地交泰 · 宏观大势",
            purpose: "借助上下交错的双三角形神圣几何，解构天地人神关系，多角度审视宏观局势与内在愿景。",
            bestFor: "复杂事件深度占算、长期战略布局、重大生活转折",
            difficulty: "进阶",
            structureExplanation: "正三角(过去/现在/未来) + 倒三角(对策/环境/愿景) + 中心最终结果。",
            recommendedInquiries: [
                "当前复杂局面的全息走向与最终收敛方向为何？"
            ]
        ),
        ChineseSpreadMeta(
            id: "horseshoe_7",
            nameZh: "马蹄铁拱形牌阵",
            nameEn: "Horseshoe Spread",
            cardCount: 7,
            category: "深度全景",
            tag: "弧形演进 · 全景透视",
            purpose: "沿马蹄铁抛物线展开 7 个关键节点，平滑展现从历史成因到最终结果的连续发展轨迹。",
            bestFor: "周期性项目全程跟踪、人际关系深度演变透析",
            difficulty: "进阶",
            structureExplanation: "过去 → 现状 → 潜意识 → 阻碍 → 外界影响 → 最佳对策 → 最终结果。",
            recommendedInquiries: [
                "这一长期事项经历各个关键节点的连续演变规律为何？"
            ]
        ),
        ChineseSpreadMeta(
            id: "celtic_cross",
            nameZh: "经典凯尔特大十字",
            nameEn: "Classic Celtic Cross",
            cardCount: 10,
            category: "深度全景",
            tag: "西方占星 · 全息圣殿",
            purpose: "塔罗世界最负盛名的大师级牌阵。以小十字为心核、四方为翼展、四杖权柄为阶梯，穷尽一切显隐因果。",
            bestFor: "人生重大课题、宿命级困惑、全维度战略透析",
            difficulty: "大师",
            structureExplanation: "十字核心(当下/阻碍/潜意识/过去/目标/近未来) + 阶梯柱(自我/环境/恐惧与希望/终极结果)。",
            recommendedInquiries: [
                "针对这一宿命级议题，请全方位展开其潜意识根基与最终走向。",
                "有哪些我未曾察觉的深层盲区在主导事件发展？"
            ]
        )
    ]

    public static func getSpread(by id: String) -> ChineseSpreadMeta {
        allSpreads.first(where: { $0.id == id }) ?? allSpreads[0]
    }
}
