# Data Model: AI Cognitive Engine & pgvector Memory Entities

- **Feature ID**: `004-ai-cognitive-engine-and-pgvector-rag`
- **Specification**: [spec.md](./spec.md)
- **Status**: `COMPLETED`

---

## 1. Domain Entities & Database Schema

### 1.1 Extended `reading_sessions` Table (Vector Enriched)

| Column | Type | Description | Constraints |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | Primary Key | `PRIMARY KEY` |
| `user_id` | `UUID` | Foreign Key to `users(id)` | `REFERENCES users(id) ON DELETE CASCADE` |
| `spread_id` | `VARCHAR(64)` | Canonical spread identifier | Non-null |
| `question` | `TEXT` | User contemplation focus | Nullable |
| `rng_seed` | `VARCHAR(64)` | 64-char Hex CSPRNG seed | Exactly 64 chars Hex |
| `reversal_probability` | `REAL` | Reversal probability | 0.0 - 1.0 |
| `placed_cards` | `JSONB` | JSON serialized placed cards array | Non-null |
| `dignity_analysis` | `JSONB` | Dignity summary and pairwise tensor | Non-null |
| `user_notes` | `TEXT` | Private introspective reflections | Max 4000 chars |
| `dominant_element` | `VARCHAR(20)` | Fire, Water, Air, Earth | Nullable |
| `embedding` | `vector(1536)` | Dense multi-modal contextual embedding | Nullable, HNSW indexed |
| `karmic_cluster_id` | `UUID` | Detected Karmic Loop cluster | Nullable |
| `created_at` | `TIMESTAMPTZ` | Session timestamp | Default `NOW()` |

---

### 1.2 `user_archetype_trajectories` Table

| Column | Type | Description | Constraints |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | Primary Key | `DEFAULT gen_random_uuid()` |
| `user_id` | `UUID` | Foreign Key to `users(id)` | `REFERENCES users(id) ON DELETE CASCADE` |
| `snapshot_date` | `DATE` | Snapshot evaluation date | `UNIQUE (user_id, snapshot_date)` |
| `window_days` | `INT` | Aggregation window (e.g. 30/60 days) | Default 30 |
| `fire_ratio` | `REAL` | Fire element proportion | 0.0 - 1.0 |
| `water_ratio` | `REAL` | Water element proportion | 0.0 - 1.0 |
| `air_ratio` | `REAL` | Air element proportion | 0.0 - 1.0 |
| `earth_ratio` | `REAL` | Earth element proportion | 0.0 - 1.0 |
| `dominant_archetypes` | `TEXT[]` | Frequently recurring archetypes | Default `ARRAY[]` |
| `detected_karmic_loops` | `JSONB` | Array of active Karmic Loop patterns | Default `'[]'::JSONB` |
| `individuation_stage` | `VARCHAR(64)` | Current Jungian individuation stage | Non-null |
| `created_at` | `TIMESTAMPTZ` | Creation timestamp | Default `NOW()` |
