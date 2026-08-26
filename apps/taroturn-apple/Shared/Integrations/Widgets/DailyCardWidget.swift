// DailyCardWidget.swift - WidgetKit Timeline Provider & Daily Card Widget
import WidgetKit
import SwiftUI

public struct DailyCardEntry: TimelineEntry, Sendable {
    public let date: Date
    public let cardId: UInt8
    public let cardNameZh: String
    public let cardNameEn: String
    public let orientationZh: String
    public let elementZh: String
    public let archetypalMeaningZh: String
    public let seedHex: String

    public init(
        date: Date = Date(),
        cardId: UInt8 = 0,
        cardNameZh: String = "愚者 (The Fool)",
        cardNameEn: String = "The Fool",
        orientationZh: String = "正位",
        elementZh: String = "风元素",
        archetypalMeaningZh: String = "纯真、新起点、无限潜能与灵性跃迁",
        seedHex: String = "0000000000000000000000000000000000000000000000000000000000000000"
    ) {
        self.date = date
        self.cardId = cardId
        self.cardNameZh = cardNameZh
        self.cardNameEn = cardNameEn
        self.orientationZh = orientationZh
        self.elementZh = elementZh
        self.archetypalMeaningZh = archetypalMeaningZh
        self.seedHex = seedHex
    }
}

public struct DailyCardTimelineProvider: TimelineProvider {
    public typealias Entry = DailyCardEntry

    public func placeholder(in context: Context) -> DailyCardEntry {
        DailyCardEntry()
    }

    public func getSnapshot(in context: Context, completion: @escaping (DailyCardEntry) -> Void) {
        completion(DailyCardEntry())
    }

    public func getTimeline(in context: Context, completion: @escaping (Timeline<DailyCardEntry>) -> Void) {
        let currentDate = Date()
        let calendar = Calendar.current
        let startOfDay = calendar.startOfDay(for: currentDate)
        let nextDay = calendar.date(byAdding: .day, value: 1, to: startOfDay)!

        // 确定性每日种子计算 (基于日期产生唯一伪随机种子)
        let dayFormatter = DateFormatter()
        dayFormatter.dateFormat = "yyyy-MM-dd"
        let dateKey = dayFormatter.string(from: currentDate)
        let pseudoCardId = UInt8((abs(dateKey.hashValue) % 78))

        let entry = DailyCardEntry(
            date: currentDate,
            cardId: pseudoCardId,
            cardNameZh: "每日原力 #\(pseudoCardId)",
            cardNameEn: "Daily Archetype #\(pseudoCardId)",
            orientationZh: "正位",
            elementZh: "风元素",
            archetypalMeaningZh: "今日心念聚焦于直觉洞察与内在觉察",
            seedHex: String(format: "%064x", abs(dateKey.hashValue))
        )

        let timeline = Timeline(entries: [entry], policy: .after(nextDay))
        completion(timeline)
    }
}

public struct DailyCardWidgetEntryView: View {
    public var entry: DailyCardTimelineProvider.Entry
    @Environment(\.widgetFamily) var family

    public init(entry: DailyCardTimelineProvider.Entry) {
        self.entry = entry
    }

    public var body: some View {
        ZStack {
            Color(red: 0.06, green: 0.03, blue: 0.12).ignoresSafeArea()

            VStack(alignment: .leading, spacing: 6) {
                HStack {
                    Text("TAROTURN")
                        .font(.caption2.bold())
                        .foregroundStyle(Color(red: 0.85, green: 0.70, blue: 0.30))
                    Spacer()
                    Text(entry.elementZh)
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }

                Spacer()

                Text(entry.cardNameZh)
                    .font(.headline)
                    .foregroundStyle(.white)
                
                Text(entry.orientationZh)
                    .font(.caption)
                    .foregroundStyle(Color(red: 0.85, green: 0.70, blue: 0.30))

                if family != .systemSmall {
                    Text(entry.archetypalMeaningZh)
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                        .lineLimit(2)
                }
            }
            .padding()
        }
    }
}
