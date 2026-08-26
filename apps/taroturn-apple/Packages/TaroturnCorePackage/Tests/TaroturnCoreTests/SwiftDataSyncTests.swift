// SwiftDataSyncTests.swift - Elemental Dignity & Session Integrity Tests
import XCTest
import TaroturnCore

final class SwiftDataSyncTests: XCTestCase {
    
    /// 测试推演会话中四要素尊位 (Elemental Dignities) 诊断完整性
    func testElementalDignitiesDiagnostics() throws {
        let seed = try generateRandomSeed()
        let session = try drawReadingSession(
            spreadId: "celtic_cross",
            question: "复盘测试",
            seedHex: seed,
            reversalRate: 0.3
        )
        
        XCTAssertEqual(session.placedCards.count, 10, "Celtic cross must place exactly 10 cards")
        
        // 验证四要素尊位诊断摘要
        let summary = session.dignitySummary
        XCTAssertGreaterThanOrEqual(summary.majorRatio, 0.0)
        XCTAssertLessThanOrEqual(summary.majorRatio, 1.0)
        
        // 验证两两尊位关系
        XCTAssertFalse(summary.pairwiseDignities.isEmpty, "Celtic Cross must generate pairwise elemental interactions")
        for dignity in summary.pairwiseDignities {
            XCTAssertGreaterThanOrEqual(dignity.sourceSlotId, 0)
            XCTAssertGreaterThanOrEqual(dignity.targetSlotId, 0)
        }
    }
    
    /// 测试根据 ID 精确获取卡牌元数据
    func testGetCardByIdLookup() throws {
        let theFool = try getCardById(cardId: 0)
        XCTAssertEqual(theFool.id, 0)
        XCTAssertEqual(theFool.nameZh, "愚者")
        XCTAssertEqual(theFool.arcana, .major)
        XCTAssertEqual(theFool.element, .air)
        
        let theWorld = try getCardById(cardId: 21)
        XCTAssertEqual(theWorld.id, 21)
        XCTAssertEqual(theWorld.nameZh, "世界")
        XCTAssertEqual(theWorld.arcana, .major)
        XCTAssertEqual(theWorld.element, .earth)
    }
}
