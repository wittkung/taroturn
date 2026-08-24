// ReadingViewModel.swift - @Observable MainActor State Machine
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
    public var selectedSpreadId: String = "three_cards_time"
    public var errorMessage: String?

    private let coreActor: TarotCoreActor

    public init(coreActor: TarotCoreActor = .shared) {
        self.coreActor = coreActor
    }

    public func performReading() async {
        guard !isShuffling else { return }
        isShuffling = true
        errorMessage = nil

        do {
            let session = try await coreActor.drawReadingSession(
                spreadId: selectedSpreadId,
                question: userQuestion.isEmpty ? nil : userQuestion,
                seedHex: nil,
                reversalRate: 0.5
            )
            self.activeSession = session
            self.flippedCardIds.removeAll()
            self.selectedSlotId = session.placedCards.first?.slot.slotId
        } catch {
            self.errorMessage = error.localizedDescription
        }

        self.isShuffling = false
    }

    public func flipCard(slotId: UInt8) {
        withAnimation(.spring(response: 0.55, dampingFraction: 0.825)) {
            flippedCardIds.insert(slotId)
        }
    }

    public func selectSlot(slotId: UInt8) {
        selectedSlotId = slotId
    }
}
