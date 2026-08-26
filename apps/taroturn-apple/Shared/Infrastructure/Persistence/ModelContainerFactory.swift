// ModelContainerFactory.swift - SwiftData Local Storage & App Group ModelContainer
import Foundation
import SwiftData

public enum ModelContainerFactory {
    public static let appGroupIdentifier = "group.com.taroturn.app"

    /// 创建通用 ModelContainer
    @MainActor
    public static func createSharedContainer(inMemory: Bool = false) -> ModelContainer {
        let schema = Schema([
            ReadingRecord.self,
            JournalEntryRecord.self,
            OtpDeckRecord.self
        ])

        let configuration = ModelConfiguration(
            schema: schema,
            isStoredInMemoryOnly: inMemory,
            cloudKitDatabase: .none
        )

        do {
            return try ModelContainer(for: schema, configurations: [configuration])
        } catch {
            print("⚠️ [ModelContainerFactory] Standard init failed: \(error), creating in-memory fallback...")
            let fallbackConfig = ModelConfiguration(schema: schema, isStoredInMemoryOnly: true)
            do {
                return try ModelContainer(for: schema, configurations: [fallbackConfig])
            } catch {
                fatalError("Failed to initialize SwiftData ModelContainer: \(error)")
            }
        }
    }
}
