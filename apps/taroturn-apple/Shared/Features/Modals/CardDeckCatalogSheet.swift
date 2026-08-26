// CardDeckCatalogSheet.swift - 78-Card Full Arcana Museum Gallery (ui-ux-pro-max + TTZip Standard)
import SwiftUI
import TaroturnCore

public struct CardDeckCatalogView: View {
    @State private var selectedArcana: TarotArcana = .major
    @State private var searchText: String = ""
    @State private var inspectingCard: TarotCardInfo?

    public init() {}

    private var filteredCards: [TarotCardInfo] {
        TarotCatalog.allCards.filter { card in
            (selectedArcana == card.arcana) &&
            (searchText.isEmpty || card.nameZh.contains(searchText) || card.nameEn.localizedCaseInsensitiveContains(searchText))
        }
    }

    public var body: some View {
        VStack(spacing: 16) {
            // ─── Header Glass Controls ───
            HStack(spacing: 16) {
                // Segmented Arcana Filter
                Picker("Arcana", selection: $selectedArcana) {
                    ForEach(TarotArcana.allCases, id: \.self) { arcana in
                        Text(arcana.rawValue).tag(arcana)
                    }
                }
                .pickerStyle(.segmented)
                .frame(maxWidth: 520)

                Spacer()

                // Search Bar
                HStack(spacing: 8) {
                    Image(systemName: "magnifyingglass")
                        .foregroundStyle(TarotTheme.kintsugiGold)
                    TextField("搜索 78 张塔罗原典...", text: $searchText)
                        .textFieldStyle(.plain)
                        .font(.system(size: 12))
                        .foregroundStyle(Color.primary)

                    if !searchText.isEmpty {
                        Button {
                            searchText = ""
                        } label: {
                            Image(systemName: "xmark.circle.fill")
                                .foregroundStyle(.secondary)
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding(.horizontal, 10)
                .padding(.vertical, 6)
                .background(Color.primary.opacity(0.05))
                .clipShape(Capsule())
                .overlay(Capsule().strokeBorder(TarotTheme.kintsugiGold.opacity(0.3), lineWidth: 0.8))
                .frame(width: 240)
            }
            .padding(.horizontal, 24)
            .padding(.top, 16)

            // ─── Grid View of Cards ───
            ScrollView {
                LazyVGrid(columns: [GridItem(.adaptive(minimum: 140, maximum: 175), spacing: 20)], spacing: 24) {
                    ForEach(filteredCards) { card in
                        Button {
                            inspectingCard = card
                        } label: {
                            CardThumbnailTile(card: card)
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding(.horizontal, 24)
                .padding(.vertical, 16)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .sheet(item: $inspectingCard) { card in
            CardDetailInspectorSheet(card: card)
        }
    }
}

public struct CardDeckCatalogSheet: View {
    @Environment(\.dismiss) private var dismiss

    public init() {}

    public var body: some View {
        NavigationStack {
            CardDeckCatalogView()
                .background(VisualEffectView(material: .underWindowBackground, blendingMode: .behindWindow, state: .active))
                .background(.ultraThinMaterial)
                .navigationTitle("78 张塔罗原典全图谱 · 典籍画廊")
                .toolbar {
                    ToolbarItem(placement: .confirmationAction) {
                        Button("完成") { dismiss() }
                            .keyboardShortcut(.defaultAction)
                    }
                }
        }
        .frame(minWidth: 840, minHeight: 640)
    }
}

// ─── Subcomponent: Card Thumbnail Tile ───
public struct CardThumbnailTile: View {
    public let card: TarotCardInfo

    public init(card: TarotCardInfo) {
        self.card = card
    }

    public var body: some View {
        VStack(spacing: 8) {
            // Card Image
            ZStack {
                RoundedRectangle(cornerRadius: 10, style: .continuous)
                    .fill(Color.black)
                    .aspectRatio(1/1.7, contentMode: .fit)
                    .overlay(
                        RoundedRectangle(cornerRadius: 10, style: .continuous)
                            .strokeBorder(TarotTheme.kintsugiGold.opacity(0.35), lineWidth: 1)
                    )
                    .shadow(color: Color.black.opacity(0.2), radius: 6, x: 0, y: 3)

                if let img = TarotImageLoader.image(named: card.imageFileName) {
                    img
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                        .clipShape(RoundedRectangle(cornerRadius: 9, style: .continuous))
                } else {
                    VStack(spacing: 4) {
                        Image(systemName: "sparkles")
                            .font(.system(size: 20))
                            .foregroundStyle(TarotTheme.kintsugiGold)
                        Text(card.nameZh)
                            .font(.system(size: 11, weight: .bold))
                            .foregroundStyle(Color.white)
                    }
                }
            }

            // Typography Meta
            VStack(spacing: 2) {
                HStack(spacing: 4) {
                    Text(card.nameZh)
                        .font(.system(size: 12, weight: .bold, design: .serif))
                        .foregroundStyle(Color.primary)

                    Text(card.element.symbol)
                        .font(.system(size: 10))
                }

                Text(card.nameEn)
                    .font(.system(size: 10, weight: .medium, design: .serif))
                    .foregroundStyle(.secondary)
                    .lineLimit(1)
            }
        }
        .padding(8)
        .background(
            RoundedRectangle(cornerRadius: 14, style: .continuous)
                .fill(Color.primary.opacity(0.03))
                .overlay(
                    RoundedRectangle(cornerRadius: 14, style: .continuous)
                        .strokeBorder(Color.primary.opacity(0.06), lineWidth: 0.8)
                )
        )
    }
}
