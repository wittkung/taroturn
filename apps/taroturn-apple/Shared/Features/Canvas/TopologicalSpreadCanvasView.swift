// TopologicalSpreadCanvasView.swift - Universal Topological Spread Matrix Canvas (1:1 Web Canvas Alignment)
import SwiftUI
import TaroturnCore

public struct TopologicalSpreadCanvasView: View {
    public let spreadId: String
    public let session: ReadingSession?
    public let revealedSlots: Set<UInt8>
    public let selectedSlotIndex: Int
    public let onSelectSlot: (Int) -> Void
    public let onFlipCard: (UInt8) -> Void

    public init(
        spreadId: String,
        session: ReadingSession?,
        revealedSlots: Set<UInt8>,
        selectedSlotIndex: Int,
        onSelectSlot: @escaping (Int) -> Void,
        onFlipCard: @escaping (UInt8) -> Void
    ) {
        self.spreadId = spreadId
        self.session = session
        self.revealedSlots = revealedSlots
        self.selectedSlotIndex = selectedSlotIndex
        self.onSelectSlot = onSelectSlot
        self.onFlipCard = onFlipCard
    }

    private var spreadMeta: ChineseSpreadMeta {
        ChineseSpreadCatalog.getSpread(by: spreadId)
    }

    public var body: some View {
        GeometryReader { geo in
            let w = geo.size.width
            let h = geo.size.height

            ZStack {
                if let session = session, !session.placedCards.isEmpty {
                    // Active Spread Layout Canvas
                    renderPlacedCards(in: CGSize(width: w, height: h), placedCards: session.placedCards)
                } else {
                    // ─── Initial Mystical Sacred Geometry Mandala Placeholder ───
                    VStack(spacing: 24) {
                        ZStack {
                            Circle()
                                .strokeBorder(
                                    LinearGradient(
                                        colors: [TarotTheme.celestialPurple.opacity(0.35), TarotTheme.kintsugiGold.opacity(0.35)],
                                        startPoint: .topLeading,
                                        endPoint: .bottomTrailing
                                    ),
                                    lineWidth: 1.5
                                )
                                .frame(width: 180, height: 180)

                            Circle()
                                .strokeBorder(TarotTheme.celestialPurple.opacity(0.2), style: StrokeStyle(lineWidth: 1, dash: [4, 4]))
                                .frame(width: 220, height: 220)

                            Image(systemName: "sparkles")
                                .font(.system(size: 40))
                                .foregroundStyle(
                                    LinearGradient(
                                        colors: [TarotTheme.kintsugiGold, TarotTheme.celestialPurple],
                                        startPoint: .top,
                                        endPoint: .bottom
                                    )
                                )
                        }

                        VStack(spacing: 8) {
                            Text(spreadMeta.nameZh)
                                .font(.system(size: 22, weight: .bold, design: .serif))
                                .foregroundStyle(Color.primary)

                            Text(spreadMeta.tag)
                                .font(.system(size: 13, weight: .semibold))
                                .foregroundStyle(TarotTheme.kintsugiGold)

                            Text(spreadMeta.purpose)
                                .font(.system(size: 12))
                                .foregroundStyle(Color.secondary)
                                .multilineTextAlignment(.center)
                                .frame(maxWidth: 480)
                                .padding(.top, 4)
                        }
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                }
            }
        }
    }

    @ViewBuilder
    private func renderPlacedCards(in size: CGSize, placedCards: [PlacedCard]) -> some View {
        let count = placedCards.count
        let cardSize = getCardDimensions(count: count)

        // 1. Single Card Spread
        if count == 1 {
            let placed = placedCards[0]
            TarotCardItemView(
                cardId: placed.drawnCard.cardId,
                orientation: placed.drawnCard.orientation,
                slotTitleZh: "核心原力指引",
                slotIndex: 0,
                isRevealed: revealedSlots.contains(placed.slotId),
                isSelected: selectedSlotIndex == 0,
                width: cardSize.width,
                height: cardSize.height,
                onFlip: { onFlipCard(placed.slotId) },
                onSelect: { onSelectSlot(0) }
            )
            .position(x: size.width / 2, y: size.height / 2)
        }
        // 2. Three Cards Horizontal Time Flow
        else if count == 3 && spreadId != "holy_triangle" {
            let slotTitles = ["过往潜因", "当下显化", "未来趋向"]
            HStack(spacing: 32) {
                ForEach(0..<3, id: \.self) { idx in
                    if idx < placedCards.count {
                        let placed = placedCards[idx]
                        TarotCardItemView(
                            cardId: placed.drawnCard.cardId,
                            orientation: placed.drawnCard.orientation,
                            slotTitleZh: slotTitles[idx],
                            slotIndex: idx,
                            isRevealed: revealedSlots.contains(placed.slotId),
                            isSelected: selectedSlotIndex == idx,
                            width: cardSize.width,
                            height: cardSize.height,
                            onFlip: { onFlipCard(placed.slotId) },
                            onSelect: { onSelectSlot(idx) }
                        )
                    }
                }
            }
            .position(x: size.width / 2, y: size.height / 2)
        }
        // 3. Holy Triangle (3 Cards Triangle)
        else if count == 3 && spreadId == "holy_triangle" {
            let slotTitles = ["现状根基", "核心障碍", "神圣指引"]
            ZStack {
                // Top Apex (Advice)
                if placedCards.count > 2 {
                    let placed = placedCards[2]
                    TarotCardItemView(
                        cardId: placed.drawnCard.cardId,
                        orientation: placed.drawnCard.orientation,
                        slotTitleZh: slotTitles[2],
                        slotIndex: 2,
                        isRevealed: revealedSlots.contains(placed.slotId),
                        isSelected: selectedSlotIndex == 2,
                        width: cardSize.width,
                        height: cardSize.height,
                        onFlip: { onFlipCard(placed.slotId) },
                        onSelect: { onSelectSlot(2) }
                    )
                    .position(x: size.width / 2, y: size.height * 0.28)
                }

                // Bottom Left (Situation)
                if placedCards.count > 0 {
                    let placed = placedCards[0]
                    TarotCardItemView(
                        cardId: placed.drawnCard.cardId,
                        orientation: placed.drawnCard.orientation,
                        slotTitleZh: slotTitles[0],
                        slotIndex: 0,
                        isRevealed: revealedSlots.contains(placed.slotId),
                        isSelected: selectedSlotIndex == 0,
                        width: cardSize.width,
                        height: cardSize.height,
                        onFlip: { onFlipCard(placed.slotId) },
                        onSelect: { onSelectSlot(0) }
                    )
                    .position(x: size.width * 0.35, y: size.height * 0.68)
                }

                // Bottom Right (Obstacle)
                if placedCards.count > 1 {
                    let placed = placedCards[1]
                    TarotCardItemView(
                        cardId: placed.drawnCard.cardId,
                        orientation: placed.drawnCard.orientation,
                        slotTitleZh: slotTitles[1],
                        slotIndex: 1,
                        isRevealed: revealedSlots.contains(placed.slotId),
                        isSelected: selectedSlotIndex == 1,
                        width: cardSize.width,
                        height: cardSize.height,
                        onFlip: { onFlipCard(placed.slotId) },
                        onSelect: { onSelectSlot(1) }
                    )
                    .position(x: size.width * 0.65, y: size.height * 0.68)
                }
            }
        }
        // 4. Celtic Cross (10 Cards)
        else if count == 10 || spreadId == "celtic_cross" {
            renderCelticCross(in: size, placedCards: placedCards, cardSize: cardSize)
        }
        // 5. General / Multi-card Grid
        else {
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 24) {
                    ForEach(Array(placedCards.enumerated()), id: \.element.slotId) { idx, placed in
                        TarotCardItemView(
                            cardId: placed.drawnCard.cardId,
                            orientation: placed.drawnCard.orientation,
                            slotTitleZh: "卡位 #\(idx + 1)",
                            slotIndex: idx,
                            isRevealed: revealedSlots.contains(placed.slotId),
                            isSelected: selectedSlotIndex == idx,
                            width: cardSize.width,
                            height: cardSize.height,
                            onFlip: { onFlipCard(placed.slotId) },
                            onSelect: { onSelectSlot(idx) }
                        )
                    }
                }
                .padding(.horizontal, 40)
                .frame(minWidth: size.width, minHeight: size.height)
            }
        }
    }

    @ViewBuilder
    private func renderCelticCross(in size: CGSize, placedCards: [PlacedCard], cardSize: CGSize) -> some View {
        let celticTitles = [
            "当下显化", "对立阻抗", "潜意识根基", "既往成因", "愿景顶点",
            "近未来势", "自性态度", "外界场域", "希望与恐惧", "终局裁决"
        ]

        let leftCenterX = size.width * 0.38
        let centerY = size.height * 0.50
        let rightColX = size.width * 0.82

        ZStack {
            // Card 1: Present Center
            if placedCards.count > 0 {
                let placed = placedCards[0]
                TarotCardItemView(
                    cardId: placed.drawnCard.cardId,
                    orientation: placed.drawnCard.orientation,
                    slotTitleZh: celticTitles[0],
                    slotIndex: 0,
                    isRevealed: revealedSlots.contains(placed.slotId),
                    isSelected: selectedSlotIndex == 0,
                    width: cardSize.width,
                    height: cardSize.height,
                    onFlip: { onFlipCard(placed.slotId) },
                    onSelect: { onSelectSlot(0) }
                )
                .position(x: leftCenterX, y: centerY)
            }

            // Card 2: Obstacle Cross (90 deg rotated)
            if placedCards.count > 1 {
                let placed = placedCards[1]
                TarotCardItemView(
                    cardId: placed.drawnCard.cardId,
                    orientation: placed.drawnCard.orientation,
                    slotTitleZh: celticTitles[1],
                    slotIndex: 1,
                    isRevealed: revealedSlots.contains(placed.slotId),
                    isSelected: selectedSlotIndex == 1,
                    width: cardSize.width,
                    height: cardSize.height,
                    onFlip: { onFlipCard(placed.slotId) },
                    onSelect: { onSelectSlot(1) }
                )
                .rotationEffect(.degrees(90))
                .position(x: leftCenterX, y: centerY)
                .zIndex(20)
            }

            // Card 3: Root / Subconscious (Bottom)
            if placedCards.count > 2 {
                let placed = placedCards[2]
                TarotCardItemView(
                    cardId: placed.drawnCard.cardId,
                    orientation: placed.drawnCard.orientation,
                    slotTitleZh: celticTitles[2],
                    slotIndex: 2,
                    isRevealed: revealedSlots.contains(placed.slotId),
                    isSelected: selectedSlotIndex == 2,
                    width: cardSize.width,
                    height: cardSize.height,
                    onFlip: { onFlipCard(placed.slotId) },
                    onSelect: { onSelectSlot(2) }
                )
                .position(x: leftCenterX, y: centerY + cardSize.height * 1.15)
            }

            // Card 4: Past Influence (Left)
            if placedCards.count > 3 {
                let placed = placedCards[3]
                TarotCardItemView(
                    cardId: placed.drawnCard.cardId,
                    orientation: placed.drawnCard.orientation,
                    slotTitleZh: celticTitles[3],
                    slotIndex: 3,
                    isRevealed: revealedSlots.contains(placed.slotId),
                    isSelected: selectedSlotIndex == 3,
                    width: cardSize.width,
                    height: cardSize.height,
                    onFlip: { onFlipCard(placed.slotId) },
                    onSelect: { onSelectSlot(3) }
                )
                .position(x: leftCenterX - cardSize.width * 1.25, y: centerY)
            }

            // Card 5: Crown Goal (Top)
            if placedCards.count > 4 {
                let placed = placedCards[4]
                TarotCardItemView(
                    cardId: placed.drawnCard.cardId,
                    orientation: placed.drawnCard.orientation,
                    slotTitleZh: celticTitles[4],
                    slotIndex: 4,
                    isRevealed: revealedSlots.contains(placed.slotId),
                    isSelected: selectedSlotIndex == 4,
                    width: cardSize.width,
                    height: cardSize.height,
                    onFlip: { onFlipCard(placed.slotId) },
                    onSelect: { onSelectSlot(4) }
                )
                .position(x: leftCenterX, y: centerY - cardSize.height * 1.15)
            }

            // Card 6: Near Future (Right of Cross)
            if placedCards.count > 5 {
                let placed = placedCards[5]
                TarotCardItemView(
                    cardId: placed.drawnCard.cardId,
                    orientation: placed.drawnCard.orientation,
                    slotTitleZh: celticTitles[5],
                    slotIndex: 5,
                    isRevealed: revealedSlots.contains(placed.slotId),
                    isSelected: selectedSlotIndex == 5,
                    width: cardSize.width,
                    height: cardSize.height,
                    onFlip: { onFlipCard(placed.slotId) },
                    onSelect: { onSelectSlot(5) }
                )
                .position(x: leftCenterX + cardSize.width * 1.25, y: centerY)
            }

            // Staff Column (Cards 7, 8, 9, 10 on the Right)
            VStack(spacing: 12) {
                ForEach(6..<10, id: \.self) { idx in
                    if idx < placedCards.count {
                        let placed = placedCards[idx]
                        TarotCardItemView(
                            cardId: placed.drawnCard.cardId,
                            orientation: placed.drawnCard.orientation,
                            slotTitleZh: celticTitles[idx],
                            slotIndex: idx,
                            isRevealed: revealedSlots.contains(placed.slotId),
                            isSelected: selectedSlotIndex == idx,
                            width: cardSize.width,
                            height: cardSize.height,
                            onFlip: { onFlipCard(placed.slotId) },
                            onSelect: { onSelectSlot(idx) }
                        )
                    }
                }
            }
            .position(x: rightColX, y: centerY)
        }
    }

    private func getCardDimensions(count: Int) -> CGSize {
        if count >= 10 {
            return CGSize(width: 66, height: 112)
        } else if count >= 7 {
            return CGSize(width: 76, height: 130)
        } else if count >= 4 {
            return CGSize(width: 96, height: 162)
        } else if count == 3 {
            return CGSize(width: 116, height: 196)
        } else {
            return CGSize(width: 140, height: 236)
        }
    }
}
