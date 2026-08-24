package com.taroturn.server.ai

import com.taroturn.server.auth.UserPrincipal
import com.taroturn.server.auth.UserRepository
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.stereotype.Service
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException

data class AiInterpretationRequest(
    val spreadId: String,
    val question: String,
    val placedCardsSummary: String,
    val dominantElement: String
)

data class AiInterpretationResponse(
    val interpretationMarkdown: String,
    val modelUsed: String
)

@Service
class AiInterpretationService(private val userRepo: UserRepository) {

    fun generateInterpretation(principal: UserPrincipal, request: AiInterpretationRequest): AiInterpretationResponse {
        val user = userRepo.findById(principal.id).orElseThrow {
            ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found")
        }

        // Strict Pro-gating: Non-members cannot access cloud AI interpretation
        if (!user.isProMember()) {
            throw ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "深度 AI 心理学多维解读为 Pro 会员专享功能。非会员无法使用云端 AI 解读。"
            )
        }

        val promptSynthesis = """
            ### 🔮 Taroturn 深度灵性与心理学解读报告
            
            **问题焦点**：${request.question}
            **主导能量**：${request.dominantElement}
            
            **核心启示**：
            当前阶段你所面临的挑战并非偶然，而是内在心智成长的必然契机。
            ${request.placedCardsSummary}
            
            **行动指南**：
            保持内在中心，将直觉洞察转化为踏实的日常行动步骤。
        """.trimIndent()

        return AiInterpretationResponse(
            interpretationMarkdown = promptSynthesis,
            modelUsed = "Taroturn-Pro-Divination-v1"
        )
    }
}

@RestController
@RequestMapping("/api/v1/ai")
class AiController(private val aiService: AiInterpretationService) {

    @PostMapping("/interpret")
    fun interpret(
        @AuthenticationPrincipal principal: UserPrincipal,
        @RequestBody request: AiInterpretationRequest
    ): ResponseEntity<AiInterpretationResponse> {
        val response = aiService.generateInterpretation(principal, request)
        return ResponseEntity.ok(response)
    }
}
