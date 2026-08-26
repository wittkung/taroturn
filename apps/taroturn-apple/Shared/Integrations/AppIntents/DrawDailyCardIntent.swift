// DrawDailyCardIntent.swift - Siri & Shortcuts AppIntent for Daily Card Draw
import AppIntents
import Foundation

public struct DrawDailyCardIntent: AppIntent {
    public static let title: LocalizedStringResource = "抽取今日塔罗牌"
    public static let description = IntentDescription("自动抽取并播报今日核心原力指引")

    public static let openAppWhenRun: Bool = false

    public init() {}

    public func perform() async throws -> some IntentResult & ProvidesDialog {
        let currentDate = Date()
        let dayFormatter = DateFormatter()
        dayFormatter.dateFormat = "yyyy-MM-dd"
        let dateKey = dayFormatter.string(from: currentDate)
        let pseudoCardId = UInt8((abs(dateKey.hashValue) % 78))

        let spokenDialog = "你今日抽到的原力指引为第 \(pseudoCardId) 号牌。能量象征着觉知与新开端。"

        return .result(dialog: IntentDialog(stringLiteral: spokenDialog))
    }
}
