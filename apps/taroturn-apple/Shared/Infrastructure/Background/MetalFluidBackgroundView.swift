// MetalFluidBackgroundView.swift - Unified GPU Fluid Background SwiftUI Entry Point (ittime spec)
import SwiftUI

public struct MetalFluidBackgroundView: View {
    public let config: FluidBackgroundConfig

    public init(config: FluidBackgroundConfig) {
        self.config = config
    }

    public init(
        baseColor: Color = Color(red: 0.58, green: 0.20, blue: 0.92),
        isRunning: Bool = false,
        isFocusPaused: Bool = false,
        isDarkMode: Bool = true,
        fluidOpacity: Float = 0.65,
        focusMode: Float = 0.0,
        focusProgress: Float = 0.0,
        breathSeed: Float = 0.0
    ) {
        self.config = FluidBackgroundConfigBuilder(baseColor: baseColor, isRunning: isRunning)
            .isFocusPaused(isFocusPaused)
            .isDarkMode(isDarkMode)
            .fluidOpacity(fluidOpacity)
            .focusMode(focusMode)
            .focusProgress(focusProgress)
            .breathSeed(breathSeed)
            .build()
    }

    @Environment(\.scenePhase) private var scenePhase
    @State private var isVisible = true

    public var body: some View {
        var resolvedConfig = config
        resolvedConfig.isSystemPaused = (scenePhase == .background)
        resolvedConfig.isActive = isVisible

        return Group {
            #if os(macOS)
            MetalFluidViewRepresentable(config: resolvedConfig)
            #else
            LiquidFluidBackgroundView(isDark: resolvedConfig.isDarkMode)
            #endif
        }
        .ignoresSafeArea()
        .onAppear { isVisible = true }
        .onDisappear { isVisible = false }
    }
}
