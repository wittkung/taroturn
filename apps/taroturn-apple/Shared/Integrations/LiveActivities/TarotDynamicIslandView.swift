// TarotDynamicIslandView.swift - SwiftUI Dynamic Island Widget Implementation
import SwiftUI
import WidgetKit

#if os(iOS)
import ActivityKit

public struct TarotRitualLiveActivityWidget: Widget {
    public init() {}

    public var body: some WidgetConfiguration {
        ActivityConfiguration(for: TarotRitualActivityAttributes.self) { context in
            // Lock Screen Live Activity Presentation
            HStack(spacing: 16) {
                Image(systemName: "sparkles")
                    .font(.title2)
                    .foregroundStyle(Color(red: 0.85, green: 0.70, blue: 0.30))

                VStack(alignment: .leading, spacing: 4) {
                    Text(context.attributes.spreadTitleZh)
                        .font(.headline)
                        .foregroundStyle(.white)
                    Text("当前位阶: \(context.state.currentSlotTitleZh) (\(context.state.currentSlotIndex + 1)/\(context.state.totalSlots))")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                Spacer()

                if context.state.isComplete {
                    Text("推演圆满")
                        .font(.caption.bold())
                        .foregroundStyle(Color(red: 0.85, green: 0.70, blue: 0.30))
                }
            }
            .padding()
            .background(Color(red: 0.06, green: 0.03, blue: 0.12))
        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    Image(systemName: "sparkles")
                        .foregroundStyle(Color(red: 0.85, green: 0.70, blue: 0.30))
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text("\(context.state.currentSlotIndex + 1)/\(context.state.totalSlots)")
                        .font(.caption.bold())
                        .foregroundStyle(Color(red: 0.85, green: 0.70, blue: 0.30))
                }
                DynamicIslandExpandedRegion(.bottom) {
                    HStack {
                        Text(context.state.currentSlotTitleZh)
                            .font(.callout.bold())
                        Spacer()
                        if let cardName = context.state.drawnCardNameZh {
                            Text(cardName)
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                    }
                }
            } compactLeading: {
                Image(systemName: "sparkles")
                    .foregroundStyle(Color(red: 0.85, green: 0.70, blue: 0.30))
            } compactTrailing: {
                Text("\(context.state.currentSlotIndex + 1)/\(context.state.totalSlots)")
                    .font(.caption2.bold())
            } minimal: {
                Image(systemName: "sparkles")
                    .foregroundStyle(Color(red: 0.85, green: 0.70, blue: 0.30))
            }
        }
    }
}
#endif
