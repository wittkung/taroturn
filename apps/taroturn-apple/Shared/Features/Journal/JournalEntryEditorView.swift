// JournalEntryEditorView.swift - Native Markdown Reflection Journal
import SwiftUI
import SwiftData

public struct JournalEntryEditorView: View {
    @Bindable var record: ReadingRecord
    @State private var markdownContent: String = ""
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var modelContext

    public init(record: ReadingRecord) {
        self.record = record
    }

    public var body: some View {
        NavigationStack {
            VStack(alignment: .leading, spacing: 16) {
                // Header details
                VStack(alignment: .leading, spacing: 4) {
                    Text(record.spreadTitleZh)
                        .font(.headline)
                        .foregroundStyle(Color(red: 0.85, green: 0.70, blue: 0.30))
                    if let q = record.question {
                        Text("议题: \(q)")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }
                .padding(.horizontal)

                Divider()

                Text("灵修与悟境笔记 (Markdown)")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .padding(.horizontal)

                TextEditor(text: $markdownContent)
                    .font(.body.monospaced())
                    .padding(8)
                    .background(Color(red: 0.10, green: 0.06, blue: 0.18))
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                    .padding(.horizontal)

                Spacer()
            }
            .padding(.top)
            .background(Color(red: 0.06, green: 0.03, blue: 0.12).ignoresSafeArea())
            .navigationTitle("心得录记")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("取消") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("保存") {
                        let entry = JournalEntryRecord(
                            id: UUID(),
                            createdAt: Date(),
                            updatedAt: Date(),
                            contentMarkdown: markdownContent,
                            moodTags: ["直觉", "洞察"],
                            reading: record
                        )
                        modelContext.insert(entry)
                        try? modelContext.save()
                        dismiss()
                    }
                    .foregroundStyle(Color(red: 0.85, green: 0.70, blue: 0.30))
                }
            }
        }
    }
}
