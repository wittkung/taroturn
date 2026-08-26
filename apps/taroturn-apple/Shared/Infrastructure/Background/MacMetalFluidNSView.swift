// MacMetalFluidNSView.swift - macOS Metal Fluid View Bridge (1:1 ittime spec)
import SwiftUI
import MetalKit

#if os(macOS)
import QuartzCore
import AppKit

final class MacMetalFluidNSView: NSView, @unchecked Sendable {
    private nonisolated(unsafe) let metalLayer: CAMetalLayer
    private let renderer: MetalFluidRenderer
    private let renderQueue = DispatchQueue(label: "com.taroturn.metalRender", qos: .userInteractive)
    private nonisolated(unsafe) var isRendering = false
    private let frameSemaphore = DispatchSemaphore(value: 2)
    private nonisolated(unsafe) var caDisplayLink: CADisplayLink?

    init?(device: MTLDevice, renderer: MetalFluidRenderer) {
        self.renderer = renderer

        let layer = CAMetalLayer()
        layer.device = device
        layer.pixelFormat = .bgra8Unorm
        layer.isOpaque = true
        layer.framebufferOnly = true
        layer.presentsWithTransaction = false
        layer.maximumDrawableCount = 2
        self.metalLayer = layer

        super.init(frame: .zero)

        self.wantsLayer = true
        self.layer = metalLayer
    }

    required init?(coder: NSCoder) { fatalError() }

    deinit {
        caDisplayLink?.invalidate()
    }

    public override func viewDidMoveToWindow() {
        super.viewDidMoveToWindow()
        if window != nil && !isRendering {
            let scale = window?.backingScaleFactor ?? 2.0
            let size = CGSize(width: bounds.width * scale, height: bounds.height * scale)
            if size.width > 0 && size.height > 0 {
                metalLayer.drawableSize = size
                renderer.recreateOffscreenTextures(fullSize: size)
            }
            startDisplayLink()
        } else if window == nil {
            stopDisplayLink()
        }
    }

    public override func layout() {
        super.layout()
        let scale = window?.backingScaleFactor ?? 2.0
        let size = CGSize(width: bounds.width * scale, height: bounds.height * scale)
        guard size.width > 0 && size.height > 0 else { return }

        if metalLayer.drawableSize != size {
            metalLayer.drawableSize = size
            renderer.recreateOffscreenTextures(fullSize: size)

            if let cache = renderer.frameCache, cache.needsPrerender(for: size) {
                cache.prerender(renderer: renderer, screenSize: size, blurSigma: renderer.blurSigma) {}
            }
        }

        if renderer.frameCache == nil {
            let cache = FluidFrameCache.shared(device: renderer.device)
            renderer.frameCache = cache
            if cache.needsPrerender(for: size) {
                cache.prerender(renderer: renderer, screenSize: size, blurSigma: renderer.blurSigma) {}
            }
        }
    }

    private func startDisplayLink() {
        guard !isRendering else { return }
        let link = self.displayLink(target: self, selector: #selector(displayLinkFired))
        link.preferredFrameRateRange = CAFrameRateRange(minimum: 30, maximum: 60, preferred: 60)
        link.add(to: .main, forMode: .common)
        caDisplayLink = link
        isRendering = true
    }

    private func stopDisplayLink() {
        caDisplayLink?.invalidate()
        caDisplayLink = nil
        isRendering = false
    }

    @objc private func displayLinkFired() {
        guard frameSemaphore.wait(timeout: .now()) == .success else { return }

        nonisolated(unsafe) let layer = self.metalLayer
        let rend = self.renderer
        let sem = self.frameSemaphore

        renderQueue.async {
            defer { sem.signal() }
            guard let drawable = layer.nextDrawable() else { return }

            if rend.focusMode == 0.0, let cache = rend.frameCache, cache.isReady {
                rend.renderCachedFrame(drawable: drawable)
                return
            }

            guard let textures = rend.currentOffscreenTextures else { return }
            rend.renderFrame(
                drawable: drawable,
                offscreen: textures.offscreen,
                blurOutput: textures.blurOutput,
                screenPassDescriptor: nil
            )
        }
    }

    public var isPaused: Bool {
        get { !isRendering }
        set {
            if newValue { stopDisplayLink() }
            else if !isRendering { startDisplayLink() }
        }
    }
}

public struct MetalFluidViewRepresentable: NSViewRepresentable {
    public let config: FluidBackgroundConfig

    public init(config: FluidBackgroundConfig) {
        self.config = config
    }

    public func makeNSView(context: Context) -> NSView {
        guard let device = MTLCreateSystemDefaultDevice(),
              let renderer = MetalFluidRenderer(device: device)
        else { return NSView() }

        let scaleFactor = Float(NSScreen.main?.backingScaleFactor ?? 2.0)
        renderer.blurSigma = 15.0 * scaleFactor
        context.coordinator.renderer = renderer

        guard let metalView = MacMetalFluidNSView(device: device, renderer: renderer) else {
            return NSView()
        }
        context.coordinator.metalView = metalView
        updateRenderer(renderer)
        return metalView
    }

    public func updateNSView(_ nsView: NSView, context: Context) {
        guard let metalView = context.coordinator.metalView else { return }
        if let renderer = context.coordinator.renderer {
            updateRenderer(renderer)
        }

        let isAnimationFrozen = context.coordinator.renderer?.speed == 0
        let shouldPause = config.isSystemPaused || !config.isActive || isAnimationFrozen

        if shouldPause {
            if !metalView.isPaused {
                context.coordinator.pauseTask?.cancel()
                let task = DispatchWorkItem { [weak metalView] in
                    metalView?.isPaused = true
                }
                context.coordinator.pauseTask = task
                DispatchQueue.main.asyncAfter(deadline: .now() + 1.5, execute: task)
            }
        } else {
            context.coordinator.pauseTask?.cancel()
            metalView.isPaused = false
        }
    }

    public func makeCoordinator() -> Coordinator { Coordinator() }

    public class Coordinator {
        var renderer: MetalFluidRenderer?
        var metalView: MacMetalFluidNSView?
        var pauseTask: DispatchWorkItem?
    }

    private func updateRenderer(_ renderer: MetalFluidRenderer) {
        renderer.speed = config.isFocusPaused ? 0.0 : (config.isRunning ? 0.8 : 0.25)
        let nsColor = NSColor(config.baseColor).usingColorSpace(.sRGB) ?? NSColor(config.baseColor)
        let r = Float(nsColor.redComponent)
        let g = Float(nsColor.greenComponent)
        let b = Float(nsColor.blueComponent)

        renderer.targetColor1 = SIMD3(r, g, b)
        renderer.targetColor2 = SIMD3(r * 0.85, g * 0.85, b * 0.85)
        renderer.targetColor3 = SIMD3(r * 0.70, g * 0.70, b * 0.70)

        renderer.backgroundColor = config.isDarkMode ? SIMD3(0.03, 0.02, 0.07) : SIMD3(0.98, 0.98, 0.99)
        renderer.fluidOpacity = config.fluidOpacity
        renderer.focusMode = config.focusMode
        renderer.focusProgress = config.focusProgress
        renderer.breathSeed = config.breathSeed
    }
}
#endif
