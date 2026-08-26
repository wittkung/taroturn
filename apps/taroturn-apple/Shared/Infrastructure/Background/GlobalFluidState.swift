// GlobalFluidState.swift - Organic Phase Coordinator (ittime spec)
import Foundation
import QuartzCore

@MainActor
public final class GlobalFluidState {
    public static let shared = GlobalFluidState()

    private init() {}

    private var phase: Double = Double.random(in: 0...100)
    private var lastTime: Double = CACurrentMediaTime()

    public func currentPhase(speed: Double) -> Double {
        let now = CACurrentMediaTime()
        let delta = now - lastTime

        if delta > 0.005 {
            phase += min(delta, 0.1) * speed
            lastTime = now
        }
        return phase
    }
}
