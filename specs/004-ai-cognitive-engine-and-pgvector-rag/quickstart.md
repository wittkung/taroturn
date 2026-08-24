# Quickstart & Verification Guide: AI Cognitive Engine & pgvector RAG

- **Feature ID**: `004-ai-cognitive-engine-and-pgvector-rag`
- **Specification**: [spec.md](./spec.md)
- **Status**: `READY FOR IMPLEMENTATION`

---

## 1. Prerequisites

1. **PostgreSQL 16 with pgvector extension**:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
2. **Java 21 & Gradle 8.8+**:
   ```bash
   java -version # 21
   ```

---

## 2. Verification Scenarios

### Scenario 1: SSE Streaming Interpretation Verification
```bash
# Request streaming interpretation with Bearer JWT
curl -N -X POST http://localhost:8080/api/v1/ai/stream-interpret \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{"spreadId":"celtic_cross","question":"如何打破当下的战略僵局？","promptSynthesis":"..."}'
```

### Scenario 2: pgvector Cosine Top-K Retrieval Verification
```bash
# Run Spring Boot Integration Test for pgvector HNSW search
cd server/taroturn-server
./gradlew test --tests *MemoryRagTest*
```
