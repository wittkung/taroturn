// HandoffCoordinator.swift - NSUserActivity Cross-Device Continuity & Handoff
import Foundation
import SwiftUI

public enum TaroturnUserActivityType {
    public static let readingSession = "com.taroturn.app.reading-session"
}

public struct HandoffReadingPayload: Codable, Sendable {
    public let spreadId: String
    public let rngSeedHex: String
    public let question: String?
    public let flippedSlotIds: [UInt8]

    public init(spreadId: String, rngSeedHex: String, question: String?, flippedSlotIds: [UInt8]) {
        self.spreadId = spreadId
        self.rngSeedHex = rngSeedHex
        self.question = question
        self.flippedSlotIds = flippedSlotIds
    }
}

public final class HandoffCoordinator: @unchecked Sendable {
    public static let shared = HandoffCoordinator()

    private init() {}

    /// 创建并激活 Handoff 广播活动
    public func createReadingActivity(payload: HandoffReadingPayload) -> NSUserActivity {
        let activity = NSUserActivity(activityType: TaroturnUserActivityType.readingSession)
        activity.title = "塔罗推演 · \(payload.spreadId)"
        activity.isEligibleForHandoff = true
        activity.isEligibleForSearch = true
        activity.isEligibleForPublicIndexing = false

        if let data = try? JSONEncoder().encode(payload) {
            activity.addUserInfoEntries(from: ["payloadData": data])
        }

        return activity
    }

    /// 从 Handoff 活动中还原推演状态
    public func extractPayload(from activity: NSUserActivity) -> HandoffReadingPayload? {
        guard activity.activityType == TaroturnUserActivityType.readingSession,
              let data = activity.userInfo?["payloadData"] as? Data else {
            return nil
        }
        return try? JSONDecoder().decode(HandoffReadingPayload.self, from: data)
    }
}
