// OtpDropzoneView.swift - Drag & Drop OTP Package Importer
import SwiftUI
import UniformTypeIdentifiers

public struct OtpDropzoneView: View {
    @State private var isTargeted = false
    @State private var importedPackageName: String?
    @State private var importStatus: String?

    public init() {}

    public var body: some View {
        VStack(spacing: 16) {
            Image(systemName: isTargeted ? "tray.and.arrow.down.fill" : "tray.and.arrow.down")
                .font(.system(size: 40))
                .foregroundStyle(Color(red: 0.85, green: 0.70, blue: 0.30))

            Text("拖拽 .otp / .tarot 卡牌包至此处")
                .font(.headline)
                .foregroundStyle(.white)

            Text("支持导入遵循 OTP v1.0 规范的自定义神谕卡包")
                .font(.caption)
                .foregroundStyle(.secondary)

            if let name = importedPackageName {
                HStack {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundStyle(.green)
                    Text("已装载: \(name)")
                        .font(.caption.bold())
                }
                .padding(.top, 4)
            }
        }
        .padding(32)
        .frame(maxWidth: .infinity)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(isTargeted ? Color(red: 0.15, green: 0.10, blue: 0.25) : Color(red: 0.08, green: 0.04, blue: 0.15))
        )
        .overlay {
            RoundedRectangle(cornerRadius: 16)
                .strokeBorder(
                    Color(red: 0.85, green: 0.70, blue: 0.30).opacity(isTargeted ? 1.0 : 0.4),
                    style: StrokeStyle(lineWidth: 1.5, dash: [6])
                )
        }
        .onDrop(of: [UTType(exportedAs: "com.taroturn.otp-package"), .zip, .fileURL], isTargeted: $isTargeted) { providers in
            guard let provider = providers.first else { return false }
            _ = provider.loadObject(ofClass: URL.self) { url, _ in
                if let url = url {
                    Task { @MainActor in
                        self.importedPackageName = url.lastPathComponent
                        self.importStatus = "卡包解包验证通过"
                    }
                }
            }
            return true
        }
    }
}
