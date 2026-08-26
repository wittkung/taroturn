// HeaderBarView.swift - Glassmorphic Header Navigation Bar (TTZip Design System Standard)
import SwiftUI

public struct HeaderBarView: View {
    public let activeTab: TarotWorkspaceTab
    public let selectedSpreadId: String
    public let onSelectSpread: (String) -> Void
    public let themeMode: AppThemeMode
    public let onCycleTheme: () -> Void
    public let onToggleDrawer: () -> Void
    public let isDrawerOpen: Bool
    public let hasDrawnSession: Bool
    public let isPro: Bool

    @State private var isSpreadPopoverOpen: Bool = false

    public init(
        activeTab: TarotWorkspaceTab,
        selectedSpreadId: String,
        onSelectSpread: @escaping (String) -> Void,
        themeMode: AppThemeMode,
        onCycleTheme: @escaping () -> Void,
        onToggleDrawer: @escaping () -> Void,
        isDrawerOpen: Bool,
        hasDrawnSession: Bool = false,
        isPro: Bool = true
    ) {
        self.activeTab = activeTab
        self.selectedSpreadId = selectedSpreadId
        self.onSelectSpread = onSelectSpread
        self.themeMode = themeMode
        self.onCycleTheme = onCycleTheme
        self.onToggleDrawer = onToggleDrawer
        self.isDrawerOpen = isDrawerOpen
        self.hasDrawnSession = hasDrawnSession
        self.isPro = isPro
    }

    private var currentSpread: ChineseSpreadMeta {
        ChineseSpreadCatalog.getSpread(by: selectedSpreadId)
    }

    public var body: some View {
        HStack(spacing: 16) {
            // ─── Left: Tab Section Title & Spread Selector ───
            HStack(spacing: 14) {
                VStack(alignment: .leading, spacing: 1) {
                    Text(activeTab.sectionCode)
                        .font(.system(size: 9, weight: .bold, design: .monospaced))
                        .tracking(1.8)
                        .foregroundStyle(TarotTheme.kintsugiGold)

                    HStack(spacing: 6) {
                        Text(activeTab.nameZh)
                            .font(.system(size: 15, weight: .bold, design: .serif))
                            .foregroundStyle(Color.primary)

                        Text(activeTab.nameEn)
                            .font(.system(size: 10, weight: .regular, design: .serif))
                            .foregroundStyle(.secondary)
                    }
                }

                // If on Divination Tab: Show Spread Selector Capsule
                if activeTab == .divination {
                    Divider()
                        .frame(height: 16)
                        .background(Color.primary.opacity(0.15))

                    Button {
                        isSpreadPopoverOpen.toggle()
                    } label: {
                        HStack(spacing: 6) {
                            Text(currentSpread.nameZh)
                                .font(.system(size: 12, weight: .semibold))
                                .foregroundStyle(Color.primary)

                            Text("(\(currentSpread.cardCount)张)")
                                .font(.system(size: 10, design: .monospaced))
                                .foregroundStyle(TarotTheme.kintsugiGold)

                            Image(systemName: "chevron.down")
                                .font(.system(size: 9, weight: .bold))
                                .foregroundStyle(Color.secondary)
                                .rotationEffect(.degrees(isSpreadPopoverOpen ? 180 : 0))
                        }
                        .padding(.horizontal, 12)
                        .padding(.vertical, 5)
                        .background(
                            Capsule()
                                .fill(Color.primary.opacity(0.06))
                                .overlay(
                                    Capsule().strokeBorder(TarotTheme.kintsugiGold.opacity(0.35), lineWidth: 0.8)
                                )
                        )
                    }
                    .buttonStyle(.plain)
                    .popover(isPresented: $isSpreadPopoverOpen, arrowEdge: .bottom) {
                        spreadCatalogPopover
                    }
                }
            }

            Spacer()

            // ─── Right: Actions & Status ───
            HStack(spacing: 10) {
                // If has active session: Highlight Reading Drawer Button
                if hasDrawnSession && activeTab == .divination {
                    Button(action: onToggleDrawer) {
                        HStack(spacing: 5) {
                            Image(systemName: "book.pages")
                                .font(.system(size: 11, weight: .bold))
                            Text("全景推演抽屉")
                                .font(.system(size: 11, weight: .bold, design: .serif))
                        }
                        .foregroundStyle(TarotTheme.kintsugiGold)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 5)
                        .background(
                            Capsule()
                                .fill(TarotTheme.celestialPurple.opacity(0.18))
                                .overlay(Capsule().strokeBorder(TarotTheme.kintsugiGold.opacity(0.4), lineWidth: 0.8))
                        )
                    }
                    .buttonStyle(.plain)
                }

                // Theme Mode Switcher
                Button(action: onCycleTheme) {
                    Image(systemName: themeMode.iconName)
                        .font(.system(size: 13))
                        .foregroundStyle(themeMode == .light ? Color.orange : (themeMode == .dark ? Color.purple : TarotTheme.kintsugiGold))
                        .padding(8)
                        .background(Circle().fill(Color.primary.opacity(0.06)))
                }
                .buttonStyle(.plain)
                .help("切换外观主题: 当前为 [\(themeMode.titleZh)] (点击切换)")

                // Pro Status Badge
                HStack(spacing: 4) {
                    Image(systemName: "crown.fill")
                        .font(.system(size: 10))
                    Text(isPro ? "PRO 尊享" : "免费版")
                        .font(.system(size: 10, weight: .bold, design: .monospaced))
                }
                .foregroundStyle(TarotTheme.kintsugiGold)
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background(
                    Capsule().fill(TarotTheme.kintsugiGold.opacity(0.12))
                        .overlay(Capsule().strokeBorder(TarotTheme.kintsugiGold.opacity(0.35), lineWidth: 0.8))
                )

                // Drawer Toggle Button (only when in divination)
                if activeTab == .divination {
                    Button(action: onToggleDrawer) {
                        Image(systemName: isDrawerOpen ? "sidebar.right" : "sparkles")
                            .font(.system(size: 13))
                            .foregroundStyle(isDrawerOpen ? TarotTheme.kintsugiGold : Color.primary)
                            .padding(8)
                            .background(
                                Circle().fill(isDrawerOpen ? TarotTheme.kintsugiGold.opacity(0.15) : Color.primary.opacity(0.06))
                            )
                    }
                    .buttonStyle(.plain)
                }
            }
        }
        .padding(.horizontal, 20)
        .frame(height: 52)
        .background(Color.clear)
        .overlay(
            Rectangle()
                .frame(height: 1.5)
                .foregroundStyle(TarotTheme.kintsugiGold.opacity(0.35)),
            alignment: .bottom
        )
    }

    // ─── Spread Catalog Popover Grid ───
    private var spreadCatalogPopover: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("圣所牌阵图谱 · 架构与用途解析")
                    .font(.system(size: 13, weight: .bold, design: .serif))
                    .foregroundStyle(TarotTheme.kintsugiGold)
                Spacer()
                Text("共 \(ChineseSpreadCatalog.allSpreads.count) 款牌阵")
                    .font(.system(size: 10, design: .monospaced))
                    .foregroundStyle(.secondary)
            }
            .padding(.bottom, 4)

            ScrollView {
                VStack(spacing: 8) {
                    ForEach(ChineseSpreadCatalog.allSpreads) { sp in
                        let isSelected = sp.id == selectedSpreadId
                        Button {
                            onSelectSpread(sp.id)
                            isSpreadPopoverOpen = false
                        } label: {
                            HStack(alignment: .top, spacing: 12) {
                                VStack(alignment: .leading, spacing: 4) {
                                    HStack(spacing: 8) {
                                        Text(sp.nameZh)
                                            .font(.system(size: 13, weight: .bold))
                                            .foregroundStyle(isSelected ? TarotTheme.kintsugiGold : Color.primary)

                                        Text(sp.category)
                                            .font(.system(size: 9, weight: .medium))
                                            .padding(.horizontal, 6)
                                            .padding(.vertical, 2)
                                            .background(Capsule().fill(TarotTheme.celestialPurple.opacity(0.18)))
                                            .foregroundStyle(Color.primary.opacity(0.85))

                                        Spacer()

                                        Text("\(sp.cardCount) 张牌")
                                            .font(.system(size: 11, weight: .bold, design: .monospaced))
                                            .foregroundStyle(TarotTheme.kintsugiGold)
                                    }

                                    Text(sp.purpose)
                                        .font(.system(size: 11))
                                        .foregroundStyle(.secondary)
                                        .lineLimit(2)
                                }
                            }
                            .padding(10)
                            .background(
                                RoundedRectangle(cornerRadius: 10)
                                    .fill(isSelected ? TarotTheme.kintsugiGold.opacity(0.12) : Color.primary.opacity(0.04))
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 10)
                                            .strokeBorder(isSelected ? TarotTheme.kintsugiGold : Color.clear, lineWidth: 1)
                                    )
                            )
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
            .frame(maxHeight: 380)
        }
        .padding(16)
        .frame(width: 440)
        .background(VisualEffectView(material: .popover, blendingMode: .behindWindow, state: .active))
        .background(.ultraThinMaterial)
    }
}
