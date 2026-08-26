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
extension Element: @unchecked Sendable {}
extension ElementalAffinity: @unchecked Sendable {}
extension DominantElement: @unchecked Sendable {}
extension Orientation: @unchecked Sendable {}
extension Rank: @unchecked Sendable {}
extension SlotConstraint: @unchecked Sendable {}
extension SlotRelationType: @unchecked Sendable {}
extension SpreadCategory: @unchecked Sendable {}
extension Suit: @unchecked Sendable {}
extension TarotError: @unchecked Sendable {}
