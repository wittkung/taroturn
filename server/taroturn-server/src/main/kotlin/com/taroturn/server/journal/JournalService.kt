package com.taroturn.server.journal

import com.taroturn.server.auth.UserPrincipal
import com.taroturn.server.auth.UserRepository
import com.taroturn.server.model.ReadingSessionEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.stereotype.Repository
import org.springframework.stereotype.Service
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException
import java.time.Instant
import java.util.*

@Repository
interface ReadingSessionRepository : JpaRepository<ReadingSessionEntity, UUID> {
    fun findByUserIdOrderByCreatedAtDesc(userId: UUID): List<ReadingSessionEntity>
}

data class SyncJournalEntry(
    val operation: String,
    val sessionId: UUID,
    val spreadId: String,
    val question: String?,
    val rngSeed: String,
    val reversalProbability: Float,
    val placedCards: String,
    val dignityAnalysis: String,
    val userNotes: String?,
    val isFavorite: Boolean
)

data class SyncJournalRequest(
    val clientId: String,
    val entries: List<SyncJournalEntry>
)

data class SyncJournalResponse(
    val syncedCount: Int,
    val timestamp: Long
)

@Service
class JournalService(
    private val sessionRepo: ReadingSessionRepository,
    private val userRepo: UserRepository
) {
    fun syncJournal(principal: UserPrincipal, request: SyncJournalRequest): SyncJournalResponse {
        val user = userRepo.findById(principal.id).orElseThrow {
            ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found")
        }

        // Strict Pro-gated access check: Non-members do NOT have cloud history retention
        if (!user.isProMember()) {
            throw ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "云端历史记录同步为 Pro 会员专享功能。非会员不保留任何历史占卜记录。"
            )
        }

        var count = 0
        for (entry in request.entries) {
            if (entry.operation == "UPSERT") {
                val entity = ReadingSessionEntity(
                    id = entry.sessionId,
                    user = user,
                    spreadId = entry.spreadId,
                    question = entry.question,
                    rngSeed = entry.rngSeed,
                    reversalProbability = entry.reversalProbability,
                    placedCards = entry.placedCards,
                    dignityAnalysis = entry.dignityAnalysis,
                    userNotes = entry.userNotes,
                    isFavorite = entry.isFavorite,
                    createdAt = Instant.now(),
                    updatedAt = Instant.now()
                )
                sessionRepo.save(entity)
                count++
            } else if (entry.operation == "DELETE") {
                sessionRepo.deleteById(entry.sessionId)
                count++
            }
        }

        return SyncJournalResponse(syncedCount = count, timestamp = System.currentTimeMillis())
    }

    fun listHistory(principal: UserPrincipal): List<ReadingSessionEntity> {
        val user = userRepo.findById(principal.id).orElseThrow {
            ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found")
        }
        if (!user.isProMember()) {
            throw ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "历史占卜记录查看为 Pro 会员专享功能。"
            )
        }
        return sessionRepo.findByUserIdOrderByCreatedAtDesc(principal.id)
    }
}

@RestController
@RequestMapping("/api/v1/journal")
class JournalController(private val journalService: JournalService) {

    @PostMapping("/sync")
    fun sync(
        @AuthenticationPrincipal principal: UserPrincipal,
        @RequestBody request: SyncJournalRequest
    ): ResponseEntity<SyncJournalResponse> {
        val res = journalService.syncJournal(principal, request)
        return ResponseEntity.ok(res)
    }

    @GetMapping("/history")
    fun getHistory(
        @AuthenticationPrincipal principal: UserPrincipal
    ): ResponseEntity<List<ReadingSessionEntity>> {
        val history = journalService.listHistory(principal)
        return ResponseEntity.ok(history)
    }
}
