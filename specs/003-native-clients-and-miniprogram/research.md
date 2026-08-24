# Research: Multi-Platform Architecture & Sensory Engine Decisions

- **Feature ID**: `003-native-clients-and-miniprogram`
- **Specification**: [spec.md](./spec.md)
- **Status**: `COMPLETED`

---

## 1. Technical Decisions & Rationales

### Decision 1: WeChat Mini Program Hybrid Subpackage & WXS 3D Rendering
- **Chosen Approach**: Subpackage splitting with main package $<500\text{KB}$, WXS render-thread 3D gesture manipulation, and `wx.createWebAudioContext()` for low-latency SFX.
- **Rationale**: Standard `setData` in `touchmove` introduces 16ms IPC jitter, causing dropped frames during 3D card flips. WXS operates directly in the render context, guaranteeing 60fps smoothness.
- **Alternatives Evaluated**:
  - *Skyline Worklet*: Superior physics but limited compatibility on older WeChat versions.
  - *Full WASM in Main Package*: Exceeds main package budget and delays initial cold start by 65ms on iOS JavaScriptCore.

---

### Decision 2: Apple SwiftUI Universal Native Architecture (Swift 6 + UniFFI)
- **Chosen Approach**: Swift 6 Complete Concurrency, `@Observable` Macro state management, `TarotCoreActor` background isolation, and UniFFI Universal XCFramework.
- **Rationale**: Swift 6 eliminates data races at compile time. `@Observable` provides property-level dependency tracking, preventing unnecessary full-view re-renders on 120Hz ProMotion displays.
- **Alternatives Evaluated**:
  - *Flutter / React Native*: Cross-platform but sacrifices Apple Silicon native Metal glassmorphism, ProMotion 120Hz responsiveness, and StoreKit 2 local JWS verification.
  - *Direct C-FFI without UniFFI*: High boilerplate and error-prone memory management.

---

### Decision 3: Multi-Sensory Zen Soundscapes & 4-Stage Spring Dynamics
- **Chosen Approach**: Harmonic 432Hz/528Hz singing bowls with exponential decay ($T_{60}=6.5\text{s}$) + temple rain filtering ($4.5\text{kHz}$ low-pass), combined with 2nd-order damped harmonic oscillators (stiffness $210\text{--}340\text{ N/m}$, damping ratio $0.60\text{--}0.83$).
- **Rationale**: Divination requires profound tranquility. Pre-decoded in-memory audio buffers eliminate network audio stutter, and synchronized micro-haptics ground the digital ritual in physical reality.
- **Alternatives Evaluated**:
  - *Synthesized Web Audio Oscillators*: Low file footprint but lacks authentic overtone resonance of bronze singing bowls.
