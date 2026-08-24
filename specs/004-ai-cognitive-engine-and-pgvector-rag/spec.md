# Feature Specification: AI Cognitive Interpretation Engine & pgvector Personal Memory RAG

- **Feature ID**: `004-ai-cognitive-engine-and-pgvector-rag`
- **Pipeline Mode**: `[Full SDD]`
- **Status**: `SPECIFY DRAFT`
- **Author**: Antigravity / CTO Persona
- **Target Branch**: `main`

---

## 1. Executive Summary & User Value

Taroturn Cognitive Sanctuary elevates divination from static card keyword lookup to a profound, multi-dimensional Jungian psychological dialogue and long-term personal trajectory analysis:
1. **Topological DAG & Dignity Prompt Synthesizer**: Converts the 7 directed spread relations (`Crosses`, `FlowsTo`, `Supports`, `Opposes`, `Illuminates`, `Synthesizes`, `Reflects`), pairwise elemental dignity tension scores, 36 astrological decans, and Kabbalistic Sephiroth into a structured Chain-of-Thought (CoT) prompt for large language models.
2. **Multi-Model Streaming Router (SSE)**: Delivers low-latency ($<300\text{ms}$ TTFT) Server-Sent Events typing streams across Web, WeChat Mini Program (`enableChunked`), and Apple SwiftUI (`AsyncSequence`), with automatic model fallback (Claude 3.5 Sonnet $\to$ Gemini 1.5 Pro $\to$ DeepSeek-V3 $\to$ Local Ollama/AGY).
3. **pgvector Personal Unconscious RAG**: Embeds historical readings and reflections using 1536-dim / 768-dim vectors, discovering repetitive karmic loops, tracing archetypal shift trajectories over time, and grounding new readings in the user's authentic psychological evolution.
4. **Interactive Multi-Turn Deep Clarification**: Enables seekers to engage in reflective dialogues about specific cards, shadow tensions, or action plans with full conversational context.

---

## 2. User Stories & Acceptance Scenarios

### User Story 1 (P1): Topological DAG AI Interpretation with Streaming Delivery
> **As a** seeker exploring a reading (e.g. Celtic Cross),  
> **I want to** receive an eloquent, deep Jungian psychological analysis that understands the directional energy flows and elemental tensions between cards, delivered smoothly via a typewriter stream,  
> **So that** I gain profound actionable clarity rather than generic horoscope clichés.

- **Scenario 1.1 (Structured DAG Prompt Synthesis)**:
  - *Given* a completed reading with active topological edges (e.g. Crossing obstacle tension: $-0.30$),
  - *When* AI interpretation is requested,
  - *Then* the server synthesizes the full DAG energy matrix into the LLM system prompt and begins streaming the analysis within $<400\text{ms}$.
- **Scenario 1.2 (Multi-Platform SSE Streaming)**:
  - *Given* an active interpretation request from Web, Mini Program, or Apple app,
  - *When* streaming tokens from the LLM,
  - *Then* the response streams seamlessly over SSE chunks with heartbeat guards and zero dropped characters.

---

### User Story 2 (P1): pgvector Historical Trajectory & Karmic Loop Retrieval
> **As a** Pro member reflecting on my life patterns over months,  
> **I want the** AI to recognize recurring archetypal themes and karmic loops across my historical journal entries,  
> **So that** I can consciously transcend repetitive subconscious obstacles.

- **Scenario 2.1 (Vector Embedding on Session Sync)**:
  - *Given* a new reading saved to the journal with user notes,
  - *When* the entry is synced to PostgreSQL,
  - *Then* a dense vector embedding is generated and indexed in `pgvector` with HNSW cosine similarity.
- **Scenario 2.2 (Top-K Memory RAG in Interpretation)**:
  - *Given* a user asking about a career crisis who had a similar Swords crisis 3 months ago,
  - *When* generating the AI interpretation,
  - *Then* the engine retrieves the top 3 historical echoes and weaves the longitudinal trajectory into the advice.

---

### User Story 3 (P2): Multi-Turn Socratic Shadow Dialogue
> **As a** user needing deeper clarity on a specific challenging card (e.g. The Devil reversed in the Shadow slot),  
> **I want to** ask follow-up questions directly within the reading context,  
> **So that** the AI guides me through a Socratic self-inquiry rather than lecturing me.

- **Scenario 3.1 (Contextual Multi-Turn Conversation)**:
  - *Given* an ongoing reading session,
  - *When* the user submits: "Why does the 8 of Swords in my environment conflict with the Devil in my subconscious?",
  - *Then* the model resolves the slot cross-reference and provides a compassionate Jungian dialogue.

---

## 3. Functional Requirements (FR-###)

- **FR-001**: The server MUST implement `DagPromptSynthesizer` converting `SpreadSlot`, `SlotEdge`, `PairwiseDignity`, and 36 Decan archetypes into structured Markdown LLM prompts.
- **FR-002**: The server MUST expose a reactive SSE endpoint `/api/v1/ai/stream-interpret` streaming Markdown text using Spring WebFlux / Kotlin Coroutines.
- **FR-003**: The server MUST implement `ModelRouterService` with dynamic fallback routing across Claude 3.5, Gemini 1.5 Pro, DeepSeek-V3, and Mock/Local engine.
- **FR-004**: The database schema MUST enable `pgvector` extension with an `embeddings` column (`vector(1536)` / `vector(768)`) and an HNSW index on `reading_sessions`.
- **FR-005**: The server MUST implement `UnconsciousMemoryService` providing top-$K$ cosine similarity search restricted strictly to the authenticated `UserPrincipal`.
- **FR-006**: The server MUST implement `ArchetypeTrajectoryAnalyzer` computing elemental shifts and recurring shadow card frequencies across historical sessions.
- **FR-007**: The server MUST expose a multi-turn clarification endpoint `/api/v1/ai/clarify` maintaining session context.

---

## 4. Success Criteria (SC-###)

- **SC-001**: Time to First Token (TTFT) on streaming interpretation is $<400\text{ms}$ under standard network conditions.
- **SC-002**: pgvector Top-5 similarity search over 10,000 historical reading vectors executes in $<15\text{ms}$.
- **SC-003**: 100% strict user data isolation (zero data leakage between distinct user IDs in vector queries).
- **SC-004**: Automatic fallback succeeds within $<1.5\text{s}$ upon primary model upstream timeout or 5xx error.
