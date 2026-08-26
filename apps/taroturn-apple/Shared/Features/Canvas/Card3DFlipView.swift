// Card3DFlipView.swift - 3D Perspective Card Flip with Haptics
import SwiftUI
import TaroturnCore

public struct Card3DFlipView: View {
    let placedCard: PlacedCard
    let slotTitleZh: String
    let isFlipped: Bool
    let onFlip: () -> Void

    public init(
        placedCard: PlacedCard,
        slotTitleZh: String = "推演卡位",
        isFlipped: Bool,
        onFlip: @escaping () -> Void
    ) {
        self.placedCard = placedCard
        self.slotTitleZh = slotTitleZh
        self.isFlipped = isFlipped
        self.onFlip = onFlip
    }

    private var flipAngle: Double {
        isFlipped ? 180.0 : 0.0
    }

    public var body: some View {
        ZStack {
            // Card Back (0 ~ 90 deg)
            RoundedRectangle(cornerRadius: 14, style: .continuous)
                .fill(
                    RadialGradient(
                        colors: [Color(red: 0.15, green: 0.08, blue: 0.25), Color(red: 0.06, green: 0.03, blue: 0.12)],
                        center: .center,
                        startRadius: 20,
                        endRadius: 100
                    )
                )
                .overlay {
                    RoundedRectangle(cornerRadius: 14, style: .continuous)
                        .strokeBorder(Color(red: 0.85, green: 0.70, blue: 0.30).opacity(0.4), lineWidth: 1)
                }
                .opacity(flipAngle < 90 ? 1 : 0)
                .rotation3DEffect(.degrees(flipAngle), axis: (x: 0, y: 1, z: 0), perspective: 0.7)

            // Card Front (90 ~ 180 deg)
            RoundedRectangle(cornerRadius: 14, style: .continuous)
                .fill(Color(red: 0.10, green: 0.06, blue: 0.18))
                .overlay {
                    VStack(spacing: 6) {
                        Text(slotTitleZh)
                            .font(.caption2)
                            .foregroundStyle(Color(red: 0.85, green: 0.70, blue: 0.30))
                        Text("Card #\(placedCard.drawnCard.cardId)")
                            .font(.headline)
                            .foregroundStyle(.white)
                        Text(placedCard.drawnCard.orientation == .upright ? "正位" : "逆位")
                            .font(.caption)
                            .foregroundStyle(placedCard.drawnCard.orientation == .upright ? .green : .red)
                    }
                    .padding()
                }
                .overlay {
                    RoundedRectangle(cornerRadius: 14, style: .continuous)
                        .strokeBorder(Color(red: 0.85, green: 0.70, blue: 0.30).opacity(0.6), lineWidth: 1)
                }
                .opacity(flipAngle >= 90 ? 1 : 0)
                .rotation3DEffect(.degrees(flipAngle + 180), axis: (x: 0, y: 1, z: 0), perspective: 0.7)
        }
        .frame(width: 120, height: 200)
        .onTapGesture {
            onFlip()
        }
    }
}
