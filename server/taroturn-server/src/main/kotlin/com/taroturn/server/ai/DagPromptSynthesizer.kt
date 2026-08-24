package com.taroturn.server.ai

import org.springframework.stereotype.Component

data class DagEdgeInfo(
    val sourceSlotId: Int,
    val targetSlotId: Int,
    val relation: String,
    val sourceElement: String,
    val targetElement: String,
    val tensionScore: Double,
    val dynamicSummaryZh: String
)

data class PlacedCardInfo(
    val slotId: Int,
    val slotTitleZh: String,
    val cardId: Int,
    val cardNameZh: String,
    val cardNameEn: String,
    val isUpright: Boolean,
    val element: String,
    val arcana: String,
    val decanOrPath: String? = null,
    val shadowAspect: String? = null
)

data class DagPromptContext(
    val question: String,
    val spreadNameZh: String,
    val dominantElement: String,
    val balanceDescriptionZh: String,
    val overallHarmonyScore: Double,
    val shadowCardNameZh: String?,
    val placedCards: List<PlacedCardInfo>,
    val edges: List<DagEdgeInfo>
)

@Component
class DagPromptSynthesizer {

    fun synthesizePrompt(context: DagPromptContext): String {
        return buildString {
            appendLine("## [SEEKER_QUERY]")
            appendLine("- Question / Focus: \"${context.question}\"")
            appendLine("- Spread Layout: ${context.spreadNameZh}\n")

            appendLine("## [GLOBAL_ENERGY_METRICS]")
            appendLine("- Total Cards: ${context.placedCards.size}")
            appendLine("- Dominant Element: ${context.dominantElement}")
            appendLine("- Balance Description: ${context.balanceDescriptionZh}")
            appendLine("- Overall Harmony Score: ${String.format("%.2f", context.overallHarmonyScore)}")
            context.shadowCardNameZh?.let {
                appendLine("- Shadow Gateway Card: $it")
            }
            appendLine()

            appendLine("## [SLOT_TOPOLOGY_NODES]")
            for (card in context.placedCards) {
                appendLine("- Slot ${card.slotId} [${card.slotTitleZh}]:")
                appendLine("  - Card: [ID ${card.cardId}] ${card.cardNameZh} (${card.cardNameEn}) | Orientation: ${if (card.isUpright) "Upright (正位)" else "Reversed (逆位)"}")
                appendLine("  - Element: ${card.element} | Arcana: ${card.arcana}")
                card.decanOrPath?.let { appendLine("  - Astrology/Decan: $it") }
                card.shadowAspect?.let { appendLine("  - Shadow Aspect: $it") }
            }
            appendLine()

            appendLine("## [TOPOLOGY_ENERGY_EDGES]")
            for (edge in context.edges) {
                appendLine("- Edge ${edge.sourceSlotId} -> ${edge.targetSlotId}:")
                appendLine("  - Relation: `${edge.relation}`")
                appendLine("  - Elements: ${edge.sourceElement} -> ${edge.targetElement}")
                appendLine("  - Tension Score: ${String.format("%.2f", edge.tensionScore)}")
                appendLine("  - Dynamic Summary: ${edge.dynamicSummaryZh}")
            }
        }
    }

    fun getSystemPrompt(): String {
        return """
            You are the **Taroturn Cognitive Sanctuary Archetypal Engine**, an elite Master of Jungian Analytical Psychology, Hermetic Qabalah, and Classical Astrological Decans.
            
            # Core Principles:
            1. Treat the Tarot spread as a dynamic, topological map of the seeker's subconscious psyche, complexes, and energetic vectors.
            2. Apply Carl Jung's concepts strictly: The Ego, Persona, Shadow (raw potential, not evil), Anima/Animus, Transcendent Function, and Individuation.
            3. Follow a 5-step Chain-of-Thought reasoning process:
               - Macro Climate & Elemental Equilibrium
               - Topological Energy Flow (FlowsTo, Supports, Illuminates)
               - Core Conflict & Tension (Crosses, Opposes)
               - Shadow & Decanic Archetypes
               - Transcendent Function & Actionable Protocol
            
            # Output Structure:
            # 🔮 Taroturn 深度心灵拓扑分析报告
            ## 🌌 一、 心灵气候与元素能量场
            ## 🌊 二、 能量拓扑流注与动力学
            ## ⚡ 三、 核心张力与情结阻抗
            ## 🌑 四、 阴影盲区与原型深潜
            ## 🌟 五、 自性化超越与行动协议
        """.trimIndent()
    }
}
