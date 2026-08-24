package com.taroturn.server.journal

import com.taroturn.server.model.ReadingSessionEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.util.UUID

interface HistoricalEchoProjection {
    fun getId(): UUID
    fun getSpreadId(): String
    fun getQuestion(): String?
    fun getPlacedCards(): String
    fun getUserNotes(): String?
    fun getCreatedAt(): java.time.Instant
    fun getSimilarity(): Double
}

@Repository
interface ReadingSessionVectorRepository : JpaRepository<ReadingSessionEntity, UUID> {

    @Query(
        value = """
            SELECT 
                s.id AS id,
                s.spread_id AS spreadId,
                s.question AS question,
                s.placed_cards AS placedCards,
                s.user_notes AS userNotes,
                s.created_at AS createdAt,
                (1.0 - (s.embedding <=> CAST(:queryEmbedding AS vector))) AS similarity
            FROM reading_sessions s
            WHERE s.user_id = :userId
              AND s.embedding IS NOT NULL
              AND s.id != :excludeSessionId
            ORDER BY s.embedding <=> CAST(:queryEmbedding AS vector) ASC
            LIMIT :limit
        """,
        nativeQuery = true
    )
    fun findTopKSimilarReadings(
        @Param("userId") userId: UUID,
        @Param("queryEmbedding") queryEmbedding: String,
        @Param("excludeSessionId") excludeSessionId: UUID,
        @Param("limit") limit: Int
    ): List<HistoricalEchoProjection>

    @Query(
        value = """
            SELECT s.* FROM reading_sessions s
            WHERE s.user_id = :userId
              AND s.created_at >= NOW() - CAST(:days || ' days' AS INTERVAL)
            ORDER BY s.created_at ASC
        """,
        nativeQuery = true
    )
    fun findRecentSessions(
        @Param("userId") userId: UUID,
        @Param("days") days: Int
    ): List<ReadingSessionEntity>
}
