# Data Model: Multi-Platform Native & WeChat Mini Program Entities

- **Feature ID**: `003-native-clients-and-miniprogram`
- **Specification**: [spec.md](./spec.md)
- **Status**: `COMPLETED`

---

## 1. Domain Entities & Platform Mappings

### 1.1 Local Auth Session (`AuthSessionStorage`)
Used for persisting JWT and credentials across WeChat Mini Program (`wx.setStorageSync`) and Apple Keychain.

```typescript
interface AuthSessionPayload {
  token: string;          // Bearer JWT issued by taroturn-server
  userId: string;         // Canonical UUID
  nickname: string;       // User display name
  tier: "FREE" | "PRO_MONTHLY" | "PRO_YEARLY" | "LIFETIME";
  isPro: boolean;
  expireAt: number;       // Unix epoch ms
}
```

---

### 1.2 Offline Reading Journal Model (`ReadingJournalEntry`)
Used in `SwiftData` and Mini Program local SQLite/Storage for offline reading retention.

| Field | Type | Description | Constraints |
| :--- | :--- | :--- | :--- |
| `sessionId` | `String` (UUID) | Unique identifier for the reading session | Primary Key |
| `timestamp` | `Date` / `Int64` | Creation epoch milliseconds | Non-null |
| `spreadId` | `String` | Identifier of the spread (e.g. `celtic_cross`) | Matches canonical catalog |
| `question` | `String?` | Contemplation focus or query | Optional, max 255 chars |
| `seedHex` | `String` | 64-char Hex CSPRNG seed | Exactly 64 chars Hex |
| `dominantElement` | `String` | Dominant elemental energy (`Fire`, `Water`, etc.) | Non-null |
| `placedCardIds` | `Array<UInt8>` | Sequence of 78-card IDs drawn | Non-null |
| `userNotes` | `String` | Private reflections and notes | Max 4000 chars |
| `isFavorite` | `Boolean` | Favorited / bookmarked flag | Default `false` |

---

### 1.3 Audio & Haptic Cue Definition (`SensoryCueConfig`)

```typescript
interface SensoryCueConfig {
  soundId: "sfx_shuffle" | "sfx_cut" | "sfx_deal" | "sfx_flip" | "ambient_bowl_432" | "ambient_rain";
  volume: number;          // 0.0 - 1.0
  loop: boolean;
  hapticType?: "heavy" | "medium" | "light" | "rigid" | "alignment";
  delayMs?: number;
}
```
