// TaroturnCore+Sendable.swift - Swift 6 Strict Concurrency Sendable Extensions
import Foundation

// Mark generated UniFFI structs and enums as Sendable
extension Card: @unchecked Sendable {}
extension CardFacets: @unchecked Sendable {}
extension Spread: @unchecked Sendable {}
extension SpreadSlot: @unchecked Sendable {}
extension SlotEdge: @unchecked Sendable {}
extension ReadingSession: @unchecked Sendable {}
extension PlacedCard: @unchecked Sendable {}
extension DrawnCard: @unchecked Sendable {}
extension ElementalDignitySummary: @unchecked Sendable {}
extension PairwiseDignity: @unchecked Sendable {}
extension ArcanaType: @unchecked Sendable {}
extension ElementType: @unchecked Sendable {}
extension Orientation: @unchecked Sendable {}
extension SlotRelationType: @unchecked Sendable {}
extension DignityStatus: @unchecked Sendable {}
