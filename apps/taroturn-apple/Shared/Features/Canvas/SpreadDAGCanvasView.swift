// SpreadDAGCanvasView.swift - 120Hz ProMotion Topological Canvas
import SwiftUI
import TaroturnCore

public struct SpreadDAGCanvasView: View {
    let spread: Spread
    let session: ReadingSession?
    let activeSlotId: UInt8?

    public init(spread: Spread, session: ReadingSession?, activeSlotId: UInt8?) {
        self.spread = spread
        self.session = session
        self.activeSlotId = activeSlotId
    }

    public var body: some View {
        Canvas { context, size in
            let slots = spread.slots
            guard slots.count > 1 else { return }

            let center = CGPoint(x: size.width / 2, y: size.height / 2)
            let scale: CGFloat = min(size.width, size.height) * 0.42

            for i in 0..<(slots.count - 1) {
                let srcSlot = slots[i]
                let tgtSlot = slots[i + 1]

                let srcPt = CGPoint(
                    x: center.x + CGFloat(srcSlot.x) * scale,
                    y: center.y + CGFloat(srcSlot.y) * scale
                )
                let tgtPt = CGPoint(
                    x: center.x + CGFloat(tgtSlot.x) * scale,
                    y: center.y + CGFloat(tgtSlot.y) * scale
                )

                var path = Path()
                path.move(to: srcPt)

                let midX = (srcPt.x + tgtPt.x) / 2
                let midY = (srcPt.y + tgtPt.y) / 2
                let dx = tgtPt.x - srcPt.x
                let dy = tgtPt.y - srcPt.y
                let normal = CGPoint(x: -dy * 0.15, y: dx * 0.15)
                let control = CGPoint(x: midX + normal.x, y: midY + normal.y)

                path.addQuadCurve(to: tgtPt, control: control)

                let isHighlighted = (activeSlotId == srcSlot.slotId || activeSlotId == tgtSlot.slotId)
                let color = isHighlighted ? Color(red: 0.95, green: 0.85, blue: 0.45) : Color.cyan.opacity(0.5)
                let style = StrokeStyle(lineWidth: isHighlighted ? 2.5 : 1.2, lineCap: .round)

                context.stroke(path, with: .color(color), style: style)
            }
        }
    }
}
