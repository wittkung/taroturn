package com.taroturn.server.auth

import com.taroturn.server.model.UserTier
import io.jsonwebtoken.Claims
import io.jsonwebtoken.JwtException
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import org.springframework.beans.factory.annotation.Value
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Component
import java.nio.charset.StandardCharsets
import java.util.*

@Component
class JwtTokenProvider(
    @Value("\${taroturn.jwt.secret:default-insecure-secret-key-that-is-at-least-256-bits-long}")
    private val jwtSecret: String,
    @Value("\${taroturn.jwt.expiration-ms:2592000000}")
    private val jwtExpirationMs: Long
) {
    private val signingKey by lazy {
        Keys.hmacShaKeyFor(jwtSecret.toByteArray(StandardCharsets.UTF_8))
    }

    fun generateToken(userId: UUID, tier: UserTier, nickname: String): String {
        val now = Date()
        val expiry = Date(now.time + jwtExpirationMs)
        return Jwts.builder()
            .subject(userId.toString())
            .claim("tier", tier.name)
            .claim("nickname", nickname)
            .issuedAt(now)
            .expiration(expiry)
            .signWith(signingKey)
            .compact()
    }

    fun validateToken(token: String): Boolean {
        return try {
            val claims = parseClaims(token)
            !claims.expiration.before(Date())
        } catch (_: JwtException) {
            false
        } catch (_: IllegalArgumentException) {
            false
        }
    }

    fun getAuthentication(token: String): Authentication? {
        return try {
            val claims = parseClaims(token)
            val userId = UUID.fromString(claims.subject)
            val tierStr = claims.get("tier", String::class.java) ?: UserTier.FREE.name
            val tier = try {
                UserTier.valueOf(tierStr)
            } catch (_: Exception) {
                UserTier.FREE
            }
            val nickname = claims.get("nickname", String::class.java) ?: "Seeker"

            val principal = UserPrincipal(id = userId, tier = tier, nickname = nickname)
            UsernamePasswordAuthenticationToken(principal, token, principal.authorities)
        } catch (_: Exception) {
            null
        }
    }

    private fun parseClaims(token: String): Claims {
        return Jwts.parser()
            .verifyWith(signingKey)
            .build()
            .parseSignedClaims(token)
            .payload
    }
}
