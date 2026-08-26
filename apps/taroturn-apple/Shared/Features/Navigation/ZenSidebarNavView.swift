// ZenSidebarNavView.swift - TTZip Design System Compliant Native Sidebar Navigation
import SwiftUI

public struct ZenSidebarNavView: View {
    @Binding public var activeTab: TarotWorkspaceTab
    public let isPro: Bool
    public let onTogglePro: () -> Void

    @AppStorage("seekerName") private var seekerName: String = "探求者"
    @AppStorage("seekerBirthdate") private var seekerBirthdate: String = "1998-08-08"

    public init(
        activeTab: Binding<TarotWorkspaceTab>,
        isPro: Bool = true,
        onTogglePro: @escaping () -> Void = {}
    ) {
        self._activeTab = activeTab
        self.isPro = isPro
        self.onTogglePro = onTogglePro
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // ─── 1. Brand & Header (WSJ Typography + Kintsugi Gold) ───
            HStack(spacing: 10) {
                ZStack {
                    RoundedRectangle(cornerRadius: 10, style: .continuous)
                        .fill(TarotTheme.celestialPurple.opacity(0.18))
                        .overlay(
                            RoundedRectangle(cornerRadius: 10, style: .continuous)
                                .strokeBorder(TarotTheme.kintsugiGold.opacity(0.4), lineWidth: 1)
                        )
                        .frame(width: 32, height: 32)

                    Image(systemName: "sparkles")
                        .font(.system(size: 14, weight: .bold))
                        .foregroundStyle(TarotTheme.kintsugiGold)
                }

                VStack(alignment: .leading, spacing: 1) {
                    Text("TAROTURN")
                        .font(.system(size: 14, weight: .bold, design: .serif))
                        .tracking(3)
                        .foregroundStyle(
                            LinearGradient(
                                colors: [TarotTheme.kintsugiGold, TarotTheme.celestialPurple],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )

                    Text("ZEN ARCANUM v1.2")
                        .font(.system(size: 9, weight: .semibold, design: .monospaced))
                        .tracking(0.8)
                        .foregroundStyle(.secondary)
                }
            }
            .padding(.horizontal, 16)
            .padding(.top, 18)
            .padding(.bottom, 16)

            Divider()
                .background(TarotTheme.headerHairline)
                .padding(.horizontal, 12)

            // ─── 2. Top-Level Tab Workspace Items with Keyboard Shortcuts (Cmd+1~5) ───
            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text("核心工作区")
                        .font(.system(size: 9, weight: .bold, design: .serif))
                        .tracking(1.5)
                        .foregroundStyle(TarotTheme.kintsugiGold)

                    Spacer()

                    Text("WORKSPACES")
                        .font(.system(size: 8, weight: .medium, design: .monospaced))
                        .foregroundStyle(.secondary.opacity(0.7))
                }
                .padding(.horizontal, 16)
                .padding(.top, 14)
                .padding(.bottom, 6)

                ForEach(Array(TarotWorkspaceTab.allCases.enumerated()), id: \.element.id) { index, tab in
                    let isSelected = tab == activeTab
                    Button {
                        withAnimation(.spring(response: 0.35, dampingFraction: 0.82)) {
                            activeTab = tab
                        }
                    } label: {
                        HStack(spacing: 10) {
                            Image(systemName: tab.iconName)
                                .font(.system(size: 13, weight: isSelected ? .bold : .regular))
                                .foregroundStyle(isSelected ? TarotTheme.kintsugiGold : Color.primary.opacity(0.65))
                                .frame(width: 20)

                            Text(tab.nameZh)
                                .font(.system(size: 12, weight: isSelected ? .bold : .medium, design: .serif))
                                .foregroundStyle(isSelected ? Color.primary : Color.primary.opacity(0.8))

                            Spacer()

                            if isSelected {
                                Circle()
                                    .fill(TarotTheme.kintsugiGold)
                                    .frame(width: 5, height: 5)
                            } else {
                                Text("⌘\(index + 1)")
                                    .font(.system(size: 9, design: .monospaced))
                                    .foregroundStyle(.secondary.opacity(0.4))
                            }
                        }
                        .padding(.horizontal, 12)
                        .padding(.vertical, 8)
                        .background(
                            RoundedRectangle(cornerRadius: 12, style: .continuous)
                                .fill(isSelected ? TarotTheme.kintsugiGold.opacity(0.12) : Color.clear)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                                        .strokeBorder(isSelected ? TarotTheme.kintsugiGold.opacity(0.35) : Color.clear, lineWidth: 0.8)
                                )
                        )
                    }
                    .buttonStyle(.plain)
                    .keyboardShortcut(KeyEquivalent(Character(UnicodeScalar(49 + index)!)), modifiers: .command)
                    .padding(.horizontal, 10)
                }
            }

            Spacer()

            // ─── 3. Bottom Footer (Active Seeker & Engine Telemetry) ───
            VStack(spacing: 8) {
                Divider()
                    .background(TarotTheme.headerHairline)
                    .padding(.horizontal, 12)

                // Current Seeker Archetype Card
                Button {
                    withAnimation(.spring(response: 0.35, dampingFraction: 0.82)) {
                        activeTab = .profile
                    }
                } label: {
                    HStack(spacing: 8) {
                        Circle()
                            .fill(TarotTheme.celestialPurple.opacity(0.2))
                            .overlay(
                                Image(systemName: "person.fill")
                                    .font(.system(size: 10))
                                    .foregroundStyle(TarotTheme.kintsugiGold)
                            )
                            .frame(width: 26, height: 26)

                        VStack(alignment: .leading, spacing: 1) {
                            Text(seekerName)
                                .font(.system(size: 11, weight: .bold, design: .serif))
                                .foregroundStyle(Color.primary)
                                .lineLimit(1)

                            Text("公历 \(seekerBirthdate)")
                                .font(.system(size: 9, design: .monospaced))
                                .foregroundStyle(.secondary)
                        }

                        Spacer()

                        Image(systemName: "chevron.right")
                            .font(.system(size: 9, weight: .bold))
                            .foregroundStyle(.secondary.opacity(0.6))
                    }
                    .padding(8)
                    .background(
                        RoundedRectangle(cornerRadius: 10, style: .continuous)
                            .fill(Color.primary.opacity(0.04))
                    )
                }
                .buttonStyle(.plain)
                .padding(.horizontal, 10)

                // Pro Badge & Core Indicator
                HStack {
                    Button(action: onTogglePro) {
                        HStack(spacing: 4) {
                            Image(systemName: "crown.fill")
                                .font(.system(size: 9))
                            Text(isPro ? "PRO 尊享" : "免费版")
                                .font(.system(size: 9, weight: .bold, design: .monospaced))
                        }
                        .foregroundStyle(TarotTheme.kintsugiGold)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(
                            Capsule()
                                .fill(TarotTheme.kintsugiGold.opacity(0.12))
                                .overlay(Capsule().strokeBorder(TarotTheme.kintsugiGold.opacity(0.35), lineWidth: 0.8))
                        )
                    }
                    .buttonStyle(.plain)

                    Spacer()

                    HStack(spacing: 4) {
                        Circle()
                            .fill(Color.green)
                            .frame(width: 5, height: 5)
                        Text("Core SSOT")
                            .font(.system(size: 9, weight: .medium, design: .monospaced))
                            .foregroundStyle(.secondary)
                    }
                }
                .padding(.horizontal, 14)
                .padding(.bottom, 12)
            }
        }
        .frame(width: 215)
        .background(VisualEffectView(material: .sidebar, blendingMode: .behindWindow, state: .active))
        .background(.ultraThinMaterial.opacity(0.6))
        .overlay(
            Rectangle()
                .frame(width: 1)
                .foregroundStyle(TarotTheme.headerHairline),
            alignment: .trailing
        )
    }
}
