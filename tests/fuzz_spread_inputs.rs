use taroturn_core::{CardDeck, ReadingSession, ShufflingEngine, TarotError};

#[test]
fn test_invalid_seed_error_handling() {
    // Too short seed
    let err_short = ShufflingEngine::parse_seed("1234abcd").unwrap_err();
    assert!(matches!(err_short, TarotError::InvalidSeed(_)));

    // Non-hex characters
    let err_nonhex = ShufflingEngine::parse_seed(
        "zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz",
    )
    .unwrap_err();
    assert!(matches!(err_nonhex, TarotError::InvalidSeed(_)));
}

#[test]
fn test_spread_overflow_error_handling() {
    let seed_bytes = [42u8; 32];
    // Requesting 80 cards from 78-card deck
    let err_overflow = ShufflingEngine::draw_cards(&seed_bytes, 80, 0.5).unwrap_err();
    assert!(matches!(err_overflow, TarotError::SpreadSlotOverflow { .. }));
}

#[test]
fn test_card_id_bounds() {
    assert!(CardDeck::get_by_id(77).is_ok());
    let err_oob = CardDeck::get_by_id(78).unwrap_err();
    assert!(matches!(err_oob, TarotError::CardIndexOutOfBounds(78)));
}
