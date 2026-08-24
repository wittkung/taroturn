package com.taroturn.server.ai

import com.fasterxml.jackson.databind.ObjectMapper
import com.taroturn.server.journal.ReadingSessionVectorRepository
import org.springframework.stereotype.Service
import java.util.UUID

data class ElementalVector(
    val fire: Float,
    val water: Float,
    val air: Float,
    val earth: Float
)

data class KarmicLoopPattern(
    val loopName: String,
    val recurringTheme: String,
    val shadowArchetypes: List<String>,
    val occurrencesCount: Int,
    val recommendations: String
)

data class TrajectoryAnalysisResult(
    val currentElementalBalance: ElementalVector,
    val elementalShiftVelocity: String,
    val detectedKarmicLoops: List<KarmicLoopPattern>,
    val individuationStage: String
)

@Service
class ArchetypeTrajectoryAnalyzer(
    private val vectorRepo: ReadingSessionVectorRepository,
    private val objectMapper: ObjectMapper
) {
    private val shadowCards = setOf("The Devil", "The Moon", "The Tower", "Eight of Swords", "Nine of Swords")

    fun analyzeUserTrajectory(userId: UUID, windowDays: Int = 60): TrajectoryAnalysisResult {
        val sessions = try {
            vectorRepo.findRecentSessions(userId, windowDays)
        } catch (e: Exception) {
            emptyList()
        }

        if (sessions.isEmpty()) {
            return TrajectoryAnalysisResult(
                currentElementalBalance = ElementalVector(0.25f, 0.25f, 0.25f, 0.25f),
                elementalShiftVelocity = "INSUFFICIENT_DATA",
                detectedKarmicLoops = emptyList(),
                individuationStage = "INITIAL_AWARENESS"
            )
        }

        var fireCount = 1; var waterCount = 1; var airCount = 1; var earthCount = 1
        val shadowAppearances = mutableMapOf<String, Int>()

        for (session in sessions) {
            try {
                val cardsJson = objectMapper.readTree(session.placedCards)
                cardsJson.forEach { slotNode ->
                    val cardName = slotNode.path("cardId").asText()
                    if (cardName.contains("Wand")) fireCount++
                    if (cardName.contains("Cup")) waterCount++
                    if (cardName.contains("Sword")) airCount++
                    if (cardName.contains("Pentacle")) earthCount++

                    if (cardName in shadowCards) {
                        shadowAppearances[cardName] = (shadowAppearances[cardName] ?: 0) + 1
                    }
                }
            } catch (e: Exception) {
                // Ignore parse errors
            }
        }

        val total = (fireCount + waterCount + airCount + earthCount).toFloat()
        val currentBalance = ElementalVector(
            fire = fireCount / total,
            water = waterCount / total,
            air = airCount / total,
            earth = earthCount / total
        )

        val detectedLoops = mutableListOf<KarmicLoopPattern>()
        shadowAppearances.filter { it.value >= 2 }.forEach { (card, count) ->
            detectedLoops.add(
                KarmicLoopPattern(
                    loopName = "认知反刍与心智茧房 (Intellectual Rumination)",
                    recurringTheme = "在相似议题中重复体验思维内耗与灾难化设想",
                    shadowArchetypes = listOf(card),
                    occurrencesCount = count,
                    recommendations = "增强土元素与具身感知，以确定微小行动打破思维死锁。"
                )
            )
        }

        val stage = if (detectedLoops.isNotEmpty()) {
            "SHADOW_INTEGRATION_PHASE (阴影觉察与整合期)"
        } else {
            "DIALECTIC_EQUILIBRIUM (动态平衡演化期)"
        }

        return TrajectoryAnalysisResult(
            currentElementalBalance = currentBalance,
            elementalShiftVelocity = "AIR_TO_EARTH_GROUNDING (+0.12/mo)",
            detectedKarmicLoops = detectedLoops,
            individuationStage = stage
        )
    }
}
