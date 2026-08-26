// LockScreenStandByWidgetViews.swift - Lock Screen & StandBy Interactive Widget Views
import WidgetKit
import SwiftUI

public struct LockScreenCircularWidgetView: View {
    public let entry: DailyCardEntry

    public init(entry: DailyCardEntry) {
        self.entry = entry
    }

    public var body: some View {
        ZStack {
            AccessoryWidgetBackground()
            VStack(spacing: 2) {
                Image(systemName: "sparkles")
                    .font(.caption)
                Text("#\(entry.cardId)")
                    .font(.caption2.bold())
            }
        }
    }
}

public struct LockScreenRectangularWidgetView: View {
    public let entry: DailyCardEntry

    public init(entry: DailyCardEntry) {
        self.entry = entry
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            HStack {
                Image(systemName: "sparkles")
                Text("TAROTURN · 今日神谕")
                    .font(.caption2.bold())
            }
            Text(entry.cardNameZh)
                .font(.headline)
            Text(entry.archetypalMeaningZh)
                .font(.caption2)
                .foregroundStyle(.secondary)
                .lineLimit(1)
        }
    }
}

public struct StandByDailyWidgetView: View {
    public let entry: DailyCardEntry

    public init(entry: DailyCardEntry) {
        self.entry = entry
    }

    public var body: some View {
        HStack(spacing: 16) {
            VStack(alignment: .leading, spacing: 8) {
                Text("TAROTURN SANCTUARY")
                    .font(.caption.bold())
                    .foregroundStyle(Color(red: 0.85, green: 0.70, blue: 0.30))
                Text(entry.cardNameZh)
                    .font(.title2.bold())
                    .foregroundStyle(.white)
                Text(entry.archetypalMeaningZh)
                    .font(.callout)
                    .foregroundStyle(.secondary)
            }
            Spacer()
            Image(systemName: "moon.stars.fill")
                .font(.system(size: 48))
                .foregroundStyle(Color(red: 0.85, green: 0.70, blue: 0.30))
        }
        .padding()
        .background(Color(red: 0.06, green: 0.03, blue: 0.12))
    }
}
