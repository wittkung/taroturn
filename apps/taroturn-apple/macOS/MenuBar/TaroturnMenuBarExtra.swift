// TaroturnMenuBarExtra.swift - macOS Menu Bar Companion Status Item
import SwiftUI
import TaroturnCore
import TaroturnShared

#if os(macOS)
import AppKit

public struct TaroturnMenuBarView: View {
    @State private var viewModel = ReadingViewModel()

    public init() {}

    public var body: some View {
        VStack(spacing: 12) {
            HStack {
                Text("TAROTURN")
                    .font(.caption.bold())
                    .foregroundStyle(Color(red: 0.85, green: 0.70, blue: 0.30))
                Spacer()
                Button("全屏圣殿") {
                    NSApp.activate(ignoringOtherApps: true)
                }
                .buttonStyle(.plain)
                .font(.caption2)
                .foregroundStyle(.secondary)
            }

            Divider()

            if let session = viewModel.activeSession, let firstCard = session.placedCards.first {
                VStack(spacing: 6) {
                    Text("核心原力卡位")
                        .font(.caption2)
                        .foregroundStyle(Color(red: 0.85, green: 0.70, blue: 0.30))
                    Text("Card #\(firstCard.drawnCard.cardId)")
                        .font(.headline)
                        .foregroundStyle(.white)
                    Text(firstCard.drawnCard.orientation == .upright ? "正位" : "逆位")
                        .font(.caption)
                        .foregroundStyle(firstCard.drawnCard.orientation == .upright ? .green : .red)
                }
                .padding()
                .frame(maxWidth: .infinity)
                .background(Color(red: 0.10, green: 0.06, blue: 0.18))
                .clipShape(RoundedRectangle(cornerRadius: 10))
            } else {
                Text("轻触下方开启今日原力指引")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .padding()
            }

            Button {
                Task {
                    viewModel.selectedSpreadId = "daily_single"
                    await viewModel.performReading()
                }
            } label: {
                Label("抽取今日指引", systemImage: "sparkles")
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.borderedProminent)
            .tint(Color(red: 0.85, green: 0.70, blue: 0.30))
        }
        .padding()
        .frame(width: 260)
        .background(Color(red: 0.06, green: 0.03, blue: 0.12))
    }
}
#endif
