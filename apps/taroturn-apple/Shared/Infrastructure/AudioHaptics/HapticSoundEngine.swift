// HapticSoundEngine.swift - Apple CoreHaptics & Spatial Audio Engine
import Foundation
import CoreHaptics
import AVFoundation

#if os(iOS)
import UIKit
#elseif os(macOS)
import AppKit
#endif

@MainActor
public final class HapticSoundEngine {
    public static let shared = HapticSoundEngine()

    private var hapticEngine: CHHapticEngine?
    private var isEngineRunning = false

    private init() {
        setupHaptics()
    }

    private func setupHaptics() {
        guard CHHapticEngine.capabilitiesForHardware().supportsHaptics else { return }
        do {
            hapticEngine = try CHHapticEngine()
            try hapticEngine?.start()
            isEngineRunning = true

            hapticEngine?.resetHandler = { [weak self] in
                do {
                    try self?.hapticEngine?.start()
                } catch {
                    print("[HapticSoundEngine] Reset failed: \(error)")
                }
            }
        } catch {
            print("[HapticSoundEngine] Initialization failed: \(error)")
        }
    }

    /// 触发卡牌洗牌切牌震动
    public func triggerCardRiffle() {
        #if os(iOS)
        let impact = UIImpactFeedbackGenerator(style: .medium)
        impact.impactOccurred()
        #elseif os(macOS)
        NSHapticFeedbackManager.defaultPerformer.perform(
            .alignment,
            performanceTime: .now
        )
        #endif
    }

    /// 触发卡牌翻转顿感
    public func triggerCardFlip() {
        #if os(iOS)
        let impact = UIImpactFeedbackGenerator(style: .rigid)
        impact.impactOccurred(intensity: 0.85)
        #elseif os(macOS)
        NSHapticFeedbackManager.defaultPerformer.perform(
            .levelChange,
            performanceTime: .now
        )
        #endif
    }

    /// 触发仪式完成共鸣
    public func triggerRitualCompletion() {
        #if os(iOS)
        let notification = UINotificationFeedbackGenerator()
        notification.notificationOccurred(.success)
        #elseif os(macOS)
        NSHapticFeedbackManager.defaultPerformer.perform(
            .generic,
            performanceTime: .now
        )
        #endif
    }
}
