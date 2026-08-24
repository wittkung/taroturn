// ThreeColumnZenWorkspace.swift - macOS 3-Column Zen Layout
import SwiftUI
import TaroturnCore

public struct ThreeColumnZenWorkspace: View {
    @State private var viewModel = ReadingViewModel()

    public init() {}

    public var body: some View {
        NavigationSplitView {
            // Left Column: Spread Selector
            List {
                Section("神圣几何牌阵") {
                    Button("单张每日指引") { viewModel.selectedSpreadId = "daily_single" }
                    Button("三态时间流") { viewModel.selectedSpreadId = "three_cards_time" }
                    Button("凯尔特大十字") { viewModel.selectedSpreadId = "celtic_cross" }
                }
            }
            .navigationTitle("牌阵选单")
        } content: {
            // Middle Column: 3D Divination Canvas
            VStack {
                if let session = viewModel.activeSession {
                    ScrollView(.horizontal) {
                        HStack(spacing: 20) {
                            ForEach(session.placedCards, id: \.slot.slotId) { placed in
                                Card3DFlipView(
                                    placedCard: placed,
                                    isFlipped: viewModel.flippedCardIds.contains(placed.slot.slotId)
                                ) {
                                    viewModel.flipCard(slotId: placed.slot.slotId)
                                }
                            }
                        }
                        .padding()
                    }
                } else {
                    ContentUnavailableView("静候心念聚焦", systemImage: "sparkles", description: Text("点击下方按钮开启洗牌推演"))
                }

                Button("启动推演仪式") {
                    Task {
                        await viewModel.performReading()
                    }
                }
                .buttonStyle(.borderedProminent)
                .tint(Color(red: 0.85, green: 0.70, blue: 0.30))
                .padding()
            }
            .navigationTitle("推演圣殿")
        } detail: {
            // Right Column: Elemental Dignities & Synthesis
            VStack(alignment: .leading, spacing: 16) {
                Text("能量平衡与尊位")
                    .font(.headline)
                    .foregroundStyle(Color(red: 0.85, green: 0.70, blue: 0.30))

                if let session = viewModel.activeSession {
                    Text("主导能量: \(session.dignitySummary.dominantElement)")
                    Text(session.dignitySummary.balanceDescriptionZh)
                        .font(.callout)
                        .foregroundStyle(.secondary)
                } else {
                    Text("尚未产生推演数据")
                        .foregroundStyle(.secondary)
                }
                Spacer()
            }
            .padding()
            .navigationTitle("典籍析读")
        }
    }
}
