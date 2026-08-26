// TarotCardCatalog.swift - 78-Card Complete Archetype Catalog & Asset Resolver
import SwiftUI

public enum TarotArcana: String, Sendable, CaseIterable {
    case major = "大阿尔卡那"
    case wands = "权杖 (火)"
    case cups = "圣杯 (水)"
    case swords = "宝剑 (风)"
    case pentacles = "星币 (土)"
}

public enum TarotElement: String, Sendable {
    case fire = "火"
    case water = "水"
    case air = "风"
    case earth = "土"

    public var symbol: String {
        switch self {
        case .fire: return "🔥"
        case .water: return "💧"
        case .air: return "🌬️"
        case .earth: return "⛰️"
        }
    }

    public var color: Color {
        switch self {
        case .fire: return Color(red: 0.95, green: 0.35, blue: 0.25)
        case .water: return Color(red: 0.25, green: 0.60, blue: 0.95)
        case .air: return Color(red: 0.85, green: 0.75, blue: 0.30)
        case .earth: return Color(red: 0.35, green: 0.75, blue: 0.45)
        }
    }
}

public struct TarotCardInfo: Identifiable, Sendable {
    public let id: UInt8
    public let nameZh: String
    public let nameEn: String
    public let arcana: TarotArcana
    public let element: TarotElement
    public let astrology: String
    public let keywordsUpright: [String]
    public let keywordsReversed: [String]
    public let meaningUpright: String
    public let meaningReversed: String
    public let imageFileName: String

    public init(
        id: UInt8,
        nameZh: String,
        nameEn: String,
        arcana: TarotArcana,
        element: TarotElement,
        astrology: String,
        keywordsUpright: [String],
        keywordsReversed: [String],
        meaningUpright: String,
        meaningReversed: String,
        imageFileName: String
    ) {
        self.id = id
        self.nameZh = nameZh
        self.nameEn = nameEn
        self.arcana = arcana
        self.element = element
        self.astrology = astrology
        self.keywordsUpright = keywordsUpright
        self.keywordsReversed = keywordsReversed
        self.meaningUpright = meaningUpright
        self.meaningReversed = meaningReversed
        self.imageFileName = imageFileName
    }
}

public struct TarotCatalog {
    public static let allCards: [TarotCardInfo] = {
        var list: [TarotCardInfo] = []

        // 22 Major Arcana
        let majorNamesZh = [
            "愚者", "魔术师", "女祭司", "女皇", "皇帝", "教皇", "恋人", "战车",
            "力量", "隐士", "命运之轮", "正义", "倒吊人", "死神", "节制", "恶魔",
            "高塔", "星星", "月亮", "太阳", "审判", "世界"
        ]
        let majorNamesEn = [
            "The Fool", "The Magician", "The High Priestess", "The Empress", "The Emperor", "The Hierophant", "The Lovers", "The Chariot",
            "Strength", "The Hermit", "Wheel of Fortune", "Justice", "The Hanged Man", "Death", "Temperance", "The Devil",
            "The Tower", "The Star", "The Moon", "The Sun", "Judgement", "The World"
        ]
        let majorElements: [TarotElement] = [
            .air, .air, .water, .earth, .fire, .earth, .air, .water,
            .fire, .earth, .fire, .air, .water, .water, .fire, .earth,
            .fire, .air, .water, .fire, .fire, .earth
        ]
        let majorAstrology = [
            "天王星 / 风元素", "水星", "月亮", "金星", "白羊座", "金牛座", "双子座", "巨蟹座",
            "狮子座", "处女座", "木星", "天秤座", "海王星", "天蝎座", "射手座", "摩羯座",
            "火星", "水瓶座", "双鱼座", "太阳", "冥王星", "土星"
        ]
        let majorKeywordsUpright = [
            ["全新起点", "纯真探索", "自由之灵", "无限潜能"],
            ["心智显化", "资源整合", "创造力", "精湛技艺"],
            ["直觉深邃", "潜意识", "内在智慧", "静默守候"],
            ["丰盛繁衍", "母性滋养", "感官愉悦", "创造之力"],
            ["秩序建立", "权威掌控", "稳定基石", "理性意志"],
            ["精神导师", "传统智慧", "体制规则", "信仰传递"],
            ["心魂契合", "重大抉择", "情感共鸣", "价值对齐"],
            ["坚毅克难", "意志掌控", "凯旋前行", "战胜对立"],
            ["温柔以御", "内在勇气", "调伏本能", "慈悲笃定"],
            ["独自省思", "智慧追寻", "内省明灯", "远离喧嚣"],
            ["宿命转折", "周期循环", "机运降临", "不可抗力"],
            ["公正客观", "因果平衡", "契约真理", "清醒决断"],
            ["视角转换", "臣服顺应", "牺牲顿悟", "暂缓行动"],
            ["必然终结", "蜕变重生", "告别陈旧", "涅槃更新"],
            ["动态平衡", "炼金调和", "适度节制", "耐心融合"],
            ["欲望执念", "物质束缚", "阴影投射", "上瘾盲区"],
            ["幻象瓦解", "顿悟震荡", "旧构崩塌", "清障重构"],
            ["希望灵感", "疗愈复苏", "平静指引", "纯净愿景"],
            ["幻象迷茫", "潜意识波动", "直觉探索", "暗夜渡航"],
            ["明朗喜悦", "活力显化", "丰盛真理", "生命荣耀"],
            ["觉醒重塑", "灵魂召唤", "因果清算", "天命显现"],
            ["圆满大成", "全息整合", "新纪元开端", "旅程巅峰"]
        ]

        for i in 0..<22 {
            let imgName = String(format: "m%02d.jpg", i)
            list.append(TarotCardInfo(
                id: UInt8(i),
                nameZh: majorNamesZh[i],
                nameEn: majorNamesEn[i],
                arcana: .major,
                element: majorElements[i],
                astrology: majorAstrology[i],
                keywordsUpright: majorKeywordsUpright[i],
                keywordsReversed: ["阻滞", "过度", "失衡", "偏颇"],
                meaningUpright: "象征着深刻的灵性觉知与原型力量在物质界的展开。",
                meaningReversed: "提示需内观能量的过度与阻滞，调整心智模式。",
                imageFileName: imgName
            ))
        }

        // Minor Arcana (56 Cards: Wands 22..35, Cups 36..49, Swords 50..63, Pentacles 64..77)
        let suits: [(TarotArcana, TarotElement, String, String, String)] = [
            (.wands, .fire, "权杖", "Wands", "w"),
            (.cups, .water, "圣杯", "Cups", "c"),
            (.swords, .air, "宝剑", "Swords", "s"),
            (.pentacles, .earth, "星币", "Pentacles", "p")
        ]
        let rankNamesZh = ["首牌", "二", "三", "四", "五", "六", "七", "八", "九", "十", "侍从", "骑士", "王后", "国王"]
        let rankNamesEn = ["Ace", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Page", "Knight", "Queen", "King"]

        var currentId: UInt8 = 22
        for suit in suits {
            for r in 1...14 {
                let imgName = String(format: "%@%02d.jpg", suit.4, r)
                let nameZh = "\(suit.2)\(rankNamesZh[r - 1])"
                let nameEn = "\(rankNamesEn[r - 1]) of \(suit.3)"
                list.append(TarotCardInfo(
                    id: currentId,
                    nameZh: nameZh,
                    nameEn: nameEn,
                    arcana: suit.0,
                    element: suit.1,
                    astrology: "\(suit.1.symbol) \(suit.0.rawValue)",
                    keywordsUpright: ["\(suit.2)原力", "显化推进", "对应领域演化"],
                    keywordsReversed: ["能量受阻", "过度消耗", "迟滞反省"],
                    meaningUpright: "在日常现实经验层面显化的阶段性能量与行动指南。",
                    meaningReversed: "在现实执行或情绪互动中面临挑战与反转契机。",
                    imageFileName: imgName
                ))
                currentId += 1
            }
        }

        return list
    }()

    private static let cardMap: [UInt8: TarotCardInfo] = {
        var map: [UInt8: TarotCardInfo] = [:]
        for card in allCards {
            map[card.id] = card
        }
        return map
    }()

    public static func getCard(by id: UInt8) -> TarotCardInfo {
        cardMap[id] ?? allCards[0]
    }
}

// ─── High-Performance In-Memory Cached Tarot Original Artwork Image Loader ───
public final class TarotImageLoader: @unchecked Sendable {
    public static let shared = TarotImageLoader()
    private let cache = NSCache<NSString, AnyObject>()

    private init() {
        cache.countLimit = 120
    }

    public static func image(named fileName: String) -> Image? {
        shared.loadImage(named: fileName)
    }

    public func loadImage(named fileName: String) -> Image? {
        let key = fileName as NSString
        #if os(macOS)
        if let cached = cache.object(forKey: key) as? NSImage {
            return Image(nsImage: cached)
        }
        if let nsImage = resolveNSImage(named: fileName) {
            cache.setObject(nsImage, forKey: key)
            return Image(nsImage: nsImage)
        }
        #elseif os(iOS)
        if let cached = cache.object(forKey: key) as? UIImage {
            return Image(uiImage: cached)
        }
        if let uiImage = resolveUIImage(named: fileName) {
            cache.setObject(uiImage, forKey: key)
            return Image(uiImage: uiImage)
        }
        #endif
        return nil
    }

    #if os(macOS)
    private func resolveNSImage(named fileName: String) -> NSImage? {
        let baseName = (fileName as NSString).deletingPathExtension

        // 1. Bundle.main in cards/images
        if let path = Bundle.main.path(forResource: baseName, ofType: "jpg", inDirectory: "cards/images"),
           let img = NSImage(contentsOfFile: path) {
            return img
        }

        // 2. Bundle.main in dist/cards
        if let path = Bundle.main.path(forResource: baseName, ofType: "jpg", inDirectory: "dist/cards"),
           let img = NSImage(contentsOfFile: path) {
            return img
        }

        // 3. Bundle.main root resources
        if let path = Bundle.main.path(forResource: baseName, ofType: "jpg"),
           let img = NSImage(contentsOfFile: path) {
            return img
        }

        // 4. Bundle.main url
        if let url = Bundle.main.url(forResource: fileName, withExtension: nil),
           let img = NSImage(contentsOf: url) {
            return img
        }

        // 5. SPM Bundle.module
        #if SWIFT_PACKAGE
        if let url = Bundle.module.url(forResource: baseName, withExtension: "jpg"),
           let img = NSImage(contentsOf: url) {
            return img
        }
        #endif

        return nil
    }
    #elseif os(iOS)
    private func resolveUIImage(named fileName: String) -> UIImage? {
        let baseName = (fileName as NSString).deletingPathExtension
        if let path = Bundle.main.path(forResource: baseName, ofType: "jpg", inDirectory: "cards/images"),
           let img = UIImage(contentsOfFile: path) {
            return img
        }
        if let path = Bundle.main.path(forResource: baseName, ofType: "jpg"),
           let img = UIImage(contentsOfFile: path) {
            return img
        }
        #if SWIFT_PACKAGE
        if let url = Bundle.module.url(forResource: baseName, withExtension: "jpg"),
           let data = try? Data(contentsOf: url),
           let img = UIImage(data: data) {
            return img
        }
        #endif
        return nil
    }
    #endif
}

