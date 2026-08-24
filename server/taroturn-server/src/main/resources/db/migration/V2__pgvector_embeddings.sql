-- ====================================================================
-- Taroturn Migration V2: pgvector HNSW Indexes & Trajectory Tables
-- Target: PostgreSQL 16 + pgvector >= 0.7.0
-- ====================================================================

-- 1. Ensure pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Reading Sessions vector column alignment & HNSW Index
ALTER TABLE reading_sessions 
    ADD COLUMN IF NOT EXISTS embedding vector(1536),
    ADD COLUMN IF NOT EXISTS dominant_element VARCHAR(20),
    ADD COLUMN IF NOT EXISTS karmic_cluster_id UUID;

-- Create HNSW Cosine Index for ultra-fast subconscious RAG (<5ms)
CREATE INDEX IF NOT EXISTS idx_reading_sessions_hnsw_cosine 
    ON reading_sessions 
    USING hnsw (embedding vector_cosine_ops) 
    WITH (m = 16, ef_construction = 64);

-- 3. Archetype Trajectory Snapshot Table
CREATE TABLE IF NOT EXISTS user_archetype_trajectories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    snapshot_date DATE NOT NULL,
    window_days INT NOT NULL DEFAULT 30,
    fire_ratio REAL NOT NULL DEFAULT 0.0,
    water_ratio REAL NOT NULL DEFAULT 0.0,
    air_ratio REAL NOT NULL DEFAULT 0.0,
    earth_ratio REAL NOT NULL DEFAULT 0.0,
    dominant_archetypes TEXT[] DEFAULT ARRAY[]::TEXT[],
    detected_karmic_loops TEXT DEFAULT '[]',
    individuation_stage VARCHAR(64) NOT NULL DEFAULT 'INITIATION',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_trajectory_date UNIQUE (user_id, snapshot_date)
);

CREATE INDEX IF NOT EXISTS idx_user_trajectory_history 
    ON user_archetype_trajectories (user_id, snapshot_date DESC);
