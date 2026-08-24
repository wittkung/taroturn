# Technical Research & Architecture Decisions: Architecture Audit & Paradigm Upgrade

- **Feature ID**: `002-architecture-audit-and-paradigm-upgrade`
- **Target**: `taroturn-core`, `apps/taroturn-app`, `taroturn-server`
- **Status**: `RESOLVED`

---

## 1. Research Topic 1: Zero-Allocation Microkernel Memory Layout

### Context & Unknowns
How to guarantee $O(1)$ zero-allocation card queries for 78 Tarot cards while still satisfying UniFFI / C-ABI owned struct export requirements?

### Decisions
- **Decision**: Adopt a dual-representation pattern:
  1. Internal `StaticCardDefinition` with `&'static str` and static slices stored in `.rodata`.
  2. `std::sync::LazyLock<Vec<Card>>` static runtime cache initialized once for UniFFI and FFI clone demands.
- **Rationale**: `get_static(id)` achieves $<1\text{ns}$ index lookup without any string allocations. `get_by_id(id)` performs a single shallow clone of an already instantiated card rather than dynamically constructing 78 cards from scratch.
- **Alternatives Considered**:
  - *Dynamic JSON parsing at runtime*: High CPU and allocation overhead, especially in WASM.
  - *Compile-time `phf` Map*: Good for string key lookup, but unnecessary overhead for contiguous $0..77$ integer indices where a fixed array `[StaticCardDefinition; 78]` is optimal.

---

## 2. Research Topic 2: CSP Deterministic Shuffling & Slot Constraint Solving

### Context & Unknowns
How to enforce `SlotConstraint` (e.g. `MajorOnly`, `SwordsOnly`) across arbitrary spread slots without breaking the ChaCha20 seed deterministic replayability protocol or introducing rejection-sampling state divergence?

### Decisions
- **Decision**: Stream Drain Permutation Filtering (单调贪心洗牌熵流过滤法):
  1. Generate the full 78-card deterministic permutation using `ChaCha20Rng` from the 32-byte seed.
  2. Maintain a `[bool; 78]` consumption bitmap on the stack.
  3. For each slot $i$, scan the master deck stream from index 0 and select the first unconsumed card matching `slot.constraint`. Mark it as consumed.
- **Rationale**:
  - Deterministic: Identical seed always yields identical dealt cards for any spread.
  - Non-replacing: Guarantees no card duplication.
  - Linear scan: Maximum $78 \times 78 = 6,084$ comparisons ($<0.02\text{ms}$), zero heap allocations.
- **Alternatives Considered**:
  - *Separate Sub-deck Shuffling*: Shuffling Major and Minor arcana independently disrupts the unified full-deck physical entropy state.
  - *Rejection Sampling (re-rolling RNG)*: Advances RNG state non-uniformly depending on slot configuration, causing replay divergence across different spread definitions.

---

## 3. Research Topic 3: Golden Dawn Pairwise Elemental Dignity Tensor & DAG Graph

### Context & Unknowns
How to calculate micro-tensions between cards in a spread topologically rather than just global element percentage ratios?

### Decisions
- **Decision**: Model `Spread` as a Directed Acyclic Graph (DAG) with typed semantic relation edges (`SlotEdge`), and compute pairwise dignities:
  1. Classified into 4 classic interaction classes: Friendly Active (Fire+Air, $+0.9$), Friendly Passive (Water+Earth, $+0.9$), Intensified (Same element, $+0.6$), Contrary Hostile (Fire+Water / Air+Earth, $-0.9$), Neutral Modifying (Fire+Earth / Water+Air, $+0.2$).
  2. Apply Reversal attenuation multiplier ($1.0$ for both upright, $0.6$ for single reversal, $-0.5$ for double reversal).
  3. Compute weighted overall harmony score $\in [-1.0, 1.0]$.
- **Rationale**: Adheres strictly to the Hermetic Order of the Golden Dawn historical framework while enabling rich topological inputs for AI prompts.
- **Alternatives Considered**:
  - *Complete Graph ($K_N$) all-pairs calculation*: Calculating interactions between every pair in a 10-card spread ($45$ pairs) generates excessive noise; topological edges restrict calculations to meaningful geometric and semantic interactions.

---

## 4. Research Topic 4: Spring Security 6.3 Stateless JWT Architecture & Header Injection Immunity

### Context & Unknowns
How to eliminate header spoofing (`X-User-Id`), enforce Pro-tier gating, and handle WeChat Mini Program OAuth securely?

### Decisions
- **Decision**:
  1. Configure Spring Security `SessionCreationPolicy.STATELESS`.
  2. Add `JwtAuthenticationFilter` (`OncePerRequestFilter`) before `UsernamePasswordAuthenticationFilter`.
  3. Reject unauthenticated access to `/api/v1/journal/**` and `/api/v1/ai/**` with JSON 401/403 errors.
  4. Inject `@AuthenticationPrincipal principal: UserPrincipal` directly into Controller endpoints; delete all `@RequestHeader("X-User-Id")` occurrences.
  5. Implement `WechatAuthClient` with `jscode2session` call, configurable timeout, and deterministic Mock fallback mode for local/CI test suites.
- **Rationale**: Eliminates CVSS 9.8 vulnerability, prevents account hijacking, and guarantees strict Pro-tier subscription validation.
