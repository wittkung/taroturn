package com.taroturn.server.ai.streaming

import com.fasterxml.jackson.annotation.JsonInclude

@JsonInclude(JsonInclude.Include.NON_NULL)
data class TaroturnSsePayload(
    val delta: String? = null,
    val requestId: String? = null,
    val model: String? = null,
    val finishReason: String? = null,
    val promptTokens: Int? = null,
    val completionTokens: Int? = null,
    val totalLatencyMs: Long? = null,
    val fromModel: String? = null,
    val toModel: String? = null,
    val reason: String? = null,
    val code: String? = null,
    val message: String? = null,
    val retryable: Boolean? = null,
    val timestamp: Long? = null
)

data class InternalStreamEvent(
    val eventType: String,
    val payload: TaroturnSsePayload
)
