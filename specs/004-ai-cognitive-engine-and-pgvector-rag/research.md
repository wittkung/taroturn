# Research: AI Cognitive Architecture & pgvector Technical Decisions

- **Feature ID**: `004-ai-cognitive-engine-and-pgvector-rag`
- **Specification**: [spec.md](./spec.md)
- **Status**: `COMPLETED`

---

## 1. Technical Decisions & Rationales

### Decision 1: HNSW Cosine Index over IVFFlat
- **Chosen Approach**: PostgreSQL `pgvector` HNSW index with `m = 16`, `ef_construction = 64`, using `vector_cosine_ops`.
- **Rationale**: IVFFlat requires periodic `REINDEX` when incremental journal rows are added and has poor recall on small/medium datasets without pre-warmed cluster centroids. HNSW provides $>99\%$ recall, zero-maintenance dynamic inserts, and sub-5ms latency.
- **Alternatives Evaluated**:
  - *IVFFlat*: Fast build time but fragile recall under continuous incremental insertions.
  - *External Vector DB (Milvus/Pinecone/Qdrant)*: Extra infrastructure overhead and breaks PostgreSQL relational integrity with user accounts.

---

### Decision 2: Spring WebFlux SSE & Cascading Fallback Router
- **Chosen Approach**: Spring Boot 3.3 WebFlux with Kotlin Coroutines `Flow<ServerSentEvent<TaroturnSsePayload>>`, paired with tiered cascading fallback (Claude 3.5 Sonnet $\to$ Gemini 1.5 Pro $\to$ DeepSeek-V3 $\to$ Local Mock).
- **Rationale**: Non-blocking Reactor Netty EventLoop uses $<4\text{KB}$ RAM per long-held SSE connection, easily scaling to 10,000+ concurrent divination streams. TCP RST propagation instantly halts upstream LLM calls, saving API tokens.
- **Alternatives Evaluated**:
  - *Spring MVC + Tomcat Virtual Threads*: Simple but higher heap overhead for 30s+ holding connections.
  - *WebSocket*: Bidirectional but heavier handshake and poorer CDN/proxy caching compared to HTTP/2 SSE.

---

### Decision 3: 5-Stage Jungian CoT & Decan Prompt Synthesis
- **Chosen Approach**: Structured Chain-of-Thought with 5 sequential phases: Macro Climate $\to$ Topological Dynamics $\to$ Core Tension $\to$ Shadow Depth $\to$ Actionable Integration.
- **Rationale**: Unifies the 7 topological directed relations (`Crosses`, `FlowsTo`, `Supports`, `Opposes`, `Illuminates`, `Synthesizes`, `Reflects`) and pairwise dignity tension scores into a cohesive psychological narrative, eliminating generic astrology clichés.
- **Alternatives Evaluated**:
  - *Flat prompt concatenation*: Disregards directed energy flows and elemental opposition nuances.
