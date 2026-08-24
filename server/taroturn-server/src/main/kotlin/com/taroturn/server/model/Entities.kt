package com.taroturn.server.model

import jakarta.persistence.*
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import java.time.Instant
import java.util.UUID

enum class UserTier {
    FREE,
    PRO_MONTHLY,
    PRO_ANNUAL,
    PRO_LIFETIME
}

@Entity
@Table(name = "users")
data class UserEntity(
    @Id
    val id: UUID = UUID.randomUUID(),

    @Column(name = "wechat_openid", unique = true)
    var wechatOpenid: String? = null,

    @Column(name = "wechat_unionid", unique = true)
    var wechatUnionid: String? = null,

    @Column(name = "apple_sub", unique = true)
    var appleSub: String? = null,

    @Column(unique = true)
    var email: String? = null,

    @Column(nullable = false)
    var nickname: String = "Seeker",

    @Column(name = "avatar_url")
    var avatarUrl: String? = null,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var tier: UserTier = UserTier.FREE,

    @Column(name = "tier_expires_at")
    var tierExpiresAt: Instant? = null,

    @Column(name = "created_at", nullable = false)
    val createdAt: Instant = Instant.now(),

    @Column(name = "updated_at", nullable = false)
    var updatedAt: Instant = Instant.now()
) {
    fun isProMember(): Boolean {
        if (tier == UserTier.PRO_LIFETIME) return true
        if (tier == UserTier.PRO_MONTHLY || tier == UserTier.PRO_ANNUAL) {
            return tierExpiresAt?.isAfter(Instant.now()) == true
        }
        return false
    }
}

@Entity
@Table(name = "reading_sessions")
data class ReadingSessionEntity(
    @Id
    val id: UUID,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    val user: UserEntity,

    @Column(name = "spread_id", nullable = false)
    val spreadId: String,

    @Column(columnDefinition = "TEXT")
    val question: String?,

    @Column(name = "rng_seed", nullable = false)
    val rngSeed: String,

    @Column(name = "reversal_probability", nullable = false)
    val reversalProbability: Float = 0.5f,

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "placed_cards", columnDefinition = "jsonb", nullable = false)
    val placedCards: String,

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "dignity_analysis", columnDefinition = "jsonb", nullable = false)
    val dignityAnalysis: String,

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "ai_interpretation", columnDefinition = "jsonb")
    var aiInterpretation: String? = null,

    @Column(name = "user_notes", columnDefinition = "TEXT")
    var userNotes: String? = null,

    @Column(name = "is_favorite", nullable = false)
    var isFavorite: Boolean = false,

    @Column(name = "created_at", nullable = false)
    val createdAt: Instant = Instant.now(),

    @Column(name = "updated_at", nullable = false)
    var updatedAt: Instant = Instant.now()
)
