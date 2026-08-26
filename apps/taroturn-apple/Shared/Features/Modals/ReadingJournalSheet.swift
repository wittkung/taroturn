// ReadingJournalSheet.swift - SwiftData Synchronized Reading Journal (ui-ux-pro-max + TTZip Standard)
import SwiftUI
import SwiftData
import TaroturnCore

public struct ReadingJournalView: View {
    @Query(sort: \ReadingRecord.createdAt, order: .reverse) private var savedReadings: [ReadingRecord]
    @State private var selectedRecordId: UUID?

    public init() {}

    private var selectedRecord: ReadingRecord? {
        if let id = selectedRecordId {
            return savedReadings.first(where: { $0.id == id })
        }
        return savedReadings.first
    }

    public var body: some View {
        HStack(spacing: 0) {
            // Left Column: Historical Readings List
            VStack(alignment: .leading, spacing: 0) {
                HStack {
                    Text("推演档案手记")
                        .font(.system(size: 12, weight: .bold, design: .serif))
                        .foregroundStyle(TarotTheme.kintsugiGold)
                    Spacer()
                    Text("\(savedReadings.count) 卷")
                        .font(.system(size: 11, design: .monospaced))
                        .foregroundStyle(.secondary)
                }
                .padding(14)
                .background(Color.primary.opacity(0.02))

                Divider().background(Color.primary.opacity(0.08))

                if savedReadings.isEmpty {
                    VStack(spacing: 12) {
                        Spacer()
                        Image(systemName: "clock.arrow.circlepath")
                            .font(.system(size: 36))
                            .foregroundStyle(TarotTheme.kintsugiGold.opacity(0.6))
                        Text("暂无推演历史")
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundStyle(Color.primary)
                        Text("在圣所完成一次密码学洗牌推演后，记录将自动加密保存至本地 SQLite 数据库。")
                            .font(.system(size: 11))
                            .foregroundStyle(.secondary)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 20)
                        Spacer()
                    }
                } else {
                    List(selection: $selectedRecordId) {
                        ForEach(savedReadings) { record in
                            VStack(alignment: .leading, spacing: 6) {
                                HStack {
                                    Text(record.spreadTitleZh)
                                        .font(.system(size: 13, weight: .bold))
                                        .foregroundStyle(record.id == selectedRecord?.id ? TarotTheme.kintsugiGold : Color.primary)
                                    Spacer()
                                    Text(record.createdAt.formatted(date: .abbreviated, time: .shortened))
                                        .font(.system(size: 10, design: .monospaced))
                                        .foregroundStyle(.secondary)
                                }

                                if let q = record.question, !q.isEmpty {
                                    Text(q)
                                        .font(.system(size: 11))
                                        .foregroundStyle(Color.primary.opacity(0.85))
                                        .lineLimit(1)
                                }

                                HStack(spacing: 6) {
                                    Text("主导: \(record.dominantElement)")
                                        .font(.system(size: 9))
                                        .padding(.horizontal, 6)
                                        .padding(.vertical, 1.5)
                                        .background(Capsule().fill(TarotTheme.celestialPurple.opacity(0.18)))
                                        .foregroundStyle(Color.primary.opacity(0.85))

                                    Text("契合度: \(Int(record.harmonyScore * 100))%")
                                        .font(.system(size: 9, design: .monospaced))
                                        .foregroundStyle(TarotTheme.kintsugiGold)
                                }
                            }
                            .padding(.vertical, 4)
                            .tag(record.id)
                        }
                    }
                    .listStyle(.sidebar)
                }
            }
            .frame(width: 290)
            .background(VisualEffectView(material: .sidebar, blendingMode: .behindWindow, state: .active))

            Divider().background(Color.primary.opacity(0.1))

            // Right Column: Detail Inspector
            if let record = selectedRecord {
                ScrollView {
                    VStack(alignment: .leading, spacing: 20) {
                        // Header Meta
                        VStack(alignment: .leading, spacing: 6) {
                            HStack {
                                Text(record.spreadTitleZh)
                                    .font(.system(size: 20, weight: .bold, design: .serif))
                                    .foregroundStyle(TarotTheme.kintsugiGold)
                                Spacer()
                                Text(record.createdAt.formatted(date: .long, time: .standard))
                                    .font(.system(size: 12, design: .monospaced))
                                    .foregroundStyle(.secondary)
                            }

                            if let q = record.question, !q.isEmpty {
                                Text("“\(q)”")
                                    .font(.system(size: 14, weight: .medium, design: .serif))
                                    .foregroundStyle(Color.primary)
                                    .italic()
                                    .padding(.vertical, 4)
                            }
                        }
                        .padding(.bottom, 8)
                        .overlay(Rectangle().frame(height: 1).foregroundStyle(TarotTheme.headerHairline), alignment: .bottom)

                        // Cryptographic Seed
                        VStack(alignment: .leading, spacing: 6) {
                            Text("密码学种子校验 (ChaCha20 256-bit)")
                                .font(.system(size: 12, weight: .bold, design: .serif))
                                .foregroundStyle(TarotTheme.kintsugiGold)

                            Text(record.rngSeedHex)
                                .font(.system(size: 10, design: .monospaced))
                                .foregroundStyle(.secondary)
                                .textSelection(.enabled)
                        }
                        .padding(12)
                        .background(Color.primary.opacity(0.03))
                        .clipShape(RoundedRectangle(cornerRadius: 10))

                        // Elemental Diagnostics
                        VStack(alignment: .leading, spacing: 8) {
                            Text("主导元素与尊位和谐度")
                                .font(.system(size: 13, weight: .bold, design: .serif))
                                .foregroundStyle(Color.primary)

                            HStack(spacing: 12) {
                                Text("主导元素: \(record.dominantElement)")
                                    .font(.system(size: 12, weight: .medium))
                                    .foregroundStyle(TarotTheme.kintsugiGold)

                                Text("和谐得分: \(Int(record.harmonyScore * 100))%")
                                    .font(.system(size: 12, design: .monospaced))
                                    .foregroundStyle(.secondary)
                            }
                        }
                        .padding(14)
                        .background(
                            RoundedRectangle(cornerRadius: 12)
                                .fill(Color.primary.opacity(0.03))
                                .overlay(
                                    RoundedRectangle(cornerRadius: 12)
                                        .strokeBorder(Color.primary.opacity(0.08), lineWidth: 0.8)
                                )
                        )

                        // Journal Entries
                        if !record.journalEntries.isEmpty {
                            VStack(alignment: .leading, spacing: 10) {
                                Text("随记心智手记 (\(record.journalEntries.count) 条)")
                                    .font(.system(size: 13, weight: .bold, design: .serif))
                                    .foregroundStyle(Color.primary)

                                ForEach(record.journalEntries) { entry in
                                    VStack(alignment: .leading, spacing: 4) {
                                        Text(entry.contentMarkdown)
                                            .font(.system(size: 12))
                                            .foregroundStyle(Color.primary.opacity(0.9))
                                            .lineSpacing(4)
                                        Text(entry.createdAt.formatted(date: .abbreviated, time: .shortened))
                                            .font(.system(size: 9, design: .monospaced))
                                            .foregroundStyle(.secondary)
                                    }
                                    .padding(12)
                                    .background(Color.primary.opacity(0.02))
                                    .clipShape(RoundedRectangle(cornerRadius: 8))
                                }
                            }
                        }
                    }
                    .padding(24)
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else {
                VStack(spacing: 8) {
                    Image(systemName: "doc.text")
                        .font(.system(size: 32))
                        .foregroundStyle(.secondary)
                    Text("选择左侧推演卷宗以检视详情")
                        .font(.system(size: 13))
                        .foregroundStyle(.secondary)
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

public struct ReadingJournalSheet: View {
    @Environment(\.dismiss) private var dismiss

    public init() {}

    public var body: some View {
        NavigationStack {
            ReadingJournalView()
                .background(VisualEffectView(material: .underWindowBackground, blendingMode: .behindWindow, state: .active))
                .background(.ultraThinMaterial)
                .navigationTitle("圣所历史账本 · 占卜复盘")
                .toolbar {
                    ToolbarItem(placement: .confirmationAction) {
                        Button("完成") { dismiss() }
                            .keyboardShortcut(.defaultAction)
                    }
                }
        }
        .frame(minWidth: 840, minHeight: 600)
    }
}
