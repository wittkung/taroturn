package com.taroturn.server

import com.taroturn.server.ai.DagEdgeInfo
import com.taroturn.server.ai.DagPromptContext
import com.taroturn.server.ai.DagPromptSynthesizer
import com.taroturn.server.ai.PlacedCardInfo
import org.junit.jupiter.api.Test
import kotlin.test.assertTrue

class AiStreamingIntegrationTest {

    private val synthesizer = DagPromptSynthesizer()

    @Test
    fun `test dag prompt synthesis creates structured sections`() {
        val context = DagPromptContext(
            question = "如何打破当下的战略瓶颈？",
            spreadNameZh = "三态时间流",
            dominantElement = "Fire (火)",
            balanceDescriptionZh = "火象主导，行动力充沛但需警惕过热",
            overallHarmonyScore = 0.65,
            shadowCardNameZh = "The Devil (恶魔)",
            placedCards = listOf(
                PlacedCardInfo(
                    slotId = 0,
                    slotTitleZh = "过去溯源",
                    cardId = 23,
                    cardNameZh = "权杖二",
                    cardNameEn = "Two of Wands",
                    isUpright = true,
                    element = "Fire",
                    arcana = "Minor",
                    decanOrPath = "Mars in Aries",
                    shadowAspect = "过度规划导致行动迟滞"
                )
            ),
            edges = listOf(
                DagEdgeInfo(
                    sourceSlotId = 0,
                    targetSlotId = 1,
                    relation = "FlowsTo",
                    sourceElement = "Fire",
                    targetElement = "Air",
                    tensionScore = 0.54,
                    dynamicSummaryZh = "火生风，灵感激发"
                )
            )
        )

        val prompt = synthesizer.synthesizePrompt(context)
        assertTrue(prompt.contains("## [SEEKER_QUERY]"))
        assertTrue(prompt.contains("## [GLOBAL_ENERGY_METRICS]"))
        assertTrue(prompt.contains("## [SLOT_TOPOLOGY_NODES]"))
        assertTrue(prompt.contains("## [TOPOLOGY_ENERGY_EDGES]"))
        assertTrue(prompt.contains("权杖二"))
    }
}
