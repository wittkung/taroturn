// TarotTheme.swift - Adaptive Design Tokens & Light/Dark Theme System (TTZip + Sonoma Glass Standard)
import SwiftUI
#if os(macOS)
import AppKit
#elseif os(iOS)
import UIKit
#endif

/// Application Theme Mode Option
public enum AppThemeMode: String, CaseIterable, Identifiable {
    case system = "system"
    case light = "light"
    case dark = "dark"

    public var id: String { rawValue }

    public var titleZh: String {
        switch self {
        case .system: return "自动跟随系统"
        case .light: return "日间明亮模式"
        case .dark: return "夜间幽冥模式"
        }
    }

    public var iconName: String {
        switch self {
        case .system: return "circle.lefthalf.filled"
        case .light: return "sun.max.fill"
        case .dark: return "moon.stars.fill"
        }
    }

    public var colorScheme: ColorScheme? {
        switch self {
        case .system: return nil
        case .light: return .light
        case .dark: return .dark
        }
    }
}

/// Dynamic Theme Token Provider for Taroturn
public enum TarotTheme {
    // MARK: - 1. Dynamic Adaptive Colors

    #if os(macOS)
    /// Kintsugi Gold — Dynamic adaptive gold accent (WCAG AA compliant contrast in both light & dark)
    public static let kintsugiGold = Color(nsColor: NSColor(name: nil, dynamicProvider: { appearance in
        if appearance.bestMatch(from: [.aqua, .darkAqua]) == .darkAqua {
            return NSColor(red: 230.0 / 255.0, green: 195.0 / 255.0, blue: 92.0 / 255.0, alpha: 1.0)
        } else {
            return NSColor(red: 168.0 / 255.0, green: 122.0 / 255.0, blue: 22.0 / 255.0, alpha: 1.0)
        }
    }))

    /// Celestial Purple — Dynamic adaptive spiritual violet
    public static let celestialPurple = Color(nsColor: NSColor(name: nil, dynamicProvider: { appearance in
        if appearance.bestMatch(from: [.aqua, .darkAqua]) == .darkAqua {
            return NSColor(red: 167.0 / 255.0, green: 139.0 / 255.0, blue: 250.0 / 255.0, alpha: 1.0)
        } else {
            return NSColor(red: 109.0 / 255.0, green: 40.0 / 255.0, blue: 217.0 / 255.0, alpha: 1.0)
        }
    }))

    /// Mystic Cyan — Dynamic adaptive celestial cyan
    public static let mysticCyan = Color(nsColor: NSColor(name: nil, dynamicProvider: { appearance in
        if appearance.bestMatch(from: [.aqua, .darkAqua]) == .darkAqua {
            return NSColor(red: 56.0 / 255.0, green: 189.0 / 255.0, blue: 248.0 / 255.0, alpha: 1.0)
        } else {
            return NSColor(red: 14.0 / 255.0, green: 116.0 / 255.0, blue: 144.0 / 255.0, alpha: 1.0)
        }
    }))

    /// Surface Glass Background
    public static let cardSurface = Color(nsColor: NSColor(name: nil, dynamicProvider: { appearance in
        if appearance.bestMatch(from: [.aqua, .darkAqua]) == .darkAqua {
            return NSColor(red: 30.0 / 255.0, green: 20.0 / 255.0, blue: 45.0 / 255.0, alpha: 0.65)
        } else {
            return NSColor(white: 1.0, alpha: 0.75)
        }
    }))

    /// Dynamic Subtle Card Border
    public static let cardBorder = Color(nsColor: NSColor(name: nil, dynamicProvider: { appearance in
        if appearance.bestMatch(from: [.aqua, .darkAqua]) == .darkAqua {
            return NSColor(white: 1.0, alpha: 0.12)
        } else {
            return NSColor(white: 0.0, alpha: 0.08)
        }
    }))

    /// Dynamic Input & Chip Background
    public static let inputBackground = Color(nsColor: NSColor(name: nil, dynamicProvider: { appearance in
        if appearance.bestMatch(from: [.aqua, .darkAqua]) == .darkAqua {
            return NSColor(white: 1.0, alpha: 0.06)
        } else {
            return NSColor(white: 0.0, alpha: 0.05)
        }
    }))

    /// Dynamic Dock Background
    public static let dockBackground = Color(nsColor: NSColor(name: nil, dynamicProvider: { appearance in
        if appearance.bestMatch(from: [.aqua, .darkAqua]) == .darkAqua {
            return NSColor(red: 25.0 / 255.0, green: 15.0 / 255.0, blue: 38.0 / 255.0, alpha: 0.85)
        } else {
            return NSColor(white: 1.0, alpha: 0.88)
        }
    }))

    /// Header Bottom Hairline
    public static let headerHairline = Color(nsColor: NSColor(name: nil, dynamicProvider: { appearance in
        if appearance.bestMatch(from: [.aqua, .darkAqua]) == .darkAqua {
            return NSColor(red: 230.0 / 255.0, green: 195.0 / 255.0, blue: 92.0 / 255.0, alpha: 0.25)
        } else {
            return NSColor(white: 0.0, alpha: 0.08)
        }
    }))
    #else
    public static let kintsugiGold = Color(red: 0.85, green: 0.70, blue: 0.30)
    public static let celestialPurple = Color.purple
    public static let mysticCyan = Color.cyan
    public static let cardSurface = Color.white.opacity(0.1)
    public static let cardBorder = Color.white.opacity(0.12)
    public static let inputBackground = Color.white.opacity(0.06)
    public static let dockBackground = Color.black.opacity(0.4)
    public static let headerHairline = Color.purple.opacity(0.2)
    #endif

    // MARK: - 2. Typography Tokens
    public enum Typography {
        public static let sanctuaryHeadline = Font.system(size: 26, weight: .bold, design: .serif)
        public static let cardTitle = Font.system(size: 16, weight: .bold, design: .serif)
        public static let cardSubtitle = Font.system(size: 12, weight: .regular, design: .serif)
        public static let body = Font.system(size: 13, weight: .regular, design: .default)
        public static let monoCaption = Font.system(size: 10, weight: .medium, design: .monospaced)
    }

    // MARK: - 3. Spacing & Dimensions
    public enum Dimensions {
        public static let headerHeight: CGFloat = 52.0
        public static let trafficLightInset: CGFloat = 78.0
        public static let drawerWidth: CGFloat = 360.0
        public static let dockMaxWidth: CGFloat = 860.0
    }
}
