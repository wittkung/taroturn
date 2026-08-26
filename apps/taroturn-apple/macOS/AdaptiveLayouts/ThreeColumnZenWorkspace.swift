// ThreeColumnZenWorkspace.swift - 1:1 High-Aesthetic Native Tarot Sanctuary Workspace (TTZip Architecture)
import SwiftUI
import TaroturnCore
import TaroturnShared

public struct ThreeColumnZenWorkspace: View {
    @Environment(\.colorScheme) private var systemColorScheme
    @AppStorage("appThemeMode") private var appThemeMode: AppThemeMode = .system

    @State private var activeTab: TarotWorkspaceTab = .divination
    @State private var viewModel = ReadingViewModel()
    @State private var isDrawerOpen: Bool = false
    @State private var isDiagnosticsOpen: Bool = false
    @State private var allowReversals: Bool = true
    @State private var isPro: Bool = true

    public init() {}

    private var isDarkEffective: Bool {
        switch appThemeMode {
        case .system: return systemColorScheme == .dark
        case .light: return false
        case .dark: return true
        }
    }

    private var unrevealedCount: Int {
        if let session = viewModel.activeSession {
            return session.placedCards.count - viewModel.flippedCardIds.count
        }
        return 0
    }

    public var body: some View {
        ZStack {
            // ─── 0. Behind-Window Native Translucency & Vibrancy (TTZip glassmorphic architecture) ───
            VisualEffectView(material: .underWindowBackground, blendingMode: .behindWindow, state: .active)
                .ignoresSafeArea()

            // ─── 1. GPU Hardware-Accelerated Dynamic Fluid Swirls ───
            MetalFluidBackgroundView(
                baseColor: Color(red: 0.54, green: 0.18, blue: 0.90),
                isRunning: viewModel.isShuffling,
                isDarkMode: isDarkEffective,
                fluidOpacity: isDarkEffective ? 0.35 : 0.15
            )
            .ignoresSafeArea()
            .allowsHitTesting(false)

            // ─── 2. TTZip 3-Column / Native Sidebar Workspace Layout ───
            HStack(spacing: 0) {
                // 2.1 Fixed Native Zen Sidebar
                ZenSidebarNavView(
                    activeTab: $activeTab,
                    isPro: isPro,
                    onTogglePro: { isPro.toggle() }
                )

                // 2.2 Main Workspace Container (Header + Active Tab Content)
                VStack(spacing: 0) {
                    // Unified 52pt Header Bar
                    HeaderBarView(
                        activeTab: activeTab,
                        selectedSpreadId: viewModel.selectedSpreadId,
                        onSelectSpread: { newSpreadId in
                            viewModel.selectedSpreadId = newSpreadId
                        },
                        themeMode: appThemeMode,
                        onCycleTheme: {
                            switch appThemeMode {
                            case .system: appThemeMode = .light
                            case .light: appThemeMode = .dark
                            case .dark: appThemeMode = .system
                            }
                        },
                        onToggleDrawer: {
                            withAnimation(.spring(response: 0.35, dampingFraction: 0.8)) {
                                isDrawerOpen.toggle()
                            }
                        },
                        isDrawerOpen: isDrawerOpen,
                        hasDrawnSession: viewModel.activeSession != nil,
                        isPro: isPro
                    )

                    // Error Toast HUD (if any)
                    if let err = viewModel.errorMessage {
                        HStack(spacing: 8) {
                            Image(systemName: "exclamationmark.triangle.fill")
                                .foregroundStyle(.yellow)
                            Text(err)
                                .font(.system(size: 12, weight: .medium))
                                .foregroundStyle(.white)
                            Spacer()
                            Button("查看微内核日志") {
                                isDiagnosticsOpen = true
                            }
                            .buttonStyle(.plain)
                            .font(.system(size: 11, weight: .bold))
                            .foregroundStyle(Color(red: 0.85, green: 0.70, blue: 0.30))
                        }
                        .padding(.horizontal, 16)
                        .padding(.vertical, 8)
                        .background(Color.red.opacity(0.85))
                        .clipShape(RoundedRectangle(cornerRadius: 8))
                        .padding(.horizontal, 24)
                        .padding(.top, 8)
                        .transition(.move(edge: .top).combined(with: .opacity))
                    }

                    // 2.3 Dynamic Workspace Tab Router
                    ZStack {
                        switch activeTab {
                        case .divination:
                            VStack(spacing: 0) {
                                // Interactive Topological Spread Matrix Canvas
                                TopologicalSpreadCanvasView(
                                    spreadId: viewModel.selectedSpreadId,
                                    session: viewModel.activeSession,
                                    revealedSlots: viewModel.flippedCardIds,
                                    selectedSlotIndex: Int(viewModel.selectedSlotId ?? 0),
                                    onSelectSlot: { idx in
                                        viewModel.selectSlot(slotId: UInt8(idx))
                                        withAnimation(.spring(response: 0.35, dampingFraction: 0.8)) {
                                            isDrawerOpen = true
                                        }
                                    },
                                    onFlipCard: { slotId in
                                        viewModel.flipCard(slotId: slotId)
                                    }
                                )
                                .frame(maxWidth: .infinity, maxHeight: .infinity)

                                // Floating Bottom Ritual Dock
                                RitualDockView(
                                    question: $viewModel.userQuestion,
                                    allowReversals: allowReversals,
                                    onToggleReversals: { allowReversals.toggle() },
                                    onShuffleAndDraw: {
                                        Task {
                                            await executeRitualDraw()
                                        }
                                    },
                                    isDrawing: viewModel.isShuffling,
                                    hasSession: viewModel.activeSession != nil,
                                    onRevealAll: { viewModel.flipAllCards() },
                                    unrevealedCount: unrevealedCount,
                                    rngSeed: viewModel.activeSession?.rngSeed
                                )
                            }

                        case .journal:
                            ReadingJournalView()

                        case .catalog:
                            CardDeckCatalogView()

                        case .profile:
                            SeekerProfileView()

                        case .settings:
                            SanctuarySettingsView()
                        }
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)

                // 2.4 Slide-in Right Reading Inspector Drawer (When in divination)
                if isDrawerOpen && activeTab == .divination {
                    ReadingDrawerView(
                        spreadId: viewModel.selectedSpreadId,
                        session: viewModel.activeSession,
                        selectedSlotIndex: Int(viewModel.selectedSlotId ?? 0),
                        onSelectSlot: { idx in
                            viewModel.selectSlot(slotId: UInt8(idx))
                        },
                        onClose: {
                            withAnimation(.spring(response: 0.35, dampingFraction: 0.8)) {
                                isDrawerOpen = false
                            }
                        }
                    )
                    .transition(.move(edge: .trailing).combined(with: .opacity))
                }
            }
        }
        .ignoresSafeArea()
        .sheet(isPresented: $isDiagnosticsOpen) { SystemDiagnosticsSheet() }
        .preferredColorScheme(appThemeMode.colorScheme)
    }

    private func executeRitualDraw() async {
        await viewModel.performReading()

        // Staggered sequential card flip sweep
        if let session = viewModel.activeSession {
            for card in session.placedCards {
                try? await Task.sleep(nanoseconds: 180_000_000)
                viewModel.flipCard(slotId: card.slotId)
            }
        }
    }
}
