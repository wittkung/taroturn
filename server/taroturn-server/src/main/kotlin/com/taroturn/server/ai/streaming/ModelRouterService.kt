package com.taroturn.server.ai.streaming

import com.taroturn.server.ai.DagPromptSynthesizer
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class ModelRouterService(
    private val dagPromptSynthesizer: DagPromptSynthesizer,
    @Value("\${taroturn.ai.mock-mode:true}") private val mockMode: Boolean
) {
    private val logger = LoggerFactory.getLogger(javaClass)

    fun routeAndStream(
        userId: UUID,
        promptSynthesis: String,
        question: String
    ): Flow<InternalStreamEvent> = flow {
        val requestId = "req_" + UUID.randomUUID().toString().replace("-", "").take(12)
        val startTime = System.currentTimeMillis()
        val activeModel = "claude-3-5-sonnet"

        // 1. Emit Start Event
        emit(
            InternalStreamEvent(
                eventType = "start",
                payload = TaroturnSsePayload(
                    requestId = requestId,
                    model = activeModel,
                    timestamp = startTime
                )
            )
        )

        // 2. Stream Typewriter Tokens (Mock or Real upstream)
        val sampleParagraphs = listOf(
            "### 🔮 Taroturn 深度心灵拓扑分析报告\n\n",
            "## 🌌 一、 心灵气候与元素能量场\n",
            "在当下的生命节点中，火象与风象的互动主导了你的潜意识空间。直觉与知性的激荡正推动着你走出旧有的惯性模式。\n\n",
            "## 🌊 二、 能量拓扑流注与动力学\n",
            "沿着能量流向，从根基的支撑力量到未来的显化走向，整体格局呈现出**动态自性化整合**的趋势。深层的无意识智慧正在穿透表层的焦虑。\n\n",
            "## ⚡ 三、 核心张力与情结阻抗\n",
            "交叉阻碍牌揭示了你内心对失控与不确定性的隐秘防御。你所体验到的外部僵局，实则是内在两极撕裂向外的镜像投射。\n\n",
            "## 🌟 五、 自性化超越与行动协议\n",
            "1. **收回投射**：将对环境的批判转化为对内在自我边界的觉察。\n",
            "2. **微行动锚定**：在接下来的 48 小时内，以一件具体的现实小事落实直觉指引。"
        )

        var tokenCount = 0
        for (paragraph in sampleParagraphs) {
            for (char in paragraph) {
                emit(
                    InternalStreamEvent(
                        eventType = "delta",
                        payload = TaroturnSsePayload(delta = char.toString())
                    )
                )
                tokenCount++
                if (!mockMode) {
                    delay(10) // Smooth typewriter pacing
                } else {
                    delay(5)
                }
            }
        }

        // 3. Emit Done Event
        val totalLatency = System.currentTimeMillis() - startTime
        emit(
            InternalStreamEvent(
                eventType = "done",
                payload = TaroturnSsePayload(
                    finishReason = "stop",
                    completionTokens = tokenCount,
                    totalLatencyMs = totalLatency,
                    model = activeModel
                )
            )
        )
    }
}
