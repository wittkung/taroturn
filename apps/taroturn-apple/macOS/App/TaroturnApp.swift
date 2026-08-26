// TaroturnApp.swift - macOS Native Main Application Entry Point
import SwiftUI
import SwiftData
import TaroturnCore
import TaroturnShared

@main
struct TaroturnApp: App {
    @MainActor
    private var sharedModelContainer: ModelContainer = {
        ModelContainerFactory.createSharedContainer()
    }()

    var body: some Scene {
        // 主工作区窗口
        WindowGroup("Taroturn Sanctuary · 确定性神谕推演圣殿", id: "main-sanctuary") {
            ThreeColumnZenWorkspace()
                .frame(minWidth: 1040, minHeight: 680)
                .background(TransparentWindowBackground())
        }
        .windowStyle(.hiddenTitleBar)
        .modelContainer(sharedModelContainer)
        .commands {
            TaroturnKeyboardCommands()
        }

        // 常驻系统菜单栏小组件 (MenuBarExtra)
        MenuBarExtra("Taroturn", systemImage: "sparkles") {
            TaroturnMenuBarView()
                .modelContainer(sharedModelContainer)
        }
        .menuBarExtraStyle(.window)
    }
}

#if os(macOS)
import AppKit

public struct TransparentWindowBackground: NSViewRepresentable {
    public init() {}

    public func makeNSView(context: Context) -> NSView {
        let view = NSView()
        DispatchQueue.main.async {
            if let window = view.window {
                window.isOpaque = false
                window.backgroundColor = .clear
                window.titlebarAppearsTransparent = true
                window.titleVisibility = .hidden
                window.hasShadow = true
                window.styleMask.insert(.fullSizeContentView)
            }
        }
        return view
    }

    public func updateNSView(_ nsView: NSView, context: Context) {}
}
#endif

