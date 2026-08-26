// MetalFluidRenderer.swift - 3-Stage GPU Fluid Renderer with MPS Blur (1:1 ittime spec)
import SwiftUI
import MetalKit
import MetalPerformanceShaders

final class MetalFluidRenderer: NSObject, MTKViewDelegate, @unchecked Sendable {
    let device: MTLDevice
    let commandQueue: MTLCommandQueue

    let circlesPipeline: MTLRenderPipelineState
    let blitPipeline: MTLRenderPipelineState

    private(set) var extractCoveragePipeline: MTLRenderPipelineState?
    private(set) var cachedBlitPipeline: MTLRenderPipelineState?

    var frameCache: FluidFrameCache?

    private var offscreenTexture: MTLTexture?
    private var blurOutputTexture: MTLTexture?
    private var blurKernel: MPSImageGaussianBlur

    private var phase: Float = 0
    var speed: Float = 0.2

    private var color1: SIMD3<Float> = SIMD3(0.58, 0.20, 0.92)
    private var color2: SIMD3<Float> = SIMD3(0.45, 0.15, 0.85)
    private var color3: SIMD3<Float> = SIMD3(0.35, 0.10, 0.70)

    var targetColor1: SIMD3<Float> = SIMD3(0.58, 0.20, 0.92)
    var targetColor2: SIMD3<Float> = SIMD3(0.45, 0.15, 0.85)
    var targetColor3: SIMD3<Float> = SIMD3(0.35, 0.10, 0.70)

    var focusMode: Float = 0.0
    var focusProgress: Float = 0.0
    var breathSeed: Float = 0.0

    var backgroundColor: SIMD3<Float> = SIMD3(0.03, 0.02, 0.07)
    var fluidOpacity: Float = 0.65

    var blurSigma: Float = 45 {
        didSet {
            if blurSigma != oldValue {
                blurKernel = MPSImageGaussianBlur(device: device, sigma: blurSigma)
            }
        }
    }

    struct FluidUniforms {
        var phase: Float
        var _pad: Float = 0
        var resolution: SIMD2<Float>
        var color1: SIMD3<Float>
        var color2: SIMD3<Float>
        var color3: SIMD3<Float>

        var focusMode: Float
        var focusProgress: Float
        var breathSeed: Float
        var dropletCount: Float

        var rewardPulse: Float = 0.0
        var isDarkMode: Float = 1.0
        var _pad3: Float = 0.0
        var _pad4: Float = 0.0
    }

    init?(device: MTLDevice) {
        self.device = device
        guard let queue = device.makeCommandQueue() else { return nil }
        self.commandQueue = queue

        // Resolve Metal library
        let library: MTLLibrary? = {
            if let lib = device.makeDefaultLibrary() { return lib }
            #if SWIFT_PACKAGE
            if let lib = try? device.makeDefaultLibrary(bundle: Bundle.module) { return lib }
            #endif
            // Fallback to embedded source compilation if binary metallib not found
            let metalSource = """
            #include <metal_stdlib>
            using namespace metal;

            struct FluidUniforms {
                float phase;
                float _pad;
                float2 resolution;
                float3 color1;
                float3 color2;
                float3 color3;
                float focusMode;
                float focusProgress;
                float breathSeed;
                float dropletCount;
                float rewardPulse;
                float isDarkMode;
                float _pad3;
                float _pad4;
            };

            struct VertexOut {
                float4 position [[position]];
                float2 uv;
            };

            vertex VertexOut fluidVertex(uint vid [[vertex_id]]) {
                float2 pos = float2((vid << 1) & 2, vid & 2);
                VertexOut out;
                out.position = float4(pos * 2.0 - 1.0, 0.0, 1.0);
                out.uv = float2(pos.x, 1.0 - pos.y);
                return out;
            }

            fragment float4 fluidCirclesFragment(VertexOut in [[stage_in]], constant FluidUniforms &u [[buffer(0)]]) {
                float2 uv = in.uv;
                float t = u.phase;
                float aspect = u.resolution.x / u.resolution.y;

                float2 c1 = float2(0.5 + cos(t * 0.65) * 0.32, 0.5 + sin(t * 1.05) * 0.22);
                float2 c2 = float2(0.5 + sin(t * 0.45) * 0.38, 0.5 + cos(t * 0.95) * 0.28);
                float2 c3 = float2(0.5 + cos(t * 0.35) * 0.28, 0.5 + sin(t * 0.55) * 0.36);

                float r = 0.32;
                float2 sf = (aspect > 1.0) ? float2(aspect, 1.0) : float2(1.0, 1.0 / aspect);

                float m1 = step(length((uv - c1) * sf), r);
                float m2 = step(length((uv - c2) * sf), r * 1.05);
                float m3 = step(length((uv - c3) * sf), r * 0.95);

                float a1 = m1;
                float a2 = 0.8 * m2;
                float a3 = 0.6 * m3;

                float3 rgb = u.color3 * a3 + (u.color2 * a2 + u.color1 * a1 * (1.0 - a2)) * (1.0 - a3);
                float alpha = a3 + (a2 + a1 * (1.0 - a2)) * (1.0 - a3);

                return float4(rgb, alpha);
            }

            fragment float4 blitTextureFragment(VertexOut in [[stage_in]], texture2d<float> tex [[texture(0)]], constant float4 &cp [[buffer(0)]]) {
                constexpr sampler s(filter::linear, address::clamp_to_edge);
                float4 c = tex.sample(s, in.uv);
                float3 blob = pow(max(c.rgb / max(c.a, 1e-5), 0.0), 1.0 / 2.2);
                float3 res = mix(cp.xyz, blob, c.a * cp.w);
                return float4(res, 1.0);
            }

            fragment float extractCoverageFragment(VertexOut in [[stage_in]], texture2d<float> tex [[texture(0)]]) {
                constexpr sampler s(filter::linear, address::clamp_to_edge);
                return tex.sample(s, in.uv).a;
            }

            fragment float4 blitCachedFragment(VertexOut in [[stage_in]], texture2d<float> fA [[texture(0)]], texture2d<float> fB [[texture(1)]], constant float4 &p [[buffer(0)]], constant float4 &cp [[buffer(1)]]) {
                constexpr sampler s(filter::linear, address::clamp_to_edge);
                float cov = mix(fA.sample(s, in.uv).r, fB.sample(s, in.uv).r, p.x);
                float3 res = mix(cp.xyz, p.yzw, cov * cp.w);
                return float4(res, 1.0);
            }
            """
            return try? device.makeLibrary(source: metalSource, options: nil)
        }()

        guard let lib = library,
              let vertexFn = lib.makeFunction(name: "fluidVertex"),
              let circlesFn = lib.makeFunction(name: "fluidCirclesFragment"),
              let blitFn = lib.makeFunction(name: "blitTextureFragment")
        else { return nil }

        let circlesDesc = MTLRenderPipelineDescriptor()
        circlesDesc.vertexFunction = vertexFn
        circlesDesc.fragmentFunction = circlesFn
        circlesDesc.colorAttachments[0].pixelFormat = .rgba16Float
        circlesDesc.colorAttachments[0].isBlendingEnabled = false

        let blitDesc = MTLRenderPipelineDescriptor()
        blitDesc.vertexFunction = vertexFn
        blitDesc.fragmentFunction = blitFn
        blitDesc.colorAttachments[0].pixelFormat = .bgra8Unorm
        blitDesc.colorAttachments[0].isBlendingEnabled = true
        blitDesc.colorAttachments[0].sourceRGBBlendFactor = .one
        blitDesc.colorAttachments[0].destinationRGBBlendFactor = .oneMinusSourceAlpha
        blitDesc.colorAttachments[0].sourceAlphaBlendFactor = .one
        blitDesc.colorAttachments[0].destinationAlphaBlendFactor = .oneMinusSourceAlpha

        do {
            self.circlesPipeline = try device.makeRenderPipelineState(descriptor: circlesDesc)
            self.blitPipeline = try device.makeRenderPipelineState(descriptor: blitDesc)
        } catch {
            return nil
        }

        self.blurKernel = MPSImageGaussianBlur(device: device, sigma: 45)
        super.init()

        setupCachePipelines(library: lib, vertexFn: vertexFn)
    }

    private func setupCachePipelines(library: MTLLibrary, vertexFn: MTLFunction) {
        if let extractFn = library.makeFunction(name: "extractCoverageFragment") {
            let desc = MTLRenderPipelineDescriptor()
            desc.vertexFunction = vertexFn
            desc.fragmentFunction = extractFn
            desc.colorAttachments[0].pixelFormat = .r8Unorm
            desc.colorAttachments[0].isBlendingEnabled = false
            self.extractCoveragePipeline = try? device.makeRenderPipelineState(descriptor: desc)
        }

        if let cachedFn = library.makeFunction(name: "blitCachedFragment") {
            let desc = MTLRenderPipelineDescriptor()
            desc.vertexFunction = vertexFn
            desc.fragmentFunction = cachedFn
            desc.colorAttachments[0].pixelFormat = .bgra8Unorm
            desc.colorAttachments[0].isBlendingEnabled = true
            desc.colorAttachments[0].sourceRGBBlendFactor = .one
            desc.colorAttachments[0].destinationRGBBlendFactor = .oneMinusSourceAlpha
            desc.colorAttachments[0].sourceAlphaBlendFactor = .one
            desc.colorAttachments[0].destinationAlphaBlendFactor = .oneMinusSourceAlpha
            self.cachedBlitPipeline = try? device.makeRenderPipelineState(descriptor: desc)
        }
    }

    func mtkView(_ view: MTKView, drawableSizeWillChange size: CGSize) {
        recreateOffscreenTextures(fullSize: size)
    }

    func draw(in view: MTKView) {
        guard let drawable = view.currentDrawable else { return }

        if focusMode == 0.0, let cache = frameCache, cache.isReady {
            renderCachedFrame(drawable: drawable)
            return
        }

        guard let offscreen = offscreenTexture, let blurOutput = blurOutputTexture else { return }
        renderFrame(drawable: drawable, offscreen: offscreen, blurOutput: blurOutput, screenPassDescriptor: view.currentRenderPassDescriptor)
    }

    func renderFrame(drawable: CAMetalDrawable, offscreen: MTLTexture, blurOutput: MTLTexture, screenPassDescriptor: MTLRenderPassDescriptor?) {
        Task { @MainActor in
            self.phase = Float(GlobalFluidState.shared.currentPhase(speed: Double(self.speed)))
        }

        color1 += (targetColor1 - color1)
        color2 += (targetColor2 - color2)
        color3 += (targetColor3 - color3)

        let offSize = SIMD2<Float>(Float(offscreen.width), Float(offscreen.height))
        var uniforms = FluidUniforms(
            phase: phase, resolution: offSize,
            color1: color1, color2: color2, color3: color3,
            focusMode: focusMode, focusProgress: focusProgress, breathSeed: breathSeed,
            dropletCount: 0.0, rewardPulse: 0.0,
            isDarkMode: backgroundColor.x == 0 ? 1.0 : 0.0
        )

        guard let commandBuffer = commandQueue.makeCommandBuffer() else { return }

        let offscreenPass = MTLRenderPassDescriptor()
        offscreenPass.colorAttachments[0].texture = offscreen
        offscreenPass.colorAttachments[0].loadAction = .clear
        offscreenPass.colorAttachments[0].storeAction = .store
        offscreenPass.colorAttachments[0].clearColor = MTLClearColor(red: 0, green: 0, blue: 0, alpha: 0)

        if let encoder = commandBuffer.makeRenderCommandEncoder(descriptor: offscreenPass) {
            encoder.setRenderPipelineState(circlesPipeline)
            encoder.setFragmentBytes(&uniforms, length: MemoryLayout<FluidUniforms>.stride, index: 0)
            encoder.drawPrimitives(type: .triangle, vertexStart: 0, vertexCount: 3)
            encoder.endEncoding()
        }

        blurKernel.encode(commandBuffer: commandBuffer, sourceTexture: offscreen, destinationTexture: blurOutput)

        let screenPass: MTLRenderPassDescriptor = screenPassDescriptor ?? {
            let sp = MTLRenderPassDescriptor()
            sp.colorAttachments[0].texture = drawable.texture
            sp.colorAttachments[0].loadAction = .clear
            sp.colorAttachments[0].storeAction = .store
            sp.colorAttachments[0].clearColor = MTLClearColor(
                red: Double(backgroundColor.x),
                green: Double(backgroundColor.y),
                blue: Double(backgroundColor.z),
                alpha: 1.0
            )
            return sp
        }()

        var compositeParams = SIMD4<Float>(backgroundColor.x, backgroundColor.y, backgroundColor.z, fluidOpacity)

        guard let encoder = commandBuffer.makeRenderCommandEncoder(descriptor: screenPass) else {
            commandBuffer.commit()
            return
        }

        encoder.setRenderPipelineState(blitPipeline)
        encoder.setFragmentTexture(blurOutput, index: 0)
        encoder.setFragmentBytes(&compositeParams, length: MemoryLayout<SIMD4<Float>>.stride, index: 0)
        encoder.setFragmentBytes(&uniforms, length: MemoryLayout<FluidUniforms>.stride, index: 1)
        encoder.drawPrimitives(type: .triangle, vertexStart: 0, vertexCount: 3)
        encoder.endEncoding()

        commandBuffer.present(drawable)
        commandBuffer.commit()
    }

    func renderCachedFrame(drawable: CAMetalDrawable) {
        guard let cache = frameCache, cache.isReady, let pipeline = cachedBlitPipeline else { return }

        Task { @MainActor in
            self.phase = Float(GlobalFluidState.shared.currentPhase(speed: Double(self.speed)))
        }
        let cachedPhase = self.phase

        color1 += (targetColor1 - color1)
        color2 += (targetColor2 - color2)
        color3 += (targetColor3 - color3)

        guard let (frameA, frameB, blend) = cache.getFrames(elapsedPhase: cachedPhase) else { return }

        var params = SIMD4<Float>(blend, color1.x, color1.y, color1.z)
        var compositeParams = SIMD4<Float>(backgroundColor.x, backgroundColor.y, backgroundColor.z, fluidOpacity)

        guard let commandBuffer = commandQueue.makeCommandBuffer() else { return }

        let screenPass = MTLRenderPassDescriptor()
        screenPass.colorAttachments[0].texture = drawable.texture
        screenPass.colorAttachments[0].loadAction = .clear
        screenPass.colorAttachments[0].storeAction = .store
        screenPass.colorAttachments[0].clearColor = MTLClearColor(
            red: Double(backgroundColor.x),
            green: Double(backgroundColor.y),
            blue: Double(backgroundColor.z),
            alpha: 1.0
        )

        guard let encoder = commandBuffer.makeRenderCommandEncoder(descriptor: screenPass) else {
            commandBuffer.commit()
            return
        }

        encoder.setRenderPipelineState(pipeline)
        encoder.setFragmentTexture(frameA, index: 0)
        encoder.setFragmentTexture(frameB, index: 1)
        encoder.setFragmentBytes(&params, length: MemoryLayout<SIMD4<Float>>.stride, index: 0)
        encoder.setFragmentBytes(&compositeParams, length: MemoryLayout<SIMD4<Float>>.stride, index: 1)
        encoder.drawPrimitives(type: .triangle, vertexStart: 0, vertexCount: 3)
        encoder.endEncoding()

        commandBuffer.present(drawable)
        commandBuffer.commit()
    }

    func recreateOffscreenTextures(fullSize: CGSize) {
        let w = max(1, Int(fullSize.width) / 4)
        let h = max(1, Int(fullSize.height) / 4)
        if let existing = offscreenTexture, existing.width == w, existing.height == h { return }

        let desc = MTLTextureDescriptor.texture2DDescriptor(pixelFormat: .rgba16Float, width: w, height: h, mipmapped: false)
        desc.usage = [.renderTarget, .shaderRead, .shaderWrite]
        desc.storageMode = .private

        offscreenTexture = device.makeTexture(descriptor: desc)
        blurOutputTexture = device.makeTexture(descriptor: desc)
    }

    var currentOffscreenTextures: (offscreen: MTLTexture, blurOutput: MTLTexture)? {
        guard let o = offscreenTexture, let b = blurOutputTexture else { return nil }
        return (o, b)
    }
}
