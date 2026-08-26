// FluidBackground.metal - GPU Fluid Shader (1:1 ittime Metal GPU Engine)
#include <metal_stdlib>
using namespace metal;

struct FluidUniforms {
    float phase;         // offset 0,  4B
    float _pad;          // offset 4,  4B
    float2 resolution;   // offset 8,  8B
    float3 color1;       // offset 16, 16B
    float3 color2;       // offset 32, 16B
    float3 color3;       // offset 48, 16B

    float focusMode;     // offset 64, 4B
    float focusProgress; // offset 68, 4B
    float breathSeed;    // offset 72, 4B
    float dropletCount;  // offset 76, 4B

    float rewardPulse;   // offset 80, 4B
    float isDarkMode;    // offset 84, 4B
    float _pad3;         // offset 88, 4B
    float _pad4;         // offset 92, 4B
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

float breathProgress(float x, float seed) {
    float base = smoothstep(0.0, 1.0, x);
    float noise = sin(x * 2.0 + seed) * 0.08;
    return clamp(base + noise, 0.0, 1.0);
}

fragment float4 fluidCirclesFragment(
    VertexOut in [[stage_in]],
    constant FluidUniforms &u [[buffer(0)]]
) {
    float2 uv = in.uv;
    float t = u.phase;
    float aspect = u.resolution.x / u.resolution.y;

    float2 c1 = float2(0.5 + cos(t * 0.65) * 0.32, 0.5 + sin(t * 1.05) * 0.22);
    float2 c2 = float2(0.5 + sin(t * 0.45) * 0.38, 0.5 + cos(t * 0.95) * 0.28);
    float2 c3 = float2(0.5 + cos(t * 0.35) * 0.28, 0.5 + sin(t * 0.55) * 0.36);

    float baseRadius = 0.32;
    float breathScale = breathProgress(u.focusProgress, u.breathSeed);
    float r1 = mix(baseRadius, baseRadius + 0.12 * breathScale, 1.0 - u.focusMode);
    float r2 = baseRadius * 1.05;
    float r3 = baseRadius * 0.95;

    float2 scale_factor = (aspect > 1.0) ? float2(aspect, 1.0) : float2(1.0, 1.0 / aspect);

    float2 d1 = (uv - c1) * scale_factor;
    float2 d2 = (uv - c2) * scale_factor;
    float2 d3 = (uv - c3) * scale_factor;

    float mask1 = step(length(d1), r1);
    float mask2 = step(length(d2), r2);
    float mask3 = step(length(d3), r3);

    float3 finalC1 = u.color1;
    float3 finalC2 = u.color2;
    float3 finalC3 = u.color3;

    float a1 = clamp(mask1, 0.0, 1.0);
    float3 pm1 = finalC1 * a1;

    float a2 = 0.8 * mask2;
    float3 pm2 = finalC2 * a2;
    float3 rgb = pm2 + pm1 * (1.0 - a2);
    float alpha = a2 + a1 * (1.0 - a2);

    float a3 = 0.6 * mask3;
    float3 pm3 = finalC3 * a3;
    rgb = pm3 + rgb * (1.0 - a3);
    alpha = a3 + alpha * (1.0 - a3);

    float3 unmultiplied = rgb / max(alpha, 1e-5);
    return float4(unmultiplied * alpha, alpha);
}

fragment float4 blitTextureFragment(
    VertexOut in [[stage_in]],
    texture2d<float> tex [[texture(0)]],
    constant float4 &compositeParams [[buffer(0)]],
    constant FluidUniforms &u [[buffer(1)]]
) {
    constexpr sampler s(filter::linear, address::clamp_to_edge);
    float4 c = tex.sample(s, in.uv);

    float3 unmultiplied = c.rgb / max(c.a, 1e-5);
    float3 blobColor = pow(max(unmultiplied, 0.0), 1.0 / 2.2);

    float3 bgColor = compositeParams.xyz;
    float opacity = compositeParams.w;

    float3 result = mix(bgColor, blobColor, c.a * opacity);
    return float4(result, 1.0);
}

fragment float extractCoverageFragment(
    VertexOut in [[stage_in]],
    texture2d<float> tex [[texture(0)]]
) {
    constexpr sampler s(filter::linear, address::clamp_to_edge);
    return tex.sample(s, in.uv).a;
}

fragment float4 blitCachedFragment(
    VertexOut in [[stage_in]],
    texture2d<float> frameA [[texture(0)]],
    texture2d<float> frameB [[texture(1)]],
    constant float4 &params [[buffer(0)]],
    constant float4 &compositeParams [[buffer(1)]]
) {
    constexpr sampler s(filter::linear, address::clamp_to_edge);

    float covA = frameA.sample(s, in.uv).r;
    float covB = frameB.sample(s, in.uv).r;
    float coverage = mix(covA, covB, params.x);

    float3 blobColor = params.yzw;
    float3 bgColor = compositeParams.xyz;
    float opacity = compositeParams.w;

    float3 result = mix(bgColor, blobColor, coverage * opacity);
    return float4(result, 1.0);
}
