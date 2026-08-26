// LiquidFluidBackgroundView.swift - Strict Monochromatic 3-Sphere Fluid Engine (1:1 ittime / TTZip alignment)
import SwiftUI

public struct LiquidFluidBackgroundView: View {
    public var isDark: Bool
    public var speed: Double

    public init(isDark: Bool = true, speed: Double = 0.35) {
        self.isDark = isDark
        self.speed = speed
    }

    public var body: some View {
        ZStack {
            // Base background
            (isDark ? Color(red: 0.03, green: 0.02, blue: 0.07) : Color(red: 0.98, green: 0.98, blue: 0.99))
                .ignoresSafeArea()

            // Dynamic 3-Sphere fluid motion canvas
            TimelineView(.animation(minimumInterval: 1.0 / 60.0)) { timeline in
                let now = timeline.date.timeIntervalSinceReferenceDate
                let phase = now * speed

                Canvas { context, size in
                    let w = size.width
                    let h = size.height

                    context.addFilter(.blur(radius: 65))

                    // ─── 3-Frequency Chaotic Trajectory (TTZip / ittime spec) ───
                    let x1 = w / 2 + CGFloat(cos(phase * 0.65)) * (w * 0.32)
                    let y1 = h / 2 + CGFloat(sin(phase * 1.05)) * (h * 0.22)

                    let x2 = w / 2 + CGFloat(sin(phase * 0.45)) * (w * 0.38)
                    let y2 = h / 2 + CGFloat(cos(phase * 0.95)) * (h * 0.28)

                    let x3 = w / 2 + CGFloat(cos(phase * 0.35)) * (w * 0.28)
                    let y3 = h / 2 + CGFloat(sin(phase * 0.55)) * (h * 0.36)

                    let radius = min(w, h) * 0.65

                    // Monochromatic Amethyst/Purple Base (Dark: #9333EA / Light: #8B5CF6)
                    let baseColor = isDark
                        ? Color(red: 0.58, green: 0.20, blue: 0.92)
                        : Color(red: 0.55, green: 0.36, blue: 0.96)

                    let alpha1: Double = isDark ? 0.55 : 0.22

                    // Sphere 1: baseColor (100% relative main opacity)
                    var path1 = Path()
                    path1.addEllipse(in: CGRect(x: x1 - radius / 2, y: y1 - radius / 2, width: radius, height: radius))
                    context.fill(path1, with: .color(baseColor.opacity(alpha1)))

                    // Sphere 2: baseColor (80% relative main opacity)
                    var path2 = Path()
                    let r2 = radius * 1.05
                    path2.addEllipse(in: CGRect(x: x2 - r2 / 2, y: y2 - r2 / 2, width: r2, height: r2))
                    context.fill(path2, with: .color(baseColor.opacity(alpha1 * 0.8)))

                    // Sphere 3: baseColor (60% relative main opacity)
                    var path3 = Path()
                    let r3 = radius * 0.95
                    path3.addEllipse(in: CGRect(x: x3 - r3 / 2, y: y3 - r3 / 2, width: r3, height: r3))
                    context.fill(path3, with: .color(baseColor.opacity(alpha1 * 0.6)))
                }
            }
            .ignoresSafeArea()

            // Subtle washi grid / starfield point matrix overlay
            GeometryReader { geo in
                Canvas { context, size in
                    let step: CGFloat = 36
                    let cols = Int(size.width / step) + 1
                    let rows = Int(size.height / step) + 1

                    for c in 0..<cols {
                        for r in 0..<rows {
                            let rect = CGRect(x: CGFloat(c) * step, y: CGFloat(r) * step, width: 1.2, height: 1.2)
                            let dotColor = isDark ? Color.white.opacity(0.04) : Color(red: 0.55, green: 0.36, blue: 0.96).opacity(0.03)
                            context.fill(Path(ellipseIn: rect), with: .color(dotColor))
                        }
                    }
                }
            }
            .ignoresSafeArea()
        }
    }
}
