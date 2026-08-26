// SeekerProfileSheet.swift - Seeker Astrological & Tarot Archetype Profile (ui-ux-pro-max + WSJ Typography)
import SwiftUI
import TaroturnCore

public struct SeekerProfileView: View {
    @AppStorage("seekerName") private var seekerName: String = "探求者"
    @AppStorage("seekerBirthdate") private var seekerBirthdateTimestamp: Double = Date().timeIntervalSince1970

    private var birthDate: Binding<Date> {
        Binding(
            get: { Date(timeIntervalSince1970: seekerBirthdateTimestamp) },
            set: { seekerBirthdateTimestamp = $0.timeIntervalSince1970 }
        )
    }

    public init() {}

    // Classical Numerology: Calculate Soul Card (0-21 Major Arcana)
    private var soulCard: TarotCardInfo {
        let calendar = Calendar.current
        let comps = calendar.dateComponents([.year, .month, .day], from: birthDate.wrappedValue)
        let y = comps.year ?? 1998
        let m = comps.month ?? 8
        let d = comps.day ?? 8

        let sum = y + m + d
        var reduced = sum
        while reduced > 21 {
            let digits = String(reduced).compactMap { Int(String($0)) }
            reduced = digits.reduce(0, +)
            if reduced <= 21 { break }
        }
        return TarotCatalog.getCard(by: UInt8(reduced))
    }

    // Astrological Sun Sign Calculation
    private var zodiacMeta: (name: String, symbol: String, element: String, ruler: String) {
        let calendar = Calendar.current
        let comps = calendar.dateComponents([.month, .day], from: birthDate.wrappedValue)
        let m = comps.month ?? 8
        let d = comps.day ?? 8

        switch (m, d) {
        case (3, 21...31), (4, 1...19):
            return ("白羊座", "♈️", "火象", "火星 · 皇帝")
        case (4, 20...30), (5, 1...20):
            return ("金牛座", "♉️", "土象", "金星 · 教皇")
        case (5, 21...31), (6, 1...21):
            return ("双子座", "♊️", "风象", "水星 · 恋人")
        case (6, 22...30), (7, 1...22):
            return ("巨蟹座", "♋️", "水象", "月亮 · 战车")
        case (7, 23...31), (8, 1...22):
            return ("狮子座", "♌️", "火象", "太阳 · 力量")
        case (8, 23...31), (9, 1...22):
            return ("处女座", "♍️", "土象", "水星 · 隐士")
        case (9, 23...30), (10, 1...23):
            return ("天秤座", "♎️", "风象", "金星 · 正义")
        case (10, 24...31), (11, 1...22):
            return ("天蝎座", "♏️", "水象", "冥王星 · 死神")
        case (11, 23...30), (12, 1...21):
            return ("射手座", "♐️", "火象", "木星 · 节制")
        case (12, 22...31), (1, 1...19):
            return ("摩羯座", "♑️", "土象", "土星 · 恶魔")
        case (1, 20...31), (2, 1...18):
            return ("水瓶座", "♒️", "风象", "天王星 · 星星")
        default:
            return ("双鱼座", "♓️", "水象", "海王星 · 月亮")
        }
    }

    public var body: some View {
        ScrollView {
            HStack(alignment: .top, spacing: 32) {
                // Left: Soul Card Holographic Card
                VStack(spacing: 12) {
                    ZStack {
                        RoundedRectangle(cornerRadius: 14, style: .continuous)
                            .fill(Color.primary.opacity(0.04))

                        if let img = TarotImageLoader.image(named: soulCard.imageFileName) {
                            img
                                .resizable()
                                .aspectRatio(contentMode: .fit)
                                .clipShape(RoundedRectangle(cornerRadius: 13, style: .continuous))
                        } else {
                            VStack(spacing: 8) {
                                Image(systemName: "sparkles")
                                    .font(.system(size: 32))
                                    .foregroundStyle(TarotTheme.kintsugiGold)
                                Text(soulCard.nameZh)
                                    .font(.system(size: 16, weight: .bold, design: .serif))
                            }
                        }
                    }
                    .frame(width: 220, height: 360)
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

                    VStack(spacing: 2) {
                        Text(soulCard.nameZh)
                            .font(.system(size: 16, weight: .bold, design: .serif))
                            .foregroundStyle(TarotTheme.kintsugiGold)

                        Text("灵魂本命牌 #\(soulCard.id)")
                            .font(.system(size: 11, design: .monospaced))
                            .foregroundStyle(.secondary)
                    }
                }
                .frame(width: 240)

                // Right: Form & Archetype Analysis
                VStack(alignment: .leading, spacing: 20) {
                    // Birthday & Name Setting Form
                    VStack(alignment: .leading, spacing: 12) {
                        Text("求道者出生信息设置")
                            .font(.system(size: 13, weight: .bold, design: .serif))
                            .foregroundStyle(TarotTheme.kintsugiGold)

                        HStack(spacing: 16) {
                            VStack(alignment: .leading, spacing: 4) {
                                Text("求道者称谓")
                                    .font(.system(size: 11))
                                    .foregroundStyle(.secondary)
                                TextField("输入求道者名称", text: $seekerName)
                                    .textFieldStyle(.roundedBorder)
                                    .frame(width: 160)
                            }

                            VStack(alignment: .leading, spacing: 4) {
                                Text("公历出生日期 (YYYY-MM-DD)")
                                    .font(.system(size: 11))
                                    .foregroundStyle(.secondary)
                                DatePicker("", selection: birthDate, displayedComponents: [.date])
                                    .labelsHidden()
                                    .datePickerStyle(.compact)
                            }
                        }
                    }
                    .padding(16)
                    .background(
                        RoundedRectangle(cornerRadius: 14, style: .continuous)
                            .fill(Color.primary.opacity(0.03))
                            .overlay(
                                RoundedRectangle(cornerRadius: 14, style: .continuous)
                                    .strokeBorder(Color.primary.opacity(0.08), lineWidth: 0.8)
                            )
                    )

                    // Astrological & Archetype Grid
                    VStack(alignment: .leading, spacing: 12) {
                        Text("本命星轨与原型心智")
                            .font(.system(size: 13, weight: .bold, design: .serif))
                            .foregroundStyle(Color.primary)

                        HStack(spacing: 12) {
                            // Zodiac
                            VStack(alignment: .leading, spacing: 4) {
                                Text("黄道太阳星座")
                                    .font(.system(size: 10, design: .serif))
                                    .foregroundStyle(.secondary)
                                HStack(spacing: 6) {
                                    Text(zodiacMeta.symbol)
                                        .font(.system(size: 16))
                                    Text(zodiacMeta.name)
                                        .font(.system(size: 14, weight: .bold))
                                }
                            }
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding(12)
                            .background(Color.primary.opacity(0.02))
                            .clipShape(RoundedRectangle(cornerRadius: 10))

                            // Element
                            VStack(alignment: .leading, spacing: 4) {
                                Text("主导元素")
                                    .font(.system(size: 10, design: .serif))
                                    .foregroundStyle(.secondary)
                                Text(zodiacMeta.element)
                                    .font(.system(size: 14, weight: .bold))
                                    .foregroundStyle(TarotTheme.kintsugiGold)
                            }
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding(12)
                            .background(Color.primary.opacity(0.02))
                            .clipShape(RoundedRectangle(cornerRadius: 10))

                            // Ruling Arcanum
                            VStack(alignment: .leading, spacing: 4) {
                                Text("守护星与执政牌")
                                    .font(.system(size: 10, design: .serif))
                                    .foregroundStyle(.secondary)
                                Text(zodiacMeta.ruler)
                                    .font(.system(size: 12, weight: .bold))
                                    .lineLimit(1)
                            }
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding(12)
                            .background(Color.primary.opacity(0.02))
                            .clipShape(RoundedRectangle(cornerRadius: 10))
                        }
                    }

                    // Classical Lore & Archetype Description
                    VStack(alignment: .leading, spacing: 8) {
                        Text("灵魂本命寓言与成长功课")
                            .font(.system(size: 13, weight: .bold, design: .serif))
                            .foregroundStyle(Color.primary)

                        Text("本命牌 \(soulCard.nameZh) 代表了求道者内在精神演进的主体动机与核心潜意识驱动力。通过理解 \(soulCard.nameZh) 的原型能量，求道者可在日常决断与复杂境遇中保持定力，唤醒本真智慧。")
                            .font(.system(size: 12))
                            .foregroundStyle(.secondary)
                            .lineSpacing(5)
                    }
                    .padding(16)
                    .background(
                        RoundedRectangle(cornerRadius: 14, style: .continuous)
                            .fill(TarotTheme.celestialPurple.opacity(0.08))
                            .overlay(
                                RoundedRectangle(cornerRadius: 14, style: .continuous)
                                    .strokeBorder(TarotTheme.kintsugiGold.opacity(0.3), lineWidth: 0.8)
                            )
                    )
                }
            }
            .padding(28)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

public struct SeekerProfileSheet: View {
    @Environment(\.dismiss) private var dismiss

    public init() {}

    public var body: some View {
        NavigationStack {
            SeekerProfileView()
                .background(VisualEffectView(material: .underWindowBackground, blendingMode: .behindWindow, state: .active))
                .background(.ultraThinMaterial)
                .navigationTitle("求道者本命神殿 · 灵魂塔罗")
                .toolbar {
                    ToolbarItem(placement: .confirmationAction) {
                        Button("完成") { dismiss() }
                            .keyboardShortcut(.defaultAction)
                    }
                }
        }
        .frame(minWidth: 780, minHeight: 560)
    }
}
