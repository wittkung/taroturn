# Feature Specification: Native Clients & WeChat Mini Program Integration

- **Feature ID**: `003-native-clients-and-miniprogram`
- **Pipeline Mode**: `[Full SDD]`
- **Status**: `SPECIFIED`
- **Author**: Antigravity / CTO Persona
- **Target Branch**: `main`

---

## 1. Executive Summary & User Value

Taroturn aims to deliver a unified, deterministic, and serene divination sanctuary across all primary digital touchpoints:
1. **WeChat Mini Program (`apps/taroturn-miniprogram`)**: The primary domestic mobile touchpoint in China, offering zero-install instant access, native WeChat OAuth, tactile haptic feedback (`wx.vibrateShort`), subpackage code splitting ($<1.5\text{MB}$ main package), and local offline computation via SSOT core logic.
2. **Apple Native Universal App (`apps/taroturn-apple`)**: Premium macOS and iOS clients crafted with Swift 6 strict concurrency, SwiftUI, `@Observable`, and direct UniFFI C-ABI microkernel bindings (`TaroturnCoreFFI.xcframework`). Features Liquid Glass translucent aesthetics, 3D card physics, and offline-first SwiftData journals.
3. **Multi-Sensory Ritual & Sharing Engine**: Rich tactile haptics, dynamic spring physics (stiffness $210\text{--}340\text{ N/m}$), soundscapes (432Hz singing bowls, temple rain, card riffles via WebAudio/AVAudioEngine), and 300DPI high-resolution exportable divination art scrolls.

---

## 2. User Stories & Acceptance Scenarios

### User Story 1 (P1): WeChat Mini Program Instant Divination & Secure Cloud Sync
> **As a** mobile user on WeChat,  
> **I want to** perform complete, deterministic Tarot divinations offline or online with smooth touch card-flipping and instant WeChat login,  
> **So that** I can gain profound daily guidance without installing heavy native apps or risking privacy leaks.

- **Scenario 1.1 (Offline Instant Draw & WXS Gestures)**:
  - *Given* the user opens the Mini Program with zero network connectivity,
  - *When* they select a spread (e.g. Celtic Cross) and initiate a shuffle,
  - *Then* the draw completes deterministically within $<50\text{ms}$ with full 78-card decan/archetypal interpretations, and card gestures render at steady 60fps via WXS without crossing JS-UI threads.
- **Scenario 1.2 (One-Click WeChat OAuth & Silent 401 Retry)**:
  - *Given* an unauthenticated user,
  - *When* they trigger a protected action (e.g. cloud sync or AI interpretation),
  - *Then* the client invokes `wx.login`, exchanges `code` with `taroturn-server` for a secure JWT, securely stores the token in `wx.setStorageSync`, and automatically replays pending requests.

---

### User Story 2 (P1): Apple SwiftUI Universal Experience (iOS & macOS)
> **As an** Apple ecosystem user,  
> **I want an** authentic, native SwiftUI application on iPhone, iPad, and Mac,  
> **So that** I can experience 120Hz ProMotion 3D card physics, tactile Taptic Engine feedback, and keyboard shortcuts in a desktop/mobile layout.

- **Scenario 2.1 (Direct UniFFI Binding & Strict Concurrency)**:
  - *Given* the Swift 6 application runtime,
  - *When* calling `TarotCoreActor.shared.drawReadingSession(...)`,
  - *Then* it executes directly in native Rust memory with zero network latency and zero memory leaks under Swift 6 Actor isolation.
- **Scenario 2.2 (Topological DAG Canvas)**:
  - *Given* a 10-card Celtic Cross reading,
  - *When* viewing the spread canvas,
  - *Then* directional energy flow lines (`SlotEdge`) and pairwise dignity tension tags are rendered smoothly on a 120Hz SwiftUI `Canvas` with animated Bézier curves.

---

### User Story 3 (P2): Multi-Sensory Zen Ritual & Sharing Art Cards
> **As a** seeker reflecting on a reading,  
> **I want to** hear authentic soundscapes (card riffle, 432Hz singing bowls), feel distinct haptic vibrations upon card flips, and export a beautiful high-resolution art summary,  
> **So that** the experience feels grounded, sacred, and easily shareable.

- **Scenario 3.1 (Tactile Haptic Feedback & Low-Latency Audio)**:
  - *When* dealing or flipping cards, the device triggers synchronized audio ($<5\text{ms}$ latency) and nuanced haptic impulses (`UIImpactFeedbackGenerator` / `wx.vibrateShort`).
- **Scenario 3.2 (300DPI Art Scroll Export)**:
  - *When* tapping "Export Reading", the system renders an editorial long-form 9:16 or 3:4 image card with the question, drawn cards, element chart, and ChaCha20 seed proof using `OffscreenCanvas` (Web/WeChat) or `ImageRenderer` (SwiftUI).

---

## 3. Functional Requirements (FR-###)

- **FR-001**: The WeChat Mini Program MUST operate fully offline for all shuffling, CSP slot constraints, and dignity evaluations using the SSOT canonical core logic and data.
- **FR-002**: The WeChat Mini Program MUST implement silent `wx.login` credential exchange against `/api/v1/auth/wechat`, saving the JWT in `wx.setStorageSync` with automatic 401 interception and replay.
- **FR-003**: The WeChat Mini Program MUST maintain a main package size $<1.5\text{MB}$ by placing the heavy divination board into a preloadable subpackage (`subpackages/tarot`).
- **FR-004**: The Apple SwiftUI client MUST link `taroturn_core` via an XCFramework / local SPM package built with UniFFI (`libtaroturn_core.a` supporting macOS universal, iOS device, and iOS simulator).
- **FR-005**: The Apple client MUST support dynamic adaptive layouts across iPhone (vertical scroll/carousel), iPad, and macOS (3-column Zen workspace) under Swift 6 strict concurrency.
- **FR-006**: All clients MUST render topological DAG edges (`SlotEdge`) with visual relationship indicators (Crosses, FlowsTo, Supports, Opposes, Illuminates, Synthesizes, Reflects).
- **FR-007**: The system MUST provide synchronized audio/haptic cues during shuffle, cut, deal, and flip operations using dedicated memory-buffered sound engines.
- **FR-008**: The system MUST render high-resolution (300DPI / 3x Retina) summary scrolls for reading export without server-side rendering dependencies.

---

## 4. Success Criteria (SC-###)

- **SC-001**: WeChat Mini Program main package size remains $<1.5\text{MB}$ with instantaneous initial startup ($<400\text{ms}$).
- **SC-002**: Native SwiftUI app achieves steady 60fps/120fps animation during 3D card flips and drag gestures with zero dropped frames.
- **SC-003**: 100% parity of card IDs, spread layouts, and dignity tensors across Web, Mini Program, CLI, and Apple clients for any identical 64-char seed.
- **SC-004**: Zero memory leaks or Swift 6 concurrency warnings under Xcode Clang/Swift 6 static analysis.
