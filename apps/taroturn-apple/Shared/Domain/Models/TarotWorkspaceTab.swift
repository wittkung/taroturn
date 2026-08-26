// TarotWorkspaceTab.swift - Zen Architecture Top-Level Tab Definitions
import SwiftUI

public enum TarotWorkspaceTab: String, CaseIterable, Identifiable, Sendable {
    case divination = "divination"
    case journal = "journal"
    case catalog = "catalog"
    case profile = "profile"
    case settings = "settings"

    public var id: String { rawValue }

    public var nameZh: String {
        switch self {
        case .divination: return "圣所推演"
        case .journal: return "历史手记"
        case .catalog: return "典籍图谱"
        case .profile: return "本命神殿"
        case .settings: return "认知中枢"
        }
    }

    public var nameEn: String {
        switch self {
        case .divination: return "Divination Sanctuary"
        case .journal: return "Archival Journal"
        case .catalog: return "Deck Catalog"
        case .profile: return "Seeker Sanctuary"
        case .settings: return "Sanctuary Settings"
        }
    }

    public var sectionCode: String {
        switch self {
        case .divination: return "DIVINATION_SANCTUARY"
        case .journal: return "ARCHIVAL_JOURNAL"
        case .catalog: return "DECK_CATALOG"
        case .profile: return "SEEKER_SANCTUARY"
        case .settings: return "SANCTUARY_SETTINGS"
        }
    }

    public var iconName: String {
        switch self {
        case .divination: return "sparkles"
        case .journal: return "clock.arrow.circlepath"
        case .catalog: return "book.closed"
        case .profile: return "person.crop.circle"
        case .settings: return "gearshape"
        }
    }

    public var descriptionZh: String {
        switch self {
        case .divination: return "经典牌阵展开、洗牌意图聚焦与拓扑推演工作区"
        case .journal: return "历史占卜记录、四要素长时心智轨迹与 AI 复盘"
        case .catalog: return "78 张莱德·伟特原典画廊、要素切片与秘传符号学"
        case .profile: return "求道者本命档案、生命灵数与灵魂画像"
        case .settings: return "AI 私有节点接入、四大导师流派与系统音效"
        }
    }
}
