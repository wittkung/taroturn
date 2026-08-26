// PerformSpreadReadingIntent.swift - Siri & Shortcuts AppIntent for Spread Reading
import AppIntents
import Foundation

public struct PerformSpreadReadingIntent: AppIntent {
    public static let title: LocalizedStringResource = "进行完整牌阵推演"
    public static let description = IntentDescription("使用指定牌阵与心念议题进行推演")

    @Parameter(title: "牌阵标识", default: "three_cards_time")
    public var spreadId: String

    @Parameter(title: "推演议题", default: nil)
    public var customQuestion: String?

    public static let openAppWhenRun: Bool = true

    public init() {}

    public func perform() async throws -> some IntentResult & ProvidesDialog {
        let questionText = customQuestion.flatMap { $0.isEmpty ? nil : $0 } ?? "当下整体运势"
        let dialog = "已为您开启 \(spreadId) 牌阵推演，针对议题「\(questionText)」，请在应用内查看 3D 神圣拓扑画布。"

        return .result(dialog: IntentDialog(stringLiteral: dialog))
    }
}
