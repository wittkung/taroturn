# Quickstart & Verification Guide: Multi-Deck Engine & OTP Ecosystem

- **Feature ID**: `005-multi-deck-and-otp-ecosystem`
- **Specification**: [spec.md](./spec.md)
- **Status**: `READY FOR IMPLEMENTATION`

---

## 1. Unit & Integration Tests

```bash
# Run Rust multi-deck parity and OTP loader tests
cargo test --test multi_deck_parity_test
```

---

## 2. CLI Multi-Deck Demonstration

```bash
# Switch to Crowley Thoth deck
cargo run --bin taroturn_cli -- --deck thoth draw --spread three_cards_time

# Switch to Tarot de Marseille deck
cargo run --bin taroturn_cli -- --deck marseille draw --spread daily_single
```
