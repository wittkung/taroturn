// TarotLogger.swift - High-Precision App & Rust Kernel Diagnostics Logger
import Foundation
import os.log

public struct LogEntry: Identifiable, Sendable {
    public let id = UUID()
    public let timestamp: Date
    public let level: LogLevel
    public let category: String
    public let message: String

    public var formattedTime: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "HH:mm:ss.SSS"
        return formatter.string(from: timestamp)
    }
}

public enum LogLevel: String, Sendable {
    case debug = "DEBUG"
    case info = "INFO"
    case warning = "WARN"
    case error = "ERROR"

    public var icon: String {
        switch self {
        case .debug: return "🔍"
        case .info: return "🔮"
        case .warning: return "⚠️"
        case .error: return "❌"
        }
    }
}

public final class TarotLogger: @unchecked Sendable {
    public static let shared = TarotLogger()

    private let lock = NSLock()
    private var _logs: [LogEntry] = []
    private let logFileURL: URL?

    public var logs: [LogEntry] {
        lock.lock()
        defer { lock.unlock() }
        return _logs
    }

    private init() {
        if let logsDir = FileManager.default.urls(for: .libraryDirectory, in: .userDomainMask).first?.appendingPathComponent("Logs/Taroturn", isDirectory: true) {
            try? FileManager.default.createDirectory(at: logsDir, withIntermediateDirectories: true)
            self.logFileURL = logsDir.appendingPathComponent("taroturn.log")
        } else {
            self.logFileURL = nil
        }
        self.log(level: .info, category: "Kernel", message: "Taroturn Sanctuary Engine 启动已就绪")
    }

    public func log(level: LogLevel = .info, category: String = "App", message: String) {
        let entry = LogEntry(timestamp: Date(), level: level, category: category, message: message)

        lock.lock()
        _logs.append(entry)
        if _logs.count > 500 {
            _logs.removeFirst(_logs.count - 500)
        }
        lock.unlock()

        let line = "[\(entry.formattedTime)] [\(entry.category)] [\(entry.level.rawValue)] \(entry.message)"
        print("\(entry.level.icon) \(line)")

        if let fileURL = logFileURL, let data = "\(line)\n".data(using: .utf8) {
            if FileManager.default.fileExists(atPath: fileURL.path) {
                if let fileHandle = try? FileHandle(forWritingTo: fileURL) {
                    fileHandle.seekToEndOfFile()
                    fileHandle.write(data)
                    try? fileHandle.close()
                }
            } else {
                try? data.write(to: fileURL, options: .atomic)
            }
        }
    }
}
