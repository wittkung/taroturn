# Data Model: Apple Native Swift UI & System Integrations

- **Feature**: `006-apple-native-swift-ui`
- **Scope**: SwiftData Entities, UniFFI Bridge Types, WidgetKit Timeline, ActivityKit State, AppIntents
- **Author**: Antigravity / CTO Persona

---

## 1. SwiftData Persistence Models (`@Model`)

### `ReadingRecord`
Represents a persisted divination reading session in local SwiftData and iCloud CloudKit.

```swift
@Model
public final class ReadingRecord {
    @Attribute(.unique) public var id: UUID
    public var spreadId: String
    public var spreadTitleZh: String
    public var question: String?
    public var rngSeedHex: String
    public var createdAt: Date
    public var dominantElement: String
    public var harmonyScore: Double
    
    // Serialized snapshot of placed cards and dignities
    @Attribute(.allowsCloudEncryption) public var placedCardsJson: String
    @Attribute(.allowsCloudEncryption) public var dignitySummaryJson: String
    
    // Optional PencilKit drawing data for iPad annotations
    @Attribute(.allowsCloudEncryption) public var pencilDrawingData: Data?
    
    @Relationship(deleteRule: .cascade, inverse: \JournalEntryRecord.reading)
    public var journalEntries: [JournalEntryRecord] = []
    
    public init(
        id: UUID = UUID(),
        spreadId: String,
        spreadTitleZh: String,
        question: String?,
        rngSeedHex: String,
        createdAt: Date = Date(),
        dominantElement: String,
        harmonyScore: Double,
        placedCardsJson: String,
        dignitySummaryJson: String,
        pencilDrawingData: Data? = nil
    ) {
        self.id = id
        self.spreadId = spreadId
        self.spreadTitleZh = spreadTitleZh
        self.question = question
        self.rngSeedHex = rngSeedHex
        self.createdAt = createdAt
        self.dominantElement = dominantElement
        self.harmonyScore = harmonyScore
        self.placedCardsJson = placedCardsJson
        self.dignitySummaryJson = dignitySummaryJson
        self.pencilDrawingData = pencilDrawingData
    }
}
```

### `JournalEntryRecord`
Represents user reflections, insights, and meditation logs linked to a reading.

```swift
@Model
public final class JournalEntryRecord {
    @Attribute(.unique) public var id: UUID
    public var createdAt: Date
    public var updatedAt: Date
    @Attribute(.allowsCloudEncryption) public var contentMarkdown: String
    public var moodTags: [String]
    public var reading: ReadingRecord?

    public init(
        id: UUID = UUID(),
        createdAt: Date = Date(),
        updatedAt: Date = Date(),
        contentMarkdown: String,
        moodTags: [String] = [],
        reading: ReadingRecord? = nil
    ) {
        self.id = id
        self.createdAt = createdAt
        self.updatedAt = updatedAt
        self.contentMarkdown = contentMarkdown
        self.moodTags = moodTags
        self.reading = reading
    }
}
```

### `OtpDeckRecord`
Represents an installed or purchased Open Tarot Package deck on the device.

```swift
@Model
public final class OtpDeckRecord {
    @Attribute(.unique) public var deckId: String
    public var nameZh: String
    public var nameEn: String
    public var author: String
    public var version: String
    public var isBuiltin: Bool
    public var isUnlocked: Bool
    public var installedAt: Date
    public var packageSha256: String
    public var localAssetDirectoryUrl: String?

    public init(
        deckId: String,
        nameZh: String,
        nameEn: String,
        author: String,
        version: String,
        isBuiltin: Bool = false,
        isUnlocked: Bool = false,
        installedAt: Date = Date(),
        packageSha256: String,
        localAssetDirectoryUrl: String? = nil
    ) {
        self.deckId = deckId
        self.nameZh = nameZh
        self.nameEn = nameEn
        self.author = author
        self.version = version
        self.isBuiltin = isBuiltin
        self.isUnlocked = isUnlocked
        self.installedAt = installedAt
        self.packageSha256 = packageSha256
        self.localAssetDirectoryUrl = localAssetDirectoryUrl
    }
}
```

---

## 2. WidgetKit & Dynamic Island Value Objects

### `DailyCardTimelineEntry`
```swift
public struct DailyCardTimelineEntry: TimelineEntry, Sendable {
    public let date: Date
    public let cardId: UInt8
    public let nameZh: String
    public let nameEn: String
    public let orientation: String // "Upright" | "Reversed"
    public let element: String // "Fire" | "Water" | "Air" | "Earth"
    public let archetypalMeaningZh: String
    public let astrologicalCorrespondence: String
    public let seedHex: String
}
```

### `TarotRitualActivityAttributes`
```swift
public struct TarotRitualActivityAttributes: ActivityAttributes, Sendable {
    public struct ContentState: Codable, Hashable, Sendable {
        public var currentSlotIndex: Int
        public var totalSlots: Int
        public var currentSlotTitleZh: String
        public var drawnCardNameZh: String?
        public var isComplete: Bool
    }
    
    public var spreadId: String
    public var spreadTitleZh: String
    public var sessionStartTime: Date
}
```
