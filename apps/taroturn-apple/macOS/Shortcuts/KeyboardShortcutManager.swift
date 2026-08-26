// KeyboardShortcutManager.swift - macOS Native Keyboard Shortcuts & Command Palette
import SwiftUI

#if os(macOS)
import AppKit

public struct TaroturnKeyboardCommands: Commands {
    public init() {}

    public var body: some Commands {
        CommandMenu("推演圣殿") {
            Button("抽取每日单牌") {
                NotificationCenter.default.post(name: .triggerDailyDraw, object: nil)
            }
            .keyboardShortcut("D", modifiers: [.command])

            Button("新推演仪式") {
                NotificationCenter.default.post(name: .triggerNewReading, object: nil)
            }
            .keyboardShortcut("N", modifiers: [.command])

            Divider()

            Button("翻转所有卡牌") {
                NotificationCenter.default.post(name: .triggerFlipAll, object: nil)
            }
            .keyboardShortcut(.space, modifiers: [])
        }
    }
}

public extension Notification.Name {
    static let triggerDailyDraw = Notification.Name("com.taroturn.triggerDailyDraw")
    static let triggerNewReading = Notification.Name("com.taroturn.triggerNewReading")
    static let triggerFlipAll = Notification.Name("com.taroturn.triggerFlipAll")
}
#endif
