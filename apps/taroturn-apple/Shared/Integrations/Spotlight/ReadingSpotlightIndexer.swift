// ReadingSpotlightIndexer.swift - CoreSpotlight Indexing for Divination Journals
import Foundation
import CoreSpotlight
import UniformTypeIdentifiers

public struct ReadingSpotlightIndexer: Sendable {
    public static let shared = ReadingSpotlightIndexer()

    private init() {}

    /// 将推演记录索引至系统 CoreSpotlight
    public func indexReading(
        id: UUID,
        spreadTitleZh: String,
        question: String?,
        dominantElement: String,
        createdAt: Date
    ) async {
        let attributeSet = CSSearchableItemAttributeSet(contentType: .text)
        attributeSet.title = "塔罗推演 · \(spreadTitleZh)"
        attributeSet.contentDescription = "议题: \(question ?? "日常省思") | 主导能量: \(dominantElement)"
        attributeSet.contentCreationDate = createdAt
        attributeSet.keywords = ["塔罗", "Taroturn", spreadTitleZh, dominantElement, question ?? ""]

        let item = CSSearchableItem(
            uniqueIdentifier: "com.taroturn.reading.\(id.uuidString)",
            domainIdentifier: "com.taroturn.readings",
            attributeSet: attributeSet
        )

        do {
            try await CSSearchableIndex.default().indexSearchableItems([item])
        } catch {
            print("[CoreSpotlight] Indexing failed: \(error.localizedDescription)")
        }
    }
}
