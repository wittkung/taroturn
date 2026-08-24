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
            let slotMap = Dictionary(uniqueKeysWithValues: spread.slots.map { ($0.slotId, $0) })
            let center = CGPoint(x: size.width / 2, y: size.height / 2)
            let scale: CGFloat = min(size.width, size.height) * 0.42

            for edge in spread.edges {
                guard let srcSlot = slotMap[edge.sourceSlotId],
                      let tgtSlot = slotMap[edge.targetSlotId] else { continue }

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

                let isHighlighted = (activeSlotId == edge.sourceSlotId || activeSlotId == edge.targetSlotId)
                let color = edgeColor(for: edge.relation, isHighlighted: isHighlighted)
                let style = StrokeStyle(lineWidth: isHighlighted ? 2.5 : 1.2, lineCap: .round)

                context.stroke(path, with: .color(color), style: style)
            }
        }
    }

    private func edgeColor(for relation: SlotRelationType, isHighlighted: Bool) -> Color {
        if isHighlighted { return Color(red: 0.95, green: 0.85, blue: 0.45) }
        switch relation {
        case .crosses: return Color.red.opacity(0.6)
        case .flowsTo: return Color.cyan.opacity(0.5)
        case .supports: return Color.green.opacity(0.5)
        case .opposes: return Color.purple.opacity(0.6)
        case .illuminates: return Color.yellow.opacity(0.6)
        case .synthesizes: return Color.orange.opacity(0.5)
        case .reflects: return Color.blue.opacity(0.5)
        }
    }
}
