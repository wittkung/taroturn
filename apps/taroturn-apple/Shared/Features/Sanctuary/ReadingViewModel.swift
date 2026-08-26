// ReadingViewModel.swift - @Observable MainActor Divination State Machine
import SwiftUI
import Observation
import TaroturnCore

@Observable
@MainActor
public final class ReadingViewModel {
    public private(set) var activeSession: ReadingSession?
    public private(set) var isShuffling: Bool = false
    public private(set) var flippedCardIds: Set<UInt8> = []
    public private(set) var selectedSlotId: UInt8?
    public var userQuestion: String = ""
    public var selectedSpreadId: String = "three_cards_time" {
        didSet {
            TarotLogger.shared.log(level: .info, category: "UI", message: "切换牌阵: \(oldValue) -> \(selectedSpreadId)")
        }
    }
    public var customSeedHex: String = ""
    public var errorMessage: String?

    // Available canonical spreads cached from core
    public private(set) var availableSpreads: [Spread] = []

    private let coreActor: TarotCoreActor

    public init(coreActor: TarotCoreActor = .shared) {
        self.coreActor = coreActor
        self.availableSpreads = TaroturnCore.listCanonicalSpreads()
    }

    public func performReading() async {
        guard !isShuffling else { return }
        isShuffling = true
        errorMessage = nil

        TarotLogger.shared.log(
            level: .info,
            category: "Ritual",
            message: "启动推演仪式: 牌阵=\(selectedSpreadId), 议题='\(userQuestion)'"
        )

        do {
            HapticSoundEngine.shared.triggerCardRiffle()
            let seed = customSeedHex.isEmpty ? nil : customSeedHex
            let session = try await coreActor.drawReadingSession(
                spreadId: selectedSpreadId,
                question: userQuestion.isEmpty ? nil : userQuestion,
                seedHex: seed,
                reversalRate: 0.5
            )
            self.activeSession = session
            self.flippedCardIds.removeAll()
            self.selectedSlotId = session.placedCards.first?.slotId

            TarotLogger.shared.log(
                level: .info,
                category: "Kernel",
                message: "推演成功: 发牌数=\(session.placedCards.count), CSPRNG种子=\(session.rngSeed.prefix(12))..., 主导能量=\(session.dignitySummary.dominantElement)"
            )
        } catch {
            self.errorMessage = error.localizedDescription
            TarotLogger.shared.log(
                level: .error,
                category: "Kernel",
                message: "推演失败: \(error)"
            )
        }

        self.isShuffling = false
    }

    public func flipCard(slotId: UInt8) {
        HapticSoundEngine.shared.triggerCardFlip()
        withAnimation(.spring(response: 0.55, dampingFraction: 0.825)) {
            _ = flippedCardIds.insert(slotId)
        }
        TarotLogger.shared.log(level: .debug, category: "UI", message: "翻开卡牌槽位 #\(slotId)")
        if let session = activeSession, flippedCardIds.count == session.placedCards.count {
            HapticSoundEngine.shared.triggerRitualCompletion()
            TarotLogger.shared.log(level: .info, category: "Ritual", message: "全牌阵揭示完成")
        }
    }

    public func flipAllCards() {
        guard let session = activeSession else { return }
        withAnimation(.spring(response: 0.6, dampingFraction: 0.8)) {
            for card in session.placedCards {
                _ = flippedCardIds.insert(card.slotId)
            }
        }
        HapticSoundEngine.shared.triggerRitualCompletion()
        TarotLogger.shared.log(level: .info, category: "Ritual", message: "一键揭示全部余牌 (\(session.placedCards.count)张)")
    }

    public func selectSlot(slotId: UInt8) {
        selectedSlotId = slotId
        TarotLogger.shared.log(level: .debug, category: "UI", message: "选定卡槽 #\(slotId)")
    }
}
