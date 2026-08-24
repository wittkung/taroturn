// tests/multi_deck_parity_test.rs - Multi-Deck System Parity & OTP Tests

use taroturn_core::deck_system::{DeckFamily, TarotDeckSystem};
use taroturn_core::rws_deck::RwsDeckSystem;
use taroturn_core::thoth_deck::ThothDeckSystem;
use taroturn_core::marseille_deck::MarseilleDeckSystem;
use taroturn_core::otp_loader::OtpDeckLoader;

#[test]
fn test_rws_deck_integrity() {
    let rws = RwsDeckSystem::new();
    assert_eq!(rws.family(), DeckFamily::RiderWaiteSmith);
    assert_eq!(rws.all_cards().len(), 78);

    let card8 = rws.get_card(8).unwrap();
    assert_eq!(card8.display_name_zh, "力量");
    assert_eq!(card8.display_name_en, "Strength");

    let card11 = rws.get_card(11).unwrap();
    assert_eq!(card11.display_name_zh, "正义");
    assert_eq!(card11.display_name_en, "Justice");
}

#[test]
fn test_thoth_deck_esoteric_swaps() {
    let thoth = ThothDeckSystem::new();
    assert_eq!(thoth.family(), DeckFamily::CrowleyThoth);
    assert_eq!(thoth.all_cards().len(), 78);
    assert!(!thoth.supports_physical_reversals());

    // VIII Adjustment (Libra)
    let card8 = thoth.get_card(8).unwrap();
    assert_eq!(card8.display_name_zh, "调节");
    assert_eq!(card8.display_name_en, "Adjustment");
    assert!(card8.astrology_or_decan.as_ref().unwrap().contains("Libra"));

    // XI Lust (Leo)
    let card11 = thoth.get_card(11).unwrap();
    assert_eq!(card11.display_name_zh, "欲望");
    assert_eq!(card11.display_name_en, "Lust");
    assert!(card11.astrology_or_decan.as_ref().unwrap().contains("Leo"));

    // IV Emperor (Tzaddi path) & XVII Star (Heh path)
    let emperor = thoth.get_card(4).unwrap();
    assert_eq!(emperor.hebrew_letter.as_deref(), Some("Tzaddi (צ)"));

    let star = thoth.get_card(17).unwrap();
    assert_eq!(star.hebrew_letter.as_deref(), Some("Heh (ה)"));
}

#[test]
fn test_marseille_deck_french_nomenclature() {
    let tdm = MarseilleDeckSystem::new();
    assert_eq!(tdm.family(), DeckFamily::TarotDeMarseille);
    assert_eq!(tdm.all_cards().len(), 78);

    let card0 = tdm.get_card(0).unwrap();
    assert_eq!(card0.display_name_en, "Le Mat");

    let card2 = tdm.get_card(2).unwrap();
    assert_eq!(card2.display_name_en, "La Papesse");

    let card13 = tdm.get_card(13).unwrap();
    assert_eq!(card13.display_name_en, "[Sans Nom]");

    let card16 = tdm.get_card(16).unwrap();
    assert_eq!(card16.display_name_en, "La Maison Dieu");
}

#[test]
fn test_otp_zipslip_path_validation() {
    assert!(OtpDeckLoader::validate_safe_path("assets/major/00_fool.webp"));
    assert!(!OtpDeckLoader::validate_safe_path("../secret.txt"));
    assert!(!OtpDeckLoader::validate_safe_path("assets/../../etc/passwd"));
    assert!(!OtpDeckLoader::validate_safe_path("/root/file.txt"));
}
