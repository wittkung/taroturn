// PencilKitSpreadCanvasView.swift - iPadOS Apple Pencil Freehand Annotation Canvas
import SwiftUI

#if os(iOS)
import PencilKit

public struct PencilKitCanvasWrapper: UIViewRepresentable {
    @Binding var canvasView: PKCanvasView
    @Binding var toolPickerIsActive: Bool

    public init(canvasView: Binding<PKCanvasView>, toolPickerIsActive: Binding<Bool>) {
        self._canvasView = canvasView
        self._toolPickerIsActive = toolPickerIsActive
    }

    public func makeUIView(context: Context) -> PKCanvasView {
        canvasView.drawingPolicy = .anyInput
        canvasView.backgroundColor = .clear
        canvasView.isOpaque = false

        if toolPickerIsActive {
            let toolPicker = PKToolPicker()
            toolPicker.setVisible(true, forFirstResponder: canvasView)
            toolPicker.addObserver(canvasView)
            canvasView.becomeFirstResponder()
        }

        return canvasView
    }

    public func updateUIView(_ uiView: PKCanvasView, context: Context) {}
}

public struct PencilKitSpreadCanvasView: View {
    @State private var canvasView = PKCanvasView()
    @State private var isToolPickerActive = true

    public init() {}

    public var body: some View {
        ZStack {
            // Background Canvas / Spread Content
            Color.clear

            // PencilKit overlay
            PencilKitCanvasWrapper(
                canvasView: $canvasView,
                toolPickerIsActive: $isToolPickerActive
            )
        }
    }
}
#endif
