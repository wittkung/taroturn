// MobileCarouselLayout.swift - iOS Mobile Responsive Flow
import SwiftUI
import TaroturnCore

public struct MobileCarouselLayout: View {
    @State private var viewModel = ReadingViewModel()

    public init() {}

    public var body: some View {
        NavigationStack {
            VStack(spacing: 24) {
                // Header
                VStack(spacing: 4) {
                    Text("TAROTURN")
                        .font(.title2.bold())
                        .foregroundStyle(Color(red: 0.85, green: 0.70, blue: 0.30))
                    Text("澄澈之境 · 确定性神谕占卜")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                .padding(.top)

                // Main Cards Carousel
                if let session = viewModel.activeSession {
                    TabView {
                        ForEach(session.placedCards, id: \.slot.slotId) { placed in
                            VStack(spacing: 12) {
                                Text(placed.slot.titleZh)
                                    .font(.headline)
                                    .foregroundStyle(Color(red: 0.85, green: 0.70, blue: 0.30))

                                Card3DFlipView(
                                    placedCard: placed,
                                    isFlipped: viewModel.flippedCardIds.contains(placed.slot.slotId)
                                ) {
                                    viewModel.flipCard(slotId: placed.slot.slotId)
                                }

                                Text(placed.slot.meaningPrompt)
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                                    .multilineTextAlignment(.center)
                                    .padding(.horizontal)
                            }
                        }
                    }
                    .tabViewStyle(.page(indexDisplayMode: .always))
                    .frame(height: 340)
                } else {
                    ContentUnavailableView(
                        "静候开启",
                        systemImage: "moon.stars.fill",
                        description: Text("轻触下方按钮抽取今日神圣牌阵")
                    )
                    .frame(height: 340)
                }

                // Action Trigger
                Button {
                    Task {
                        await viewModel.performReading()
                    }
                } label: {
                    Text("开启神圣推演")
                        .font(.headline)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color(red: 0.85, green: 0.70, blue: 0.30))
                        .foregroundStyle(Color(red: 0.06, green: 0.03, blue: 0.12))
                        .clipShape(Capsule())
                }
                .padding(.horizontal)

                Spacer()
            }
            .background(Color(red: 0.06, green: 0.03, blue: 0.12).ignoresSafeArea())
        }
    }
}
