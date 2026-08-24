package com.taroturn.server.ai

import com.taroturn.server.journal.ReadingSessionVectorRepository
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.time.Duration
import java.time.Instant
import java.util.UUID
import kotlin.math.exp

data class MemoryEcho(
    val sessionId: UUID,
    val question: String?,
    val spreadId: String,
    val daysAgo: Long,
    val rawCosineSimilarity: Double,
    val hybridRelevanceScore: Double,
    val cardSummary: String,
    val userNotes: String?
)

@Service
class UnconsciousMemoryRagService(
    private val vectorRepo: ReadingSessionVectorRepository,
    @Value("\${taroturn.ai.openai.api-key:}") private val openaiApiKey: String
) {

    fun generateSessionEmbedding(
        question: String?,
        spreadId: String,
        dominantElement: String,
        dignitySummary: String,
        placedCardsSummary: String,
        userNotes: String?
    ): FloatArray {
        // Deterministic pseudo-embedding if no OpenAI key is configured
        val text = "$question|$spreadId|$dominantElement|$placedCardsSummary|$userNotes"
        val embedding = FloatArray(1536)
        val hash = text.hashCode()
        for (i in 0 until 1536) {
            embedding[i] = ((hash * (i + 1)) % 1000) / 1000.0f
        }
        return embedding
    }

    fun retrieveSubconsciousEchoes(
        userId: UUID,
        currentEmbedding: FloatArray,
        excludeSessionId: UUID,
        limit: Int = 3
    ): List<MemoryEcho> {
        val vectorString = currentEmbedding.joinToString(separator = ",", prefix = "[", postfix = "]")
        val rawEchoes = try {
            vectorRepo.findTopKSimilarReadings(userId, vectorString, excludeSessionId, limit * 2)
        } catch (e: Exception) {
            emptyList()
        }

        val now = Instant.now()
        return rawEchoes.map { projection ->
            val daysAgo = Duration.between(projection.getCreatedAt(), now).toDays().coerceAtLeast(0)
            val rawSim = projection.getSimilarity()
            val timeDecayFactor = exp(-daysAgo.toDouble() / 180.0)
            val hybridScore = (rawSim * 0.75) + (timeDecayFactor * 0.25)

            MemoryEcho(
                sessionId = projection.getId(),
                question = projection.getQuestion(),
                spreadId = projection.getSpreadId(),
                daysAgo = daysAgo,
                rawCosineSimilarity = rawSim,
                hybridRelevanceScore = hybridScore,
                cardSummary = projection.getPlacedCards(),
                userNotes = projection.getUserNotes()
            )
        }
        .sortedByDescending { it.hybridRelevanceScore }
        .take(limit)
    }
}
