// SettingsSheet.swift - Multi-Tabbed Glass Settings (ui-ux-pro-max + Sonoma Glass Standard)
import SwiftUI

public struct SanctuarySettingsView: View {
    @AppStorage("appThemeMode") private var appThemeMode: AppThemeMode = .system
    @AppStorage("reversalProbability") private var reversalProb: Double = 0.5
    @AppStorage("enableFluidBackground") private var enableFluid: Bool = true
    @AppStorage("enableHaptics") private var enableHaptics: Bool = true
    @AppStorage("dealSpeedMs") private var dealSpeedMs: Double = 180

    @State private var activeTab: Int = 0

    public init() {}

    public var body: some View {
        VStack(spacing: 0) {
            // Tab Switcher
            Picker("", selection: $activeTab) {
                Text("外观与图形").tag(0)
                Text("仪式与流派").tag(1)
                Text("密码学与存储").tag(2)
            }
            .pickerStyle(.segmented)
            .padding(.horizontal, 28)
            .padding(.top, 16)
            .padding(.bottom, 12)

            Divider().background(Color.primary.opacity(0.08))

            // Content
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    if activeTab == 0 {
                        // Graphics & Appearance
                        VStack(alignment: .leading, spacing: 14) {
                            settingCard(title: "界面外观与色彩模式", description: "支持日间明亮模式、夜间幽冥模式或自动跟随 macOS 系统切换。") {
                                Picker("主题", selection: $appThemeMode) {
                                    ForEach(AppThemeMode.allCases) { mode in
                                        Label(mode.titleZh, systemImage: mode.iconName).tag(mode)
                                    }
                                }
                                .pickerStyle(.segmented)
                            }

                            toggleCard(title: "Metal GPU 动态流体背景", description: "启用 60FPS 硬件加速粒子流体，由 Apple Silicon Metal 渲染管线驱动。", isOn: $enableFluid)
                            toggleCard(title: "CoreHaptics 原生触觉反馈", description: "在洗牌、发牌与 3D 翻牌时提供沉浸式微米级震动反馈。", isOn: $enableHaptics)
                        }
                    } else if activeTab == 1 {
                        // Ritual & Traditions
                        VStack(alignment: .leading, spacing: 14) {
                            settingCard(title: "逆位出现概率 (\(Int(reversalProb * 100))%)", description: "控制洗牌算法中卡牌以逆位朝向被抽出的数学概率。") {
                                Slider(value: $reversalProb, in: 0...1, step: 0.05)
                            }

                            settingCard(title: "发牌平滑间隔 (\(Int(dealSpeedMs)) ms)", description: "控制仪式发牌时连续逐级翻转的时间阶梯。") {
                                Slider(value: $dealSpeedMs, in: 80...400, step: 20)
                            }
                        }
                    } else {
                        // Cryptography & Storage
                        VStack(alignment: .leading, spacing: 14) {
                            infoRow(title: "密码学随机数内核", value: "ChaCha20 (256-bit CSPRNG)", note: "所有洗牌序列均具有密码学抗碰撞与可重放证明。")
                            infoRow(title: "本地持久化引擎", value: "SwiftData + Local SQLite", note: "数据完全驻留本机，严守隐私边界。")
                            infoRow(title: "Rust 微内核架构", value: "taroturn-core (UniFFI v0.28)", note: "纯 Rust 编写的零依赖跨平台神谕计算算法。")
                        }
                    }
                }
                .padding(24)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    private func settingCard<Content: View>(title: String, description: String, @ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title)
                .font(.system(size: 13, weight: .bold))
                .foregroundStyle(Color.primary)
            Text(description)
                .font(.system(size: 11))
                .foregroundStyle(Color.secondary)
            content()
                .padding(.top, 4)
        }
        .padding(14)
        .background(Color.primary.opacity(0.04))
        .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: 10, style: .continuous).strokeBorder(Color.primary.opacity(0.08), lineWidth: 0.8))
    }

    private func toggleCard(title: String, description: String, isOn: Binding<Bool>) -> some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.system(size: 13, weight: .bold))
                    .foregroundStyle(Color.primary)
                Text(description)
                    .font(.system(size: 11))
                    .foregroundStyle(Color.secondary)
            }
            Spacer()
            Toggle("", isOn: isOn)
                .toggleStyle(.switch)
        }
        .padding(14)
        .background(Color.primary.opacity(0.04))
        .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: 10, style: .continuous).strokeBorder(Color.primary.opacity(0.08), lineWidth: 0.8))
    }

    private func infoRow(title: String, value: String, note: String) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Text(title)
                    .font(.system(size: 13, weight: .bold))
                    .foregroundStyle(Color.primary)
                Spacer()
                Text(value)
                    .font(.system(size: 12, design: .monospaced))
                    .foregroundStyle(TarotTheme.kintsugiGold)
            }
            Text(note)
                .font(.system(size: 11))
                .foregroundStyle(Color.secondary)
        }
        .padding(14)
        .background(Color.primary.opacity(0.04))
        .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: 10, style: .continuous).strokeBorder(Color.primary.opacity(0.08), lineWidth: 0.8))
    }
}

public struct SettingsSheet: View {
    @Environment(\.dismiss) private var dismiss

    public init() {}

    public var body: some View {
        NavigationStack {
            SanctuarySettingsView()
                .background(VisualEffectView(material: .underWindowBackground, blendingMode: .behindWindow, state: .active))
                .background(.ultraThinMaterial)
                .navigationTitle("系统设置")
                .toolbar {
                    ToolbarItem(placement: .confirmationAction) {
                        Button("完成") { dismiss() }
                    }
                }
        }
        .frame(minWidth: 560, minHeight: 440)
    }
}
