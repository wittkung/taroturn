// TarotCardItemView.swift - 3D Perspective Card Component with Authentic Artwork & Sacred Geometry Foil
import SwiftUI
import TaroturnCore

#if os(macOS)
import AppKit
#elseif os(iOS)
import UIKit
#endif

public struct TarotCardItemView: View {
    public let cardId: UInt8
    public let orientation: Orientation
    public let slotTitleZh: String
    public let slotIndex: Int
    public let isRevealed: Bool
    public let isSelected: Bool
    public let width: CGFloat
    public let height: CGFloat
    public let onFlip: () -> Void
    public let onSelect: () -> Void

    public init(
        cardId: UInt8,
        orientation: Orientation,
        slotTitleZh: String,
        slotIndex: Int,
        isRevealed: Bool,
        isSelected: Bool,
        width: CGFloat = 116,
        height: CGFloat = 196,
        onFlip: @escaping () -> Void,
        onSelect: @escaping () -> Void
    ) {
        self.cardId = cardId
        self.orientation = orientation
        self.slotTitleZh = slotTitleZh
        self.slotIndex = slotIndex
        self.isRevealed = isRevealed
        self.isSelected = isSelected
        self.width = width
        self.height = height
        self.onFlip = onFlip
        self.onSelect = onSelect
    }

    private var cardInfo: TarotCardInfo {
        TarotCatalog.getCard(by: cardId)
    }

    private var flipAngle: Double {
        isRevealed ? 180.0 : 0.0
    }

    public var body: some View {
        VStack(spacing: 8) {
            // Top Slot Badge Pill
            HStack(spacing: 4) {
                Text("#\(slotIndex + 1)")
                    .font(.system(size: 10, weight: .bold, design: .monospaced))
                    .foregroundStyle(TarotTheme.kintsugiGold)
                Text(slotTitleZh)
                    .font(.system(size: 11, weight: .medium))
                    .foregroundStyle(Color.primary.opacity(0.9))
                    .lineLimit(1)
            }
            .padding(.horizontal, 8)
            .padding(.vertical, 3)
            .background(
                Capsule()
                    .fill(Color.primary.opacity(0.06))
                    .overlay(
                        Capsule()
                            .strokeBorder(isSelected ? TarotTheme.kintsugiGold : Color.primary.opacity(0.12), lineWidth: isSelected ? 1.5 : 0.8)
                    )
            )

            // 3D Flipping Card Body
            ZStack {
                // ─── CARD BACK (0 ~ 90 deg) ───
                cardBackView
                    .opacity(flipAngle < 90 ? 1 : 0)
                    .rotation3DEffect(.degrees(flipAngle), axis: (x: 0, y: 1, z: 0), perspective: 0.6)

                // ─── CARD FRONT (90 ~ 180 deg) ───
                cardFrontView
                    .opacity(flipAngle >= 90 ? 1 : 0)
                    .rotation3DEffect(.degrees(flipAngle + 180), axis: (x: 0, y: 1, z: 0), perspective: 0.6)
            }
            .frame(width: width, height: height)
            .shadow(color: isSelected ? TarotTheme.celestialPurple.opacity(0.45) : Color.black.opacity(0.25), radius: isSelected ? 12 : 6, y: 3)
            .onTapGesture {
                if !isRevealed {
                    onFlip()
                }
                onSelect()
            }
        }
    }

    // ─── Card Back: Ornate Violet & Gold Sacred Geometry Mandala ───
    private var cardBackView: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .fill(
                    RadialGradient(
                        colors: [Color(red: 0.20, green: 0.10, blue: 0.35), Color(red: 0.08, green: 0.04, blue: 0.15)],
                        center: .center,
                        startRadius: 10,
                        endRadius: height * 0.7
                    )
                )

            // Sacred Mandala Pattern
            VStack(spacing: 6) {
                Image(systemName: "sparkles")
                    .font(.system(size: 24))
                    .foregroundStyle(Color(red: 0.85, green: 0.70, blue: 0.30).opacity(0.85))

                Circle()
                    .strokeBorder(Color(red: 0.85, green: 0.70, blue: 0.30).opacity(0.3), lineWidth: 1)
                    .frame(width: 48, height: 48)
                    .overlay {
                        Rectangle()
                            .strokeBorder(Color(red: 0.85, green: 0.70, blue: 0.30).opacity(0.25), lineWidth: 1)
                            .frame(width: 34, height: 34)
                            .rotationEffect(.degrees(45))
                    }

                Text("TAROTURN")
                    .font(.system(size: 9, weight: .bold, design: .serif))
                    .tracking(2.5)
                    .foregroundStyle(Color(red: 0.85, green: 0.70, blue: 0.30).opacity(0.7))
            }

            // Dual Gold Border
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .strokeBorder(
                    LinearGradient(
                        colors: [Color(red: 0.95, green: 0.80, blue: 0.40), Color(red: 0.55, green: 0.35, blue: 0.15)],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ),
                    lineWidth: 1.5
                )
                .padding(3)
        }
        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
    }

    // ─── Card Front: Authentic Artwork + Arcana Meta ───
    private var cardFrontView: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .fill(Color(red: 0.09, green: 0.05, blue: 0.15))

            VStack(spacing: 0) {
                // Card Image with rotation if reversed
                Group {
                    if let image = TarotImageLoader.image(named: cardInfo.imageFileName) {
                        image
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                    } else {
                        // High-fidelity fallback vector presentation
                        VStack(spacing: 8) {
                            Text(cardInfo.element.symbol)
                                .font(.system(size: 28))
                            Text(cardInfo.nameZh)
                                .font(.system(size: 16, weight: .bold))
                                .foregroundStyle(Color(red: 0.95, green: 0.80, blue: 0.40))
                            Text(cardInfo.nameEn)
                                .font(.system(size: 10, design: .serif))
                                .foregroundStyle(.secondary)
                        }
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                        .background(Color(red: 0.14, green: 0.08, blue: 0.22))
                    }
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .rotationEffect(orientation == .reversed ? .degrees(180) : .degrees(0))
                .clipped()

                // Card Footer Pill
                HStack {
                    Text(cardInfo.nameZh)
                        .font(.system(size: 11, weight: .bold))
                        .foregroundStyle(.white)
                    Spacer()
                    Text(orientation == .upright ? "正位" : "逆位")
                        .font(.system(size: 9, weight: .bold))
                        .foregroundStyle(orientation == .upright ? Color.green : Color.red)
                        .padding(.horizontal, 4)
                        .padding(.vertical, 1)
                        .background(
                            Capsule().fill((orientation == .upright ? Color.green : Color.red).opacity(0.2))
                        )
                }
                .padding(.horizontal, 6)
                .padding(.vertical, 4)
                .background(Color(red: 0.07, green: 0.04, blue: 0.12).opacity(0.95))
            }

            // Ornate Gold Border Frame
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .strokeBorder(
                    LinearGradient(
                        colors: isSelected
                            ? [Color(red: 0.98, green: 0.88, blue: 0.45), Color(red: 0.85, green: 0.55, blue: 0.20)]
                            : [Color(red: 0.75, green: 0.60, blue: 0.30).opacity(0.6), Color(red: 0.45, green: 0.30, blue: 0.15).opacity(0.4)],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ),
                    lineWidth: isSelected ? 2.0 : 1.0
                )
        }
        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
    }
}
