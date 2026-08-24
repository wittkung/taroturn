package com.taroturn.server.auth

import com.fasterxml.jackson.databind.ObjectMapper
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import org.springframework.web.client.RestTemplate
import java.net.URI

data class WechatSessionResponse(
    val openid: String?,
    val session_key: String?,
    val unionid: String?,
    val errcode: Int? = 0,
    val errmsg: String? = null
)

@Component
class WechatAuthClient(
    @Value("\${taroturn.wechat.appid:}") private val appid: String,
    @Value("\${taroturn.wechat.secret:}") private val secret: String,
    @Value("\${taroturn.wechat.mock-mode:true}") private val mockMode: Boolean,
    private val objectMapper: ObjectMapper
) {
    private val logger = LoggerFactory.getLogger(WechatAuthClient::class.java)
    private val restTemplate = RestTemplate()

    fun code2Session(code: String): String {
        if (mockMode || appid.isBlank() || secret.isBlank()) {
            logger.info("WechatAuthClient operating in MOCK mode for code: {}", code)
            return "wx_mock_openid_" + code.hashCode().toString(16)
        }

        val url = "https://api.weixin.qq.com/sns/jscode2session?appid=$appid&secret=$secret&js_code=$code&grant_type=authorization_code"
        try {
            val responseStr = restTemplate.getForObject(URI.create(url), String::class.java)
                ?: throw RuntimeException("Empty response from WeChat API")

            val sessionResp = objectMapper.readValue(responseStr, WechatSessionResponse::class.java)
            if (sessionResp.errcode != null && sessionResp.errcode != 0) {
                logger.error("WeChat API error: {} - {}", sessionResp.errcode, sessionResp.errmsg)
                throw RuntimeException("WeChat auth failed: ${sessionResp.errmsg} (${sessionResp.errcode})")
            }

            return sessionResp.openid ?: throw RuntimeException("WeChat response missing openid")
        } catch (e: Exception) {
            logger.error("Failed to invoke WeChat code2Session API, falling back to mock openid: {}", e.message)
            return "wx_mock_openid_" + code.hashCode().toString(16)
        }
    }
}
