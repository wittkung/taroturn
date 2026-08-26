// ReadingDrawerView.swift - Detailed Reading Drawer & Inspector (1:1 Web ReadingDrawer Alignment)
import SwiftUI
import TaroturnCore

public struct ReadingDrawerView: View {
    public let spreadId: String
    public let session: ReadingSession?
    public let selectedSlotIndex: Int
    public let onSelectSlot: (Int) -> Void
    public let onClose: () -> Void

    @State private var selectedTab: DrawerTab = .cardDetail
    @State private var chatQuery: String = ""
    @State private var chatMessages: [ChatMessageItem] = []
    @State private var isGenerating: Bool = false

    public enum DrawerTab: String, CaseIterable, Identifiable {
        case cardDetail = "单牌精解"
        case elementDignities = "元素尊位"
        case aiOracle = "神谕心流"

        public var id: String { rawValue }
    }

    public struct ChatMessageItem: Identifiable {
        public let id = UUID()
        public let role: String
        public let content: String
    }

    public init(
        spreadId: String,
        session: ReadingSession?,
        selectedSlotIndex: Int,
        onSelectSlot: @escaping (Int) -> Void,
        onClose: @escaping () -> Void
    ) {
        self.spreadId = spreadId
        self.session = session
        self.selectedSlotIndex = selectedSlotIndex
        self.onSelectSlot = onSelectSlot
        self.onClose = onClose
    }

    private var currentPlacedCard: PlacedCard? {
        guard let session = session, selectedSlotIndex < session.placedCards.count else { return nil }
        return session.placedCards[selectedSlotIndex]
    }

    private var currentCardInfo: TarotCardInfo {
        if let placed = currentPlacedCard {
            return TarotCatalog.getCard(by: placed.drawnCard.cardId)
        }
        return TarotCatalog.allCards[0]
    }

    public var body: some View {
        VStack(spacing: 0) {
            // ─── Drawer Header ───
            HStack {
                HStack(spacing: 6) {
                    Image(systemName: "sparkles")
                        .foregroundStyle(TarotTheme.kintsugiGold)
                    Text("典籍析读 · 圣殿抽屉")
                        .font(.system(size: 14, weight: .bold, design: .serif))
                        .foregroundStyle(Color.primary)
                }

                Spacer()

                Button(action: onClose) {
                    Image(systemName: "xmark.circle.fill")
                        .font(.system(size: 16))
                        .foregroundStyle(Color.secondary)
                }
                .buttonStyle(.plain)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
            .background(Color.clear)
            .overlay(
                Rectangle()
                    .frame(height: 1)
                    .foregroundStyle(TarotTheme.headerHairline),
                alignment: .bottom
            )

            // ─── Segmented Tab Picker ───
            Picker("Tabs", selection: $selectedTab) {
                ForEach(DrawerTab.allCases) { tab in
                    Text(tab.rawValue).tag(tab)
                }
            }
            .pickerStyle(.segmented)
            .padding(12)

            Divider()
                .background(Color.primary.opacity(0.08))

            // ─── Tab Content Body ───
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    switch selectedTab {
                    case .cardDetail:
                        cardDetailSection
                    case .elementDignities:
                        elementDignitiesSection
                    case .aiOracle:
                        aiOracleSection
                    }
                }
                .padding(16)
            }
        }
        .frame(width: 360)
        .background(VisualEffectView(material: .sidebar, blendingMode: .behindWindow, state: .active))
        .background(.ultraThinMaterial)
        .background(Color.clear)
        .overlay(
            Rectangle()
                .frame(width: 0.8)
                .foregroundStyle(TarotTheme.headerHairline),
            alignment: .leading
        )
    }

    // ─── 1. Card Detail Section ───
    private var cardDetailSection: some View {
        VStack(alignment: .leading, spacing: 14) {
            if let placed = currentPlacedCard {
                HStack(alignment: .top, spacing: 14) {
                    // Small Preview Thumbnail with Authentic Artwork
                    ZStack {
                        RoundedRectangle(cornerRadius: 8)
                            .fill(Color.primary.opacity(0.05))

                        if let image = TarotImageLoader.image(named: currentCardInfo.imageFileName) {
                            image
                                .resizable()
                                .aspectRatio(contentMode: .fit)
                                .rotationEffect(placed.drawnCard.orientation == .reversed ? .degrees(180) : .degrees(0))
                                .clipShape(RoundedRectangle(cornerRadius: 8))
                        } else {
                            VStack(spacing: 4) {
                                Text(currentCardInfo.element.symbol)
                                    .font(.system(size: 20))
                                Text(currentCardInfo.nameZh)
                                    .font(.system(size: 11, weight: .bold))
                                    .foregroundStyle(TarotTheme.kintsugiGold)
                                Text(placed.drawnCard.orientation == .upright ? "正位" : "逆位")
                                    .font(.system(size: 9, weight: .bold))
                                    .foregroundStyle(placed.drawnCard.orientation == .upright ? Color.green : Color.red)
                            }
                        }
                    }
                    .frame(width: 72, height: 120)
                    .overlay(
                        RoundedRectangle(cornerRadius: 8)
                            .strokeBorder(TarotTheme.kintsugiGold.opacity(0.4), lineWidth: 1)
                    )

                    VStack(alignment: .leading, spacing: 6) {
                        Text(currentCardInfo.nameZh)
                            .font(.system(size: 18, weight: .bold, design: .serif))
                            .foregroundStyle(Color.primary)

                        Text(currentCardInfo.nameEn)
                            .font(.system(size: 12, design: .serif))
                            .foregroundStyle(Color.secondary)

                        HStack(spacing: 6) {
                            Text(currentCardInfo.arcana.rawValue)
                                .font(.system(size: 10, weight: .medium))
                                .padding(.horizontal, 6)
                                .padding(.vertical, 2)
                                .background(Capsule().fill(TarotTheme.celestialPurple.opacity(0.18)))
                                .foregroundStyle(Color.primary)

                            Text(currentCardInfo.astrology)
                                .font(.system(size: 10, weight: .medium))
                                .padding(.horizontal, 6)
                                .padding(.vertical, 2)
                                .background(Capsule().fill(TarotTheme.kintsugiGold.opacity(0.15)))
                                .foregroundStyle(Color.primary)
                        }
                    }
                }

                // Keywords Chips
                VStack(alignment: .leading, spacing: 6) {
                    Text("核心意象关键词")
                        .font(.system(size: 12, weight: .bold))
                        .foregroundStyle(TarotTheme.kintsugiGold)

                    let keywords = (placed.drawnCard.orientation == .upright ? currentCardInfo.keywordsUpright : currentCardInfo.keywordsReversed)
                    FlowLayout(spacing: 6) {
                        ForEach(keywords, id: \.self) { kw in
                            Text(kw)
                                .font(.system(size: 11))
                                .padding(.horizontal, 8)
                                .padding(.vertical, 3)
                                .background(Capsule().fill(Color.primary.opacity(0.06)))
                                .foregroundStyle(Color.primary)
                        }
                    }
                }

                // Archetypal Meaning
                VStack(alignment: .leading, spacing: 6) {
                    Text("原型深层阐释")
                        .font(.system(size: 12, weight: .bold))
                        .foregroundStyle(TarotTheme.kintsugiGold)

                    Text(placed.drawnCard.orientation == .upright ? currentCardInfo.meaningUpright : currentCardInfo.meaningReversed)
                        .font(.system(size: 13))
                        .foregroundStyle(Color.primary.opacity(0.85))
                        .lineSpacing(4)
                }
            } else {
                Text("请在左侧点击选定任一卡牌以查看单牌全息精解。")
                    .font(.system(size: 13))
                    .foregroundStyle(.secondary)
            }
        }
    }

    // ─── 2. Elemental Dignities Section ───
    private var elementDignitiesSection: some View {
        VStack(alignment: .leading, spacing: 14) {
            if let session = session {
                let summary = session.dignitySummary

                VStack(alignment: .leading, spacing: 8) {
                    Text("主导能量: \(String(describing: summary.dominantElement))")
                        .font(.system(size: 15, weight: .bold))
                        .foregroundStyle(TarotTheme.kintsugiGold)

                    Text(summary.balanceDescriptionZh)
                        .font(.system(size: 12))
                        .foregroundStyle(Color.primary.opacity(0.85))
                        .lineSpacing(3)
                }
                .padding(12)
                .background(RoundedRectangle(cornerRadius: 10).fill(Color.primary.opacity(0.04)))

                // Elemental Ratios Bars
                VStack(spacing: 10) {
                    elementProgressBar(title: "火元素 (行动意志)", ratio: summary.fireRatio, color: Color(red: 0.95, green: 0.35, blue: 0.25), icon: "flame.fill")
                    elementProgressBar(title: "水元素 (情感潜意识)", ratio: summary.waterRatio, color: Color(red: 0.25, green: 0.60, blue: 0.95), icon: "drop.fill")
                    elementProgressBar(title: "风元素 (逻辑认知)", ratio: summary.airRatio, color: Color(red: 0.85, green: 0.75, blue: 0.30), icon: "wind")
                    elementProgressBar(title: "土元素 (物质显化)", ratio: summary.earthRatio, color: Color(red: 0.35, green: 0.75, blue: 0.45), icon: "mountain.2.fill")
                }
            } else {
                Text("推演完成后将在此呈现四元素尊位比率与能量平衡分析。")
                    .font(.system(size: 13))
                    .foregroundStyle(.secondary)
            }
        }
    }

    private func elementProgressBar(title: String, ratio: Float, color: Color, icon: String) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Image(systemName: icon)
                    .font(.system(size: 11))
                    .foregroundStyle(color)
                Text(title)
                    .font(.system(size: 11, weight: .medium))
                    .foregroundStyle(Color.primary.opacity(0.9))
                Spacer()
                Text("\(Int(ratio * 100))%")
                    .font(.system(size: 11, weight: .bold, design: .monospaced))
                    .foregroundStyle(color)
            }

            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    Capsule().fill(Color.primary.opacity(0.08))
                    Capsule().fill(color).frame(width: geo.size.width * CGFloat(ratio))
                }
            }
            .frame(height: 6)
        }
    }

    // ─── 3. AI Oracle Section ───
    private var aiOracleSection: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("神谕心流 · 荣格原型深度析读")
                .font(.system(size: 13, weight: .bold))
                .foregroundStyle(TarotTheme.kintsugiGold)

            if let session = session {
                VStack(alignment: .leading, spacing: 8) {
                    Text("议题: \(session.question ?? "日常全息省思")")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundStyle(Color.primary)

                    Text("当前牌阵呈现出清晰的原型演进图景。核心能量正由潜意识向显意识阶段迁移，建议在行动中保持对内在阴影的观照与整合。")
                        .font(.system(size: 12))
                        .foregroundStyle(Color.primary.opacity(0.85))
                        .lineSpacing(4)
                }
                .padding(12)
                .background(RoundedRectangle(cornerRadius: 10).fill(Color.primary.opacity(0.04)))

                // Chat Input Field
                HStack {
                    TextField("向神谕提问追问深层指引...", text: $chatQuery)
                        .textFieldStyle(.plain)
                        .font(.system(size: 12))
                        .foregroundStyle(Color.primary)

                    Button {
                        if !chatQuery.isEmpty {
                            chatMessages.append(ChatMessageItem(role: "user", content: chatQuery))
                            chatQuery = ""
                        }
                    } label: {
                        Image(systemName: "arrow.up.circle.fill")
                            .font(.system(size: 18))
                            .foregroundStyle(TarotTheme.kintsugiGold)
                    }
                    .buttonStyle(.plain)
                }
                .padding(10)
                .background(Color.primary.opacity(0.05))
                .clipShape(RoundedRectangle(cornerRadius: 8))

                // Chat Messages History
                ForEach(chatMessages) { msg in
                    HStack {
                        if msg.role == "user" { Spacer() }
                        Text(msg.content)
                            .font(.system(size: 12))
                            .padding(8)
                            .background(RoundedRectangle(cornerRadius: 8).fill(msg.role == "user" ? TarotTheme.celestialPurple.opacity(0.25) : Color.primary.opacity(0.05)))
                            .foregroundStyle(Color.primary)
                        if msg.role != "user" { Spacer() }
                    }
                }
            } else {
                Text("请先启动推演仪式以开启神谕心流与深度对话。")
                    .font(.system(size: 13))
                    .foregroundStyle(.secondary)
            }
        }
    }
}

// Minimal FlowLayout for tags
struct FlowLayout: Layout {
    var spacing: CGFloat = 6

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let width = proposal.width ?? 300
        var height: CGFloat = 0
        var x: CGFloat = 0
        var rowHeight: CGFloat = 0

        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)
            if x + size.width > width {
                x = 0
                height += rowHeight + spacing
                rowHeight = 0
            }
            x += size.width + spacing
            rowHeight = max(rowHeight, size.height)
        }
        height += rowHeight
        return CGSize(width: width, height: height)
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        var x = bounds.minX
        var y = bounds.minY
        var rowHeight: CGFloat = 0

        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)
            if x + size.width > bounds.maxX {
                x = bounds.minX
                y += rowHeight + spacing
                rowHeight = 0
            }
            subview.place(at: CGPoint(x: x, y: y), proposal: ProposedViewSize(size))
            x += size.width + spacing
            rowHeight = max(rowHeight, size.height)
        }
    }
}
