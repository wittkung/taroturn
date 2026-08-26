// ReadingViewModelTests.swift - Real Cryptographic & Reading Engine Unit Tests
import XCTest
import TaroturnCore

final class ReadingViewModelTests: XCTestCase {
    
    /// 测试 78 张全景塔罗卡牌图谱完整性与 ID 唯一性
    func testAllCardsArchetypeCatalogIntegrity() {
        let cards = listAllCards()
        XCTAssertEqual(cards.count, 78, "Standard Tarot deck must contain exactly 78 cards")
        
        let uniqueIds = Set(cards.map { $0.id })
        XCTAssertEqual(uniqueIds.count, 78, "All 78 cards must have unique IDs from 0 to 77")
        
        // 验证大阿卡纳 (22张) 与小阿卡纳 (56张)
        let majorCount = cards.filter { $0.arcana == .major }.count
        let minorCount = cards.filter { $0.arcana == .minor }.count
        XCTAssertEqual(majorCount, 22, "Major Arcana must contain 22 archetypes (0..21)")
        XCTAssertEqual(minorCount, 56, "Minor Arcana must contain 56 elemental cards (22..77)")
    }
    
    /// 测试密码学 ChaCha20 CSPRNG 随机种子生成与熵特征
    func testRandomSeedGenerationAndEntropy() throws {
        let seed1 = try generateRandomSeed()
        let seed2 = try generateRandomSeed()
        
        XCTAssertEqual(seed1.count, 64, "Seed must be 64 hexadecimal characters (256-bit entropy)")
        XCTAssertEqual(seed2.count, 64, "Seed must be 64 hexadecimal characters (256-bit entropy)")
        XCTAssertNotEqual(seed1, seed2, "Consecutive CSPRNG seeds must be cryptographically distinct")
        
        // 验证字符集仅包含 0-9, a-f
        let hexCharacterSet = CharacterSet(charactersIn: "0123456789abcdef")
        XCTAssertTrue(seed1.unicodeScalars.allSatisfy { hexCharacterSet.contains($0) })
    }
    
    /// 测试相同随机数种子下的确定性推演抽牌 (Deterministic Replay)
    func testDeterministicReadingSessionReplay() throws {
        let seed = try generateRandomSeed()
        let spreadId = "three_cards_time"
        
        // 第一次推演
        let sessionA = try drawReadingSession(
            spreadId: spreadId,
            question: "测试事业走向",
            seedHex: seed,
            reversalRate: 0.0
        )
        
        // 使用相同 Seed 再次推演
        let sessionB = try drawReadingSession(
            spreadId: spreadId,
            question: "测试事业走向",
            seedHex: seed,
            reversalRate: 0.0
        )
        
        XCTAssertEqual(sessionA.spreadId, sessionB.spreadId)
        XCTAssertEqual(sessionA.rngSeed, sessionB.rngSeed)
        XCTAssertEqual(sessionA.placedCards.count, sessionB.placedCards.count)
        
        for i in 0..<sessionA.placedCards.count {
            XCTAssertEqual(sessionA.placedCards[i].drawnCard.cardId, sessionB.placedCards[i].drawnCard.cardId, "Cards at slot \(i) must match deterministically")
            XCTAssertEqual(sessionA.placedCards[i].drawnCard.orientation, sessionB.placedCards[i].drawnCard.orientation)
        }
    }
    
    /// 测试内置经典牌阵的拓扑图元有效性
    func testCanonicalSpreadTopology() {
        let spreads = listCanonicalSpreads()
        XCTAssertGreaterThanOrEqual(spreads.count, 2, "Must contain at least Celtic Cross and Three States")
        
        for spread in spreads {
            XCTAssertFalse(spread.id.isEmpty)
            XCTAssertFalse(spread.nameZh.isEmpty)
            XCTAssertGreaterThan(spread.slots.count, 0)
            
            // 验证槽位 ID 唯一性
            let slotIds = Set(spread.slots.map { $0.slotId })
            XCTAssertEqual(slotIds.count, spread.slots.count, "Spread \(spread.id) slots must have unique IDs")
        }
    }
}
