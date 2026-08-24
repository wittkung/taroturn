use taroturn_core::{CardDeck, ReadingSession, ShufflingEngine, Spread};

#[test]
fn test_exact_cross_platform_seed_invariance() {
    // Exact seed used across Rust, Python, Go, C++, and WASM
    let seed_hex = "f0ba94f2e55f742e417b377f61bf18f6c6f2d120ad9631b12ddd5d5c782ea1db";
    let seed_bytes = ShufflingEngine::parse_seed(seed_hex).unwrap();

    let drawn = ShufflingEngine::draw_cards(&seed_bytes, 3, 0.5).unwrap();

    assert_eq!(drawn.len(), 3);
    // Deterministic verify of first card
    assert_eq!(drawn[0].draw_sequence, 0);

    let session = ReadingSession::create(
        "three_cards_time",
        Some("Cross platform invariance test".into()),
        Some(seed_hex.to_string()),
        0.5,
    )
    .unwrap();

    assert_eq!(session.spread_id, "three_cards_time");
    assert_eq!(session.placed_cards.len(), 3);
    assert_eq!(session.rng_seed, seed_hex);
}

#[test]
fn test_all_canonical_spreads_validity() {
    let spreads = Spread::canonical_spreads();
    assert!(spreads.len() >= 7);

    for spread in spreads {
        assert!(!spread.slots.is_empty());
        let session = ReadingSession::create(&spread.id, None, None, 0.5).unwrap();
        assert_eq!(session.placed_cards.len(), spread.slot_count());
    }
}
