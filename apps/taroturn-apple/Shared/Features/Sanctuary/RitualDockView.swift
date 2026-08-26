// RitualDockView.swift - Bottom Floating Ritual Capsule Dock (1:1 Web Dock Alignment)
import SwiftUI

public struct RitualDockView: View {
    @Binding public var question: String
    public var allowReversals: Bool
    public var onToggleReversals: () -> Void
    public var onShuffleAndDraw: () -> Void
    public var isDrawing: Bool
    public var hasSession: Bool
    public var onRevealAll: () -> Void
    public var unrevealedCount: Int
    public var rngSeed: String?

    public init(
        question: Binding<String>,
        allowReversals: Bool,
        onToggleReversals: @escaping () -> Void,
        onShuffleAndDraw: @escaping () -> Void,
        isDrawing: Bool,
        hasSession: Bool,
        onRevealAll: @escaping () -> Void,
        unrevealedCount: Int,
        rngSeed: String?
    ) {
        self._question = question
        self.allowReversals = allowReversals
        self.onToggleReversals = onToggleReversals
        self.onShuffleAndDraw = onShuffleAndDraw
        self.isDrawing = isDrawing
        self.hasSession = hasSession
        self.onRevealAll = onRevealAll
        self.unrevealedCount = unrevealedCount
        self.rngSeed = rngSeed
    }

    public var body: some View {
        VStack(spacing: 8) {
            // Floating Island Capsule
            HStack(spacing: 12) {
                // Intention Input Field
                HStack(spacing: 6) {
                    Text("INTENTION //")
                        .font(.system(size: 10, weight: .bold, design: .serif))
                        .foregroundStyle(TarotTheme.kintsugiGold)
                        .fixedSize()

                    TextField("输入您心中的议题、深层心绪或探索愿景...", text: $question)
                        .textFieldStyle(.plain)
                        .font(.system(size: 13))
                        .foregroundStyle(Color.primary)
                }
                .padding(.horizontal, 12)
                .padding(.vertical, 8)
                .background(Color.primary.opacity(0.05))
                .clipShape(Capsule())

                // Tradition Switcher (RWS vs Marseille)
                Button(action: onToggleReversals) {
                    HStack(spacing: 5) {
                        Image(systemName: "safari")
                            .font(.system(size: 11))
                            .foregroundStyle(TarotTheme.kintsugiGold)
                        Text(allowReversals ? "经典正逆位 (RWS)" : "全正位流派 (马赛)")
                            .font(.system(size: 11, weight: .medium))
                            .foregroundStyle(Color.primary.opacity(0.9))
                    }
                    .padding(.horizontal, 10)
                    .padding(.vertical, 8)
                    .background(Color.primary.opacity(0.06))
                    .clipShape(Capsule())
                    .overlay(
                        Capsule().strokeBorder(TarotTheme.kintsugiGold.opacity(0.35), lineWidth: 0.8)
                    )
                }
                .buttonStyle(.plain)
                .help("点击切换推演流派（经典正逆位 vs 马赛全正位）")

                // Reveal All Remaining Cards Button
                if hasSession && unrevealedCount > 0 {
                    Button(action: onRevealAll) {
                        HStack(spacing: 5) {
                            Image(systemName: "eye.fill")
                                .font(.system(size: 11))
                            Text("揭示余牌 (\(unrevealedCount))")
                                .font(.system(size: 11, weight: .bold))
                        }
                        .foregroundStyle(TarotTheme.kintsugiGold)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 8)
                        .background(TarotTheme.celestialPurple.opacity(0.25))
                        .clipShape(Capsule())
                        .overlay(
                            Capsule().strokeBorder(TarotTheme.kintsugiGold.opacity(0.5), lineWidth: 1)
                        )
                    }
                    .buttonStyle(.plain)
                }

                // Primary Shuffling & Dealing Action Button
                Button(action: onShuffleAndDraw) {
                    HStack(spacing: 6) {
                        Image(systemName: "arrow.triangle.2.circlepath")
                            .font(.system(size: 12, weight: .bold))
                            .rotationEffect(.degrees(isDrawing ? 360 : 0))
                            .animation(isDrawing ? .linear(duration: 1).repeatForever(autoreverses: false) : .default, value: isDrawing)

                        Text(hasSession ? "重新洗牌 (↵)" : "开始密码学抽牌 (↵)")
                            .font(.system(size: 13, weight: .bold))
                    }
                    .foregroundStyle(.white)
                    .padding(.horizontal, 18)
                    .padding(.vertical, 9)
                    .background(
                        LinearGradient(
                            colors: [Color(red: 0.65, green: 0.25, blue: 0.95), Color(red: 0.45, green: 0.15, blue: 0.85), Color(red: 0.85, green: 0.65, blue: 0.25)],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                    .clipShape(Capsule())
                    .shadow(color: Color.purple.opacity(0.4), radius: 8, y: 2)
                }
                .buttonStyle(.plain)
                .disabled(isDrawing)
                .keyboardShortcut(.return, modifiers: [])
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 8)
            .background(VisualEffectView(material: .hudWindow, blendingMode: .behindWindow, state: .active))
            .background(.ultraThinMaterial)
            .clipShape(Capsule())
            .overlay(
                Capsule().strokeBorder(TarotTheme.kintsugiGold.opacity(0.3), lineWidth: 0.8)
            )
            .shadow(color: Color.black.opacity(0.2), radius: 14, y: 4)
            .frame(maxWidth: 860)

            // Subtle Entropy Seed Footnote
            if let seed = rngSeed {
                HStack(spacing: 6) {
                    Image(systemName: "waveform.path.ecg")
                        .font(.system(size: 10))
                        .foregroundStyle(Color(red: 0.85, green: 0.70, blue: 0.30))

                    Text("ChaCha20 种子指纹:")
                        .font(.system(size: 10))
                        .foregroundStyle(.secondary)

                    Text(seed)
                        .font(.system(size: 10, weight: .medium, design: .monospaced))
                        .foregroundStyle(Color(red: 0.85, green: 0.70, blue: 0.30))
                        .lineLimit(1)
                        .truncationMode(.middle)
                        .frame(maxWidth: 240)

                    Text("· 100% 确定性回放验证")
                        .font(.system(size: 10))
                        .foregroundStyle(.secondary)
                }
            }
        }
        .padding(.bottom, 16)
    }
}
