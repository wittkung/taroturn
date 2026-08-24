package com.taroturn.server

import com.taroturn.server.auth.JwtTokenProvider
import com.taroturn.server.model.UserTier
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.post
import java.util.UUID

@SpringBootTest
@AutoConfigureMockMvc
class SecurityIntegrationTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var jwtTokenProvider: JwtTokenProvider

    @Test
    fun `unauthenticated access to journal history should be rejected with 401 or 403`() {
        mockMvc.get("/api/v1/journal/history")
            .andExpect {
                status { isForbidden() }
            }
    }

    @Test
    fun `unauthenticated access to ai interpret should be rejected with 401 or 403`() {
        mockMvc.post("/api/v1/ai/interpret") {
            contentType = MediaType.APPLICATION_JSON
            content = """{"spreadId":"daily_single","question":"test","placedCardsSummary":"","dominantElement":"Fire"}"""
        }.andExpect {
            status { isForbidden() }
        }
    }

    @Test
    fun `spoofed X-User-Id header without valid JWT must be rejected`() {
        mockMvc.get("/api/v1/journal/history") {
            header("X-User-Id", UUID.randomUUID().toString())
        }.andExpect {
            status { isForbidden() }
        }
    }

    @Test
    fun `valid token provider generates parseable JWT with claims`() {
        val userId = UUID.randomUUID()
        val token = jwtTokenProvider.generateToken(userId, UserTier.PRO_MONTHLY, "TestProUser")
        assert(jwtTokenProvider.validateToken(token))
        val auth = jwtTokenProvider.getAuthentication(token)
        assert(auth != null)
        assert(auth?.name == userId.toString())
    }
}
