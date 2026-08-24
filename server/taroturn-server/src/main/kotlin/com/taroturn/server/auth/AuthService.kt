package com.taroturn.server.auth

import com.taroturn.server.model.UserEntity
import com.taroturn.server.model.UserTier
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Repository
import org.springframework.stereotype.Service
import org.springframework.web.bind.annotation.*
import java.util.*

@Repository
interface UserRepository : JpaRepository<UserEntity, UUID> {
    fun findByWechatOpenid(openid: String): Optional<UserEntity>
    fun findByAppleSub(appleSub: String): Optional<UserEntity>
    fun findByEmail(email: String): Optional<UserEntity>
}

data class WechatLoginRequest(val code: String)
data class AuthResponse(
    val token: String,
    val userId: UUID,
    val nickname: String,
    val tier: UserTier,
    val isPro: Boolean
)

@Service
class AuthService(
    private val userRepository: UserRepository,
    private val jwtTokenProvider: JwtTokenProvider,
    private val wechatAuthClient: WechatAuthClient
) {
    fun loginWithWechat(code: String): AuthResponse {
        val openId = wechatAuthClient.code2Session(code)
        val user = userRepository.findByWechatOpenid(openId).orElseGet {
            userRepository.save(
                UserEntity(
                    wechatOpenid = openId,
                    nickname = "WeChat Seeker",
                    tier = UserTier.FREE
                )
            )
        }

        val token = jwtTokenProvider.generateToken(user.id, user.tier, user.nickname)
        return AuthResponse(
            token = token,
            userId = user.id,
            nickname = user.nickname,
            tier = user.tier,
            isPro = user.isProMember()
        )
    }
}

@RestController
@RequestMapping("/api/v1/auth")
class AuthController(private val authService: AuthService) {

    @PostMapping("/wechat")
    fun loginWechat(@RequestBody req: WechatLoginRequest): ResponseEntity<AuthResponse> {
        val response = authService.loginWithWechat(req.code)
        return ResponseEntity.ok(response)
    }
}
