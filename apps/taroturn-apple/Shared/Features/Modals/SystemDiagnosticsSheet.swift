// SystemDiagnosticsSheet.swift - Terminal Glass HUD Diagnostics (ui-ux-pro-max + Hacker Terminal Standard)
import SwiftUI
import AppKit

public struct SystemDiagnosticsSheet: View {
    @Environment(\.dismiss) private var dismiss
    @State private var logs: [LogEntry] = TarotLogger.shared.logs
    @State private var filterCategory: String = "ALL"
    @State private var copied: Bool = false

    public init() {}

    private var filteredLogs: [LogEntry] {
        if filterCategory == "ALL" { return logs }
        return logs.filter { $0.category.uppercased() == filterCategory }
    }

    public var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Top Terminal Status Bar
                HStack(spacing: 12) {
                    HStack(spacing: 6) {
                        Circle().fill(Color.green).frame(width: 8, height: 8)
                        Text("ONLINE")
                            .font(.system(size: 10, weight: .bold, design: .monospaced))
                            .foregroundStyle(Color.green)
                    }

                    Text("· Metal GPU 60Hz · Rust FFI Active · SQLite Local")
                        .font(.system(size: 11, design: .monospaced))
                        .foregroundStyle(Color.primary.opacity(0.8))

                    Spacer()

                    // Category Filter Pills
                    HStack(spacing: 4) {
                        ForEach(["ALL", "KERNEL", "RITUAL", "ERROR"], id: \.self) { cat in
                            Button {
                                filterCategory = cat
                            } label: {
                                Text(cat)
                                    .font(.system(size: 10, weight: .bold, design: .monospaced))
                                    .padding(.horizontal, 7)
                                    .padding(.vertical, 3)
                                    .background(filterCategory == cat ? TarotTheme.kintsugiGold.opacity(0.25) : Color.primary.opacity(0.05))
                                    .foregroundStyle(filterCategory == cat ? TarotTheme.kintsugiGold : Color.secondary)
                                    .clipShape(RoundedRectangle(cornerRadius: 4))
                            }
                            .buttonStyle(.plain)
                        }
                    }

                    // Copy Logs Button
                    Button {
                        let fullLogText = logs.map { "[\($0.formattedTime)] [\($0.category)] \($0.message)" }.joined(separator: "\n")
                        NSPasteboard.general.clearContents()
                        NSPasteboard.general.setString(fullLogText, forType: .string)
                        copied = true
                        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
                            copied = false
                        }
                    } label: {
                        HStack(spacing: 4) {
                            Image(systemName: copied ? "checkmark" : "doc.on.doc")
                            Text(copied ? "已复制" : "复制全部")
                        }
                        .font(.system(size: 10, weight: .bold, design: .monospaced))
                        .foregroundStyle(TarotTheme.kintsugiGold)
                        .padding(.horizontal, 7)
                        .padding(.vertical, 3)
                        .background(Color.primary.opacity(0.05))
                        .clipShape(RoundedRectangle(cornerRadius: 4))
                    }
                    .buttonStyle(.plain)

                    // Refresh Button
                    Button {
                        logs = TarotLogger.shared.logs
                    } label: {
                        Image(systemName: "arrow.clockwise")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundStyle(TarotTheme.kintsugiGold)
                    }
                    .buttonStyle(.plain)
                }
                .padding(.horizontal, 14)
                .padding(.vertical, 10)
                .background(Color.primary.opacity(0.04))

                Divider().background(Color.primary.opacity(0.08))

                // Real-Time Monospaced Log Stream
                ScrollViewReader { proxy in
                    ScrollView {
                        LazyVStack(alignment: .leading, spacing: 4) {
                            ForEach(filteredLogs) { entry in
                                HStack(alignment: .top, spacing: 8) {
                                    Text(entry.formattedTime)
                                        .font(.system(size: 10, design: .monospaced))
                                        .foregroundStyle(.secondary)

                                    Text("[\(entry.category)]")
                                        .font(.system(size: 10, weight: .bold, design: .monospaced))
                                        .foregroundStyle(
                                            entry.category == "Kernel" ? TarotTheme.mysticCyan :
                                            (entry.category == "Ritual" ? TarotTheme.kintsugiGold : TarotTheme.celestialPurple)
                                        )

                                    Text(entry.message)
                                        .font(.system(size: 11, design: .monospaced))
                                        .foregroundStyle(
                                            entry.level == .error ? Color.red :
                                            (entry.level == .warning ? Color.yellow : Color.primary.opacity(0.9))
                                        )
                                }
                                .padding(.horizontal, 14)
                                .padding(.vertical, 2)
                                .id(entry.id)
                            }
                        }
                        .padding(.vertical, 8)
                    }
                    .onAppear {
                        if let last = filteredLogs.last {
                            proxy.scrollTo(last.id, anchor: .bottom)
                        }
                    }
                }
            }
            .background(VisualEffectView(material: .hudWindow, blendingMode: .behindWindow, state: .active))
            .background(.ultraThinMaterial)
            .navigationTitle("圣殿微内核诊断与运行日志")
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("关闭") { dismiss() }
                }
            }
        }
        .frame(minWidth: 720, minHeight: 460)
    }
}
