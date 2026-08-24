-- Taroturn V1 Relational Schema & pgvector Configuration
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wechat_openid VARCHAR(64) UNIQUE,
    wechat_unionid VARCHAR(64) UNIQUE,
    apple_sub VARCHAR(128) UNIQUE,
    email VARCHAR(255) UNIQUE,
    nickname VARCHAR(100) NOT NULL DEFAULT 'Seeker',
    avatar_url TEXT,
    tier VARCHAR(20) NOT NULL DEFAULT 'FREE', -- FREE, PRO_MONTHLY, PRO_ANNUAL, PRO_LIFETIME
    tier_expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Reading Sessions Table (Pro Members Only)
CREATE TABLE IF NOT EXISTS reading_sessions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    spread_id VARCHAR(64) NOT NULL,
    question TEXT,
    rng_seed VARCHAR(128) NOT NULL,
    reversal_probability REAL NOT NULL DEFAULT 0.5,
    placed_cards JSONB NOT NULL,
    dignity_analysis JSONB NOT NULL,
    ai_interpretation JSONB,
    user_notes TEXT,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    embedding vector(1536)
);

CREATE INDEX IF NOT EXISTS idx_reading_sessions_user_time ON reading_sessions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_spread ON reading_sessions(spread_id);

-- Custom Spreads Table (Pro Feature)
CREATE TABLE IF NOT EXISTS custom_spreads (
    id VARCHAR(64) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name_en VARCHAR(100) NOT NULL,
    name_zh VARCHAR(100) NOT NULL,
    description TEXT,
    slots_definition JSONB NOT NULL,
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
