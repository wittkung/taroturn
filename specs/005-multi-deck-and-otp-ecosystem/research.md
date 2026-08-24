# Research: Multi-Deck Historical Traditions & Open Tarot Package Standards

- **Feature ID**: `005-multi-deck-and-otp-ecosystem`
- **Specification**: [spec.md](./spec.md)
- **Status**: `COMPLETED`

---

## 1. Technical Decisions & Rationales

### Decision 1: Trait Polymorphism with Static Registries
- **Chosen Approach**: `TarotDeckSystem` trait with compile-time zero-heap `&'static [PolyDeckCard; 78]` for RWS, Thoth, and Marseille, coupled with `Arc<dyn TarotDeckSystem>` dynamic dispatch for custom `.otp` packages.
- **Rationale**: Keeps the core engine ultra-fast (sub-microsecond card lookups for built-in decks) while enabling seamless dynamic extensions without recompiling.
- **Alternatives Evaluated**:
  - *Enum with hardcoded match arms*: Rigid and prevents users from loading external `.otp` archives.
  - *Pure dynamic database table*: Adds disk I/O and latency to every card draw.

---

### Decision 2: Open Tarot Package (OTP v1.0) Sandboxed ZIP Container
- **Chosen Approach**: Standard `.otp` (ZIP) format containing `manifest.json` + `palette.json` + WebP image pyramids + strict ZipSlip defense.
- **Rationale**: ZIP is universally supported across Rust, Java/Kotlin, Swift, and JavaScript with built-in deflate compression and streaming reads. WebP achieves 70%+ smaller file sizes than PNG.
- **Alternatives Evaluated**:
  - *Single SQLite `.db` file*: Difficult for artists to inspect or author assets without specialized database tools.
  - *Tar.gz*: Less native support on mobile web and iOS without extra third-party libraries.
