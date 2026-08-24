# Implementation Plan: AI Cognitive Interpretation Engine & pgvector Personal Memory RAG

- **Feature ID**: `004-ai-cognitive-engine-and-pgvector-rag`
- **Specification**: [spec.md](./spec.md)
- **Data Model**: [data-model.md](./data-model.md)
- **Research**: [research.md](./research.md)
- **Contracts**: [contracts/](./contracts)
- **Quickstart**: [quickstart.md](./quickstart.md)
- **Status**: `PLANNING`

---

## 1. Technical Context & Cognitive Architecture

```
                       ┌─────────────────────────────────────────────────────────┐
                       │               Taroturn Client Ecosystem                 │
                       │     (Web Fetch / MiniProgram Chunked / SwiftUI Stream)   │
                       └────────────────────────────┬────────────────────────────┘
                                                    │ POST /api/v1/ai/stream-interpret
                                                    ▼
                       ┌─────────────────────────────────────────────────────────┐
                       │    taroturn-server (Spring Boot 3.3.2 + WebFlux)        │
                       │           • Security: UserPrincipal JWT Filter          │
                       │           • SSE Controller: Flow<ServerSentEvent>       │
                       └────────────────────────────┬────────────────────────────┘
                                                    │
                   ┌────────────────────────────────┼────────────────────────────────┐
                   ▼                                ▼                                ▼
    ┌─────────────────────────────┐  ┌─────────────────────────────┐  ┌─────────────────────────────┐
    │     DagPromptSynthesizer    │  │  UnconsciousMemoryRagService│  │     ModelRouterService      │
    │  • 7 Topological Edge Map   │  │  • pgvector 0.1.6 HNSW Top-K │  │  • Claude 3.5 (Primary)     │
    │  • Pairwise Dignity Tensors │  │  • Temporal-Decay Cosine    │  │  • Gemini 1.5 Pro (Fallback) │
    │  • 36 Astrological Decans   │  │  • Karmic Loop Detector     │  │  • DeepSeek-V3 / Local Ollama│
    │  • 5-Stage Jungian CoT      │  │  • Archetype Trajectory     │  │  • UTF-8 Multi-byte Repair   │
    └─────────────────────────────┘  └─────────────────────────────┘  └─────────────────────────────┘
                                                    │
                                                    ▼
                                     ┌─────────────────────────────┐
                                     │  PostgreSQL 16 + pgvector   │
                                     │  • reading_sessions vector  │
                                     │  • user_trajectories table  │
                                     └─────────────────────────────┘
```

---

## 2. Phase Breakdown & Implementation Roadmap

### Phase 1: Database Migration & pgvector Setup
- Write Flyway migration script `V2__pgvector_embeddings.sql` enabling vector extension, adding `embedding vector(1536)` column, and creating HNSW index (`vector_cosine_ops`).
- Create `user_archetype_trajectories` snapshot table with composite uniqueness constraint.

### Phase 2: User Story 1 - Topological DAG Prompt Synthesizer & Streaming SSE
- Implement `DagPromptSynthesizer.kt` in `taroturn-server` converting `SpreadDAG` edges, pairwise tensions, and 36 Decans into 5-stage CoT prompts.
- Implement `AiStreamingController.kt` emitting `Flow<ServerSentEvent<TaroturnSsePayload>>`.
- Implement `ModelRouterService.kt` with cascading fallback (Claude 3.5 $\to$ Gemini 1.5 $\to$ DeepSeek $\to$ Local Mock).

### Phase 3: User Story 2 - pgvector Subconscious Memory RAG & Trajectory Analysis
- Implement `ReadingSessionVectorRepository.kt` with native pgvector cosine similarity query (`<=>`).
- Implement `UnconsciousMemoryRagService.kt` with dense embedding formulation and 180-day half-life temporal decay.
- Implement `ArchetypeTrajectoryAnalyzer.kt` detecting recurring Karmic loops and elemental shift velocities.

### Phase 4: User Story 3 - Multi-Turn Socratic Shadow Dialogue
- Implement `/api/v1/ai/clarify` endpoint supporting follow-up questions within reading context.

### Phase 5: Client-Side Streaming Integration & Polish
- Update `apps/taroturn-app` Web client with `fetchTarotStream` readable stream parser.
- Update `apps/taroturn-miniprogram` with `enableChunked` SSE parser.
- Update `apps/taroturn-apple` with `URLSession.AsyncBytes` stream parser.

---

## 3. Verification & Quality Gates

1. **pgvector Gate**: Flyway migration runs cleanly on PostgreSQL 16; HNSW Top-5 similarity search executes in $<10\text{ms}$.
2. **SSE Streaming Gate**: MockMvc / WebFlux tests verify streaming chunks arrive with valid event frames and TTFT $<400\text{ms}$.
3. **Multi-Model Gate**: Upstream 500 error triggers cascade fallback without client disconnection.
