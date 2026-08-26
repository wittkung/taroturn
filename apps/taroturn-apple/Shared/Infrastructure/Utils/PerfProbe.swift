// PerfProbe.swift - Lightweight Performance Diagnostic Probe (ittime spec)
import Foundation

#if DEBUG
final class PerfProbe: @unchecked Sendable {
    static let shared = PerfProbe()

    struct Counter {
        var count: Int = 0
        var totalMs: Double = 0
        var maxMs: Double = 0
    }

    private var counters: [String: Counter] = [:]
    private let lock = NSLock()

    private init() {}

    func tick(_ name: String) {
        lock.lock()
        defer { lock.unlock() }
        counters[name, default: Counter()].count += 1
    }

    func measure(_ name: String, durationMs: Double) {
        lock.lock()
        defer { lock.unlock() }
        var c = counters[name, default: Counter()]
        c.count += 1
        c.totalMs += durationMs
        c.maxMs = max(c.maxMs, durationMs)
        counters[name] = c
    }

    func timed<T>(_ name: String, _ block: () -> T) -> T {
        let t0 = CFAbsoluteTimeGetCurrent()
        let result = block()
        let ms = (CFAbsoluteTimeGetCurrent() - t0) * 1000
        measure(name, durationMs: ms)
        return result
    }
}
#else
final class PerfProbe: @unchecked Sendable {
    static let shared = PerfProbe()
    private init() {}
    @inline(__always) func tick(_ name: String) {}
    @inline(__always) func measure(_ name: String, durationMs: Double) {}
    @inline(__always) func timed<T>(_ name: String, _ block: () -> T) -> T { block() }
}
#endif
