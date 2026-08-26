// CardDetailInspectorSheet.swift - Full Holographic Card Metaphysical Inspector (ui-ux-pro-max + WSJ Typography)
import SwiftUI
import TaroturnCore

public struct CardDetailInspectorSheet: View {
    @Environment(\.dismiss) private var dismiss
    public let card: TarotCardInfo

    public init(card: TarotCardInfo) {
        self.card = card
    }

    public var body: some View {
        NavigationStack {
            HStack(spacing: 32) {
                // Left: Large Holographic Artwork Display
                ZStack {
                    RoundedRectangle(cornerRadius: 14, style: .continuous)
                        .fill(Color.primary.opacity(0.04))

                    if let image = TarotImageLoader.image(named: card.imageFileName) {
                        image
                            .resizable()
                            .aspectRatio(contentMode: .fit)
                            .clipShape(RoundedRectangle(cornerRadius: 13, style: .continuous))
                    }
                }
                .frame(width: 250, height: 430)
                .overlay(
                    RoundedRectangle(cornerRadius: 14, style: .continuous)
                        .strokeBorder(
                            LinearGradient(
                                colors: [TarotTheme.kintsugiGold, TarotTheme.celestialPurple],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            ),
                            lineWidth: 1.5
                        )
                )
                .shadow(color: TarotTheme.celestialPurple.opacity(0.35), radius: 18, y: 6)

                // Right: Detailed Metaphysical & Archetypal Info
                ScrollView {
                    VStack(alignment: .leading, spacing: 20) {
                        // Title & Nomenclature
                        VStack(alignment: .leading, spacing: 4) {
                            HStack(spacing: 8) {
                                Text(card.nameZh)
                                    .font(.system(size: 28, weight: .bold, design: .serif))
                                    .foregroundStyle(TarotTheme.kintsugiGold)
                                Text(card.element.symbol)
                                    .font(.system(size: 24))
                            }
                            Text(card.nameEn)
                                .font(.system(size: 16, design: .serif))
                                .foregroundStyle(Color.secondary)
                        }

                        // Arcana & Celestial Archetype Badges
                        HStack(spacing: 8) {
                            Text(card.arcana.rawValue)
                                .font(.system(size: 11, weight: .semibold))
                                .padding(.horizontal, 9)
                                .padding(.vertical, 4)
                                .background(Capsule().fill(TarotTheme.celestialPurple.opacity(0.18)))
                                .foregroundStyle(Color.primary)
                                .overlay(Capsule().strokeBorder(TarotTheme.celestialPurple.opacity(0.3), lineWidth: 0.8))

                            Text(card.astrology)
                                .font(.system(size: 11, weight: .semibold))
                                .padding(.horizontal, 9)
                                .padding(.vertical, 4)
                                .background(Capsule().fill(TarotTheme.kintsugiGold.opacity(0.15)))
                                .foregroundStyle(Color.primary)
                                .overlay(Capsule().strokeBorder(TarotTheme.kintsugiGold.opacity(0.35), lineWidth: 0.8))
                        }

                        Divider().background(Color.primary.opacity(0.1))

                        // Upright Meanings
                        VStack(alignment: .leading, spacing: 8) {
                            HStack(spacing: 6) {
                                Image(systemName: "arrow.up.circle.fill")
                                    .foregroundStyle(Color.green)
                                Text("正位象征与行动启示")
                                    .font(.system(size: 14, weight: .bold))
                                    .foregroundStyle(Color.green)
                            }
                            Text(card.meaningUpright)
                                .font(.system(size: 13))
                                .foregroundStyle(Color.primary.opacity(0.9))
                                .lineSpacing(5)

                            HStack(spacing: 6) {
                                ForEach(card.keywordsUpright, id: \.self) { kw in
                                    Text("#\(kw)")
                                        .font(.system(size: 11))
                                        .foregroundStyle(Color.green)
                                        .padding(.horizontal, 8)
                                        .padding(.vertical, 3)
                                        .background(Capsule().fill(Color.green.opacity(0.12)))
                                }
                            }
                        }
                        .padding(14)
                        .background(Color.green.opacity(0.05))
                        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                        .overlay(RoundedRectangle(cornerRadius: 12, style: .continuous).strokeBorder(Color.green.opacity(0.2), lineWidth: 0.8))

                        // Reversed Meanings
                        VStack(alignment: .leading, spacing: 8) {
                            HStack(spacing: 6) {
                                Image(systemName: "arrow.down.circle.fill")
                                    .foregroundStyle(Color.red)
                                Text("逆位阴影与内在转化")
                                    .font(.system(size: 14, weight: .bold))
                                    .foregroundStyle(Color.red)
                            }
                            Text(card.meaningReversed)
                                .font(.system(size: 13))
                                .foregroundStyle(Color.primary.opacity(0.9))
                                .lineSpacing(5)

                            HStack(spacing: 6) {
                                ForEach(card.keywordsReversed, id: \.self) { kw in
                                    Text("#\(kw)")
                                        .font(.system(size: 11))
                                        .foregroundStyle(Color.red)
                                        .padding(.horizontal, 8)
                                        .padding(.vertical, 3)
                                        .background(Capsule().fill(Color.red.opacity(0.12)))
                                }
                            }
                        }
                        .padding(14)
                        .background(Color.red.opacity(0.05))
                        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                        .overlay(RoundedRectangle(cornerRadius: 12, style: .continuous).strokeBorder(Color.red.opacity(0.2), lineWidth: 0.8))
                    }
                    .padding(.vertical, 12)
                }
            }
            .padding(32)
            .background(VisualEffectView(material: .hudWindow, blendingMode: .behindWindow, state: .active))
            .background(.ultraThinMaterial)
            .navigationTitle("塔罗原典精解")
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("关闭") { dismiss() }
                }
            }
        }
        .frame(minWidth: 720, minHeight: 520)
    }
}
