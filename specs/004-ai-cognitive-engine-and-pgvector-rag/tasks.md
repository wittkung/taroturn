# Tasks: AI Cognitive Interpretation Engine & pgvector Personal Memory RAG

- **Feature ID**: `004-ai-cognitive-engine-and-pgvector-rag`
- **Specification**: [spec.md](./spec.md)
- **Plan**: [plan.md](./plan.md)
- **Data Model**: [data-model.md](./data-model.md)
- **Contracts**: [contracts/](./contracts)
- **Status**: `COMPLETED`

---

## Phase 1: Setup & Database Migration

- [x] T001 Write Flyway migration script in `server/taroturn-server/src/main/resources/db/migration/V2__pgvector_embeddings.sql`
- [x] T002 [P] Update `build.gradle.kts` with WebFlux and pgvector configurations in `server/taroturn-server/build.gradle.kts`

---

## Phase 2: Foundational AI Data & Prompt Synthesizer

- [x] T003 Implement `DagPromptSynthesizer` converting DAG edges and tensions into 5-stage CoT in `server/taroturn-server/src/main/kotlin/com/taroturn/server/ai/DagPromptSynthesizer.kt`
- [x] T004 [P] Define `TaroturnSsePayload` and streaming event models in `server/taroturn-server/src/main/kotlin/com/taroturn/server/ai/streaming/TaroturnSsePayload.kt`

---

## Phase 3: User Story 1 - Topological DAG AI Interpretation with Streaming Delivery

**Goal**: Deliver low-latency SSE streaming interpretation with cascading multi-model fallback.
**Independent Test Criteria**: POST `/api/v1/ai/stream-interpret` streams `delta` chunks with TTFT $<400\text{ms}$; fallback kicks in seamlessly upon upstream timeout.

- [x] T005 [US1] Implement `ModelRouterService` with cascading fallback across Claude, Gemini, DeepSeek, and Mock in `server/taroturn-server/src/main/kotlin/com/taroturn/server/ai/streaming/ModelRouterService.kt`
- [x] T006 [P] [US1] Implement `AiStreamingController` emitting `Flow<ServerSentEvent>` in `server/taroturn-server/src/main/kotlin/com/taroturn/server/ai/streaming/AiStreamingController.kt`
- [x] T007 [P] [US1] Implement Web client streaming reader in `apps/taroturn-app/src/services/aiStreamingService.ts`

---

## Phase 4: User Story 2 - pgvector Historical Trajectory & Karmic Loop Retrieval

**Goal**: Store dense embeddings in pgvector and perform top-K subconscious RAG with temporal decay.
**Independent Test Criteria**: HNSW cosine similarity search returns top-K historical sessions within $<10\text{ms}$; karmic loops are identified for recurring shadow cards.

- [x] T008 [US2] Implement `ReadingSessionVectorRepository` with pgvector native cosine query in `server/taroturn-server/src/main/kotlin/com/taroturn/server/journal/ReadingSessionVectorRepository.kt`
- [x] T009 [P] [US2] Implement `UnconsciousMemoryRagService` with 180-day temporal decay in `server/taroturn-server/src/main/kotlin/com/taroturn/server/ai/UnconsciousMemoryRagService.kt`
- [x] T010 [P] [US2] Implement `ArchetypeTrajectoryAnalyzer` for elemental shift and karmic loop detection in `server/taroturn-server/src/main/kotlin/com/taroturn/server/ai/ArchetypeTrajectoryAnalyzer.kt`

---

## Phase 5: User Story 3 - Multi-Turn Socratic Shadow Dialogue

**Goal**: Support contextual multi-turn inquiry for specific cards and psychological shadow tensions.
**Independent Test Criteria**: POST `/api/v1/ai/clarify` resolves slot references and streams reflective answers.

- [x] T011 [US3] Implement `AiClarificationService` and multi-turn Socratic controller in `server/taroturn-server/src/main/kotlin/com/taroturn/server/ai/AiClarificationService.kt`

---

## Phase 6: Polish & Multi-Tier Verification

- [x] T012 [P] Add Spring Boot WebFlux and SSE streaming test suite in `server/taroturn-server/src/test/kotlin/com/taroturn/server/AiStreamingIntegrationTest.kt`
- [x] T013 [P] Verify full workspace tests and web app build

---

## Dependencies & Execution Strategy

```
Phase 1 (Setup & Flyway V2) ──► Phase 2 (Foundational Prompt Synthesizer)
                                        │
             ┌──────────────────────────┴──────────────────────────┐
             ▼                                                     ▼
Phase 3 (Streaming SSE Router)                        Phase 4 (pgvector RAG & Trajectory)
             │                                                     │
             └──────────────────────────┬──────────────────────────┘
                                        ▼
                   Phase 5 (Multi-Turn Shadow Clarification)
                                        │
                                        ▼
                   Phase 6 (Verification & Polish)
```
