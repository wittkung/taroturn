// ReadingSessionRepository.swift - SwiftData ModelContext Data Access Layer
import Foundation
import SwiftData
import TaroturnCore

@MainActor
public final class ReadingSessionRepository {
    private let modelContext: ModelContext

    public init(modelContext: ModelContext) {
        self.modelContext = modelContext
    }

    /// 保存一次推演会话至 SwiftData (并触发 CloudKit 后台加密同步)
    public func saveReading(session: ReadingSession, question: String?, pencilData: Data? = nil) throws -> ReadingRecord {
        let record = ReadingRecord(
            id: UUID(),
            spreadId: session.spreadId,
            spreadTitleZh: session.spreadId == "celtic_cross" ? "凯尔特大十字" : "三态时间流",
            question: question,
            rngSeedHex: session.rngSeed,
            createdAt: Date(),
            dominantElement: String(describing: session.dignitySummary.dominantElement),
            harmonyScore: Double(session.dignitySummary.majorRatio),
            placedCardsJson: "[]",
            dignitySummaryJson: "{}",
            pencilDrawingData: pencilData
        )

        modelContext.insert(record)
        try modelContext.save()

        // 异步索引至 CoreSpotlight
        Task {
            await ReadingSpotlightIndexer.shared.indexReading(
                id: record.id,
                spreadTitleZh: record.spreadTitleZh,
                question: record.question,
                dominantElement: record.dominantElement,
                createdAt: record.createdAt
            )
        }

        return record
    }

    /// 查询全部历史推演记录
    public func fetchAllReadings() throws -> [ReadingRecord] {
        let descriptor = FetchDescriptor<ReadingRecord>(
            sortBy: [SortDescriptor(\.createdAt, order: .reverse)]
        )
        return try modelContext.fetch(descriptor)
    }
}
