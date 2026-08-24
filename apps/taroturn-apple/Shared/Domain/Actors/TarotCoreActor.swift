// TarotCoreActor.swift - Swift 6 Actor-Isolated Bridge for UniFFI
import Foundation
import TaroturnCore

/// Swift 6 严格并发隔离的 Rust FFI 引擎 Actor
public actor TarotCoreActor {
    public static let shared = TarotCoreActor()

    private init() {}

    /// 执行洗牌并返回不可变的 ReadingSession (Sendable)
    public func drawReadingSession(
        spreadId: String,
        question: String? = nil,
        seedHex: String? = nil,
        reversalRate: Float = 0.5
    ) throws -> ReadingSession {
        return try TaroturnCore.drawReadingSession(
            spreadId: spreadId,
            question: question,
            seedHex: seedHex,
            reversalRate: reversalRate
        )
    }

    /// 获取全部 78 张卡牌标准原型
    public func listAllCards() -> [Card] {
        return TaroturnCore.listAllCards()
    }

    /// 获取内建规范牌阵
    public func listCanonicalSpreads() -> [Spread] {
        return TaroturnCore.listCanonicalSpreads()
    }

    /// 生成 64 字符密码学 CSPRNG 种子
    public func generateRandomSeed() throws -> String {
        return try TaroturnCore.generateRandomSeed()
    }
}
