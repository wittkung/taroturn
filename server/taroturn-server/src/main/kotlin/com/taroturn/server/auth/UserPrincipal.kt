package com.taroturn.server.auth

import com.taroturn.server.model.UserTier
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.UserDetails
import java.util.UUID

data class UserPrincipal(
    val id: UUID,
    val tier: UserTier,
    val nickname: String
) : UserDetails {

    override fun getAuthorities(): Collection<GrantedAuthority> {
        val authorities = mutableListOf<GrantedAuthority>(SimpleGrantedAuthority("ROLE_USER"))
        if (tier != UserTier.FREE) {
            authorities.add(SimpleGrantedAuthority("ROLE_PRO"))
        }
        return authorities
    }

    fun isPro(): Boolean = tier != UserTier.FREE

    override fun getPassword(): String = ""

    override fun getUsername(): String = id.toString()

    override fun isAccountNonExpired(): Boolean = true

    override fun isAccountNonLocked(): Boolean = true

    override fun isCredentialsNonExpired(): Boolean = true

    override fun isEnabled(): Boolean = true
}
