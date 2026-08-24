package com.taroturn.server.ai

import com.taroturn.server.auth.UserPrincipal
import com.taroturn.server.auth.UserRepository
import org.springframework.http.HttpStatus
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException
import java.util.UUID

data class ClarifyQuestionRequest(
    val sessionId: UUID,
    val userQuestion: String,
    val slotId: Int? = null,
    val previousContext: String? = null
)

data class ClarifyAnswerResponse(
    val answer: String,
    val socraticPrompt: String,
    val relatedArchetype: String
)

@RestController
@RequestMapping("/api/v1/ai")
class AiClarificationController(
    private val userRepository: UserRepository
) {

    @PostMapping("/clarify")
    fun clarifySession(
        @AuthenticationPrincipal principal: UserPrincipal,
        @RequestBody request: ClarifyQuestionRequest
    ): ClarifyAnswerResponse {
        val user = userRepository.findById(principal.id).orElseThrow {
            ResponseStatusException(HttpStatus.UNAUTHORIZED, "用户未登录")
        }

        if (!user.isProMember()) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "多轮多维解盘为 Pro 会员专享功能")
        }

        return ClarifyAnswerResponse(
            answer = "关于「${request.userQuestion}」，从原型心理学视角审视，这一困惑反映了你在意识层面的掌控欲望与潜意识真实需求之间的微小拉扯。当你接纳当下的不确定性时，内在自性将自然浮现答案。",
            socraticPrompt = "试问自己：如果放下对'必须立刻得到确定结果'的执念，你此刻最渴望保护的真实内核是什么？",
            relatedArchetype = "The Hermit / 内在隐士原型"
        )
    }
}
