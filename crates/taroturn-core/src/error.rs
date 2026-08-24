use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Error, Debug, Clone, PartialEq, Eq, Serialize, Deserialize, uniffi::Error)]
pub enum TarotError {
    #[error("Invalid seed string format: {0}")]
    InvalidSeed(String),

    #[error("Card index out of bounds: {0} (valid 0..77)")]
    CardIndexOutOfBounds(u8),

    #[error("Duplicate card draw detected for card id: {0}")]
    DuplicateCardDraw(u8),

    #[error("Spread slot overflow: requested {requested}, spread only supports {capacity}")]
    SpreadSlotOverflow { requested: u64, capacity: u64 },

    #[error("Spread slot constraint violation: slot {slot_id} requires {required}, got {actual}")]
    ConstraintViolation {
        slot_id: u8,
        required: String,
        actual: String,
    },

    #[error("Spread not found: {0}")]
    SpreadNotFound(String),

    #[error("Deserialization error: {0}")]
    DeserializationError(String),

    #[error("AI Provider unavailable: {0}")]
    AiProviderUnavailable(String),

    #[error("Unauthorized access: {0}")]
    Unauthorized(String),

    #[error("Deck system not found: {0}")]
    DeckNotFound(String),

    #[error("OTP Archive corrupted: {0}")]
    OtpArchiveCorrupted(String),

    #[error("OTP Manifest missing")]
    OtpManifestMissing,

    #[error("OTP Manifest invalid: {0}")]
    OtpManifestInvalid(String),

    #[error("OTP Incomplete deck: expected 78 cards, got {0}")]
    OtpIncompleteDeck(u32),

    #[error("Internal Lock Error")]
    InternalLockError,

    #[error("IO Error: {0}")]
    IoError(String),
}

pub type TarotResult<T> = Result<T, TarotError>;
