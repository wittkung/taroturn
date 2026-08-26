// TarotRitualActivityAttributes.swift - ActivityKit Attributes for Contemplative Rituals
import Foundation

#if canImport(ActivityKit) && os(iOS)
import ActivityKit

public struct TarotRitualActivityAttributes: ActivityAttributes, Sendable {
    public struct ContentState: Codable, Hashable, Sendable {
        public var currentSlotIndex: Int
        public var totalSlots: Int
        public var currentSlotTitleZh: String
        public var drawnCardNameZh: String?
        public var isComplete: Bool

        public init(
            currentSlotIndex: Int = 0,
            totalSlots: Int = 3,
            currentSlotTitleZh: String = "当下显化",
            drawnCardNameZh: String? = nil,
            isComplete: Bool = false
        ) {
            self.currentSlotIndex = currentSlotIndex
            self.totalSlots = totalSlots
            self.currentSlotTitleZh = currentSlotTitleZh
            self.drawnCardNameZh = drawnCardNameZh
            self.isComplete = isComplete
        }
    }

    public var spreadId: String
    public var spreadTitleZh: String
    public var sessionStartTime: Date

    public init(spreadId: String, spreadTitleZh: String, sessionStartTime: Date = Date()) {
        self.spreadId = spreadId
        self.spreadTitleZh = spreadTitleZh
        self.sessionStartTime = sessionStartTime
    }
}
#endif
