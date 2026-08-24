package com.taroturn.server.ai.streaming

import com.taroturn.server.auth.UserPrincipal
import com.taroturn.server.auth.UserRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.flow.map
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.codec.ServerSentEvent
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException
import java.util.concurrent.atomic.AtomicLong

data class StreamInterpretRequest(
    val spreadId: String,
    val question: String,
    val promptSynthesis: String,
    val preferredModel: String? = null
)

@RestController
@RequestMapping("/api/v1/ai")
class AiStreamingController(
    private val modelRouterService: ModelRouterService,
    private val userRepository: UserRepository
) {

    @PostMapping(
        value = ["/stream-interpret"],
        produces = [MediaType.TEXT_EVENT_STREAM_VALUE]
    )
    fun streamInterpret(
        @AuthenticationPrincipal principal: UserPrincipal,
        @RequestHeader(value = "Last-Event-ID", required = false) lastEventId: String?,
        @RequestBody request: StreamInterpretRequest
    ): Flow<ServerSentEvent<TaroturnSsePayload>> {
        val user = userRepository.findById(principal.id).orElseThrow {
            ResponseStatusException(HttpStatus.UNAUTHORIZED, "用户未登录或不存在")
        }

        // Pro 会员校验
        if (!user.isProMember()) {
            return flowOf(
                ServerSentEvent.builder<TaroturnSsePayload>()
                    .event("error")
                    .data(
                        TaroturnSsePayload(
                            code = "PRO_REQUIRED",
                            message = "深度 AI 心理学多维解读为 Pro 会员专享功能",
                            retryable = false
                        )
                    )
                    .build()
            )
        }

        val eventSeq = AtomicLong(lastEventId?.toLongOrNull() ?: 0L)

        return modelRouterService.routeAndStream(
            userId = user.id,
            promptSynthesis = request.promptSynthesis,
            question = request.question
        ).map { event ->
            val seq = eventSeq.incrementAndGet()
            ServerSentEvent.builder<TaroturnSsePayload>()
                .id(seq.toString())
                .event(event.eventType)
                .data(event.payload)
                .build()
        }
    }
}
