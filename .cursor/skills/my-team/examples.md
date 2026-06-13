# My Team — examples

## Example 1: Analyze project

**User:** `my-team analyze`

**Expected flow:** Phase 0 discovery → pm frames "health of product/engineering" → frontend, backend, security, devops propose top findings → cross-examine (e.g. security challenges backend on WebSocket auth) → scale gate → decision log with prioritized recommendations → no code unless critical fix requested.

---

## Example 2: Plan a feature

**User:** `my-team plan: export analytics to CSV for enterprise customers`

**Expected flow:** pm PRD skeleton → backend (export API, limits) ↔ frontend (UI) ↔ security (IDOR, rate limits) ↔ devops (job queue, storage) → finance-law if enterprise pricing → decision log → handoff: "say implement to ship".

---

## Example 3: Implement

**User:** `my-team implement: add JSON-LD Organization schema to landing homepage`

**Expected flow:** Short deliberation: seo proposes schema → copy checks brand strings → frontend implements in `apps/landing/` → seo verifies semantics → decision log → list files changed + verify steps.

---

## Example 4: Deliberate only

**User:** `my-team deliberate: should we use localStorage or httpOnly cookies for dashboard JWT?`

**Expected flow:** security + backend + frontend debate → scale/abuse considerations → decision log with chosen pattern and migration note → **no code** until user asks.

---

## Example 5: Subset of agents

**User:** `my-team implement: dockerize backend with healthcheck — devops lead`

**Expected flow:** devops leads → backend confirms health endpoint → security reviews image/non-root → deliberation → changes under `apps/backend/` and/or root compose → runbook in deliverables.

---

## Example 6: Cross-team conflict (model good behavior)

**Topic:** Add real-time feature flags on every page view.

**Good cross-examine snippet:**

```markdown
**backend → frontend:** Polling flags per page view won't scale; prefer bootstrap bundle + WS patch or ETag cache.

**frontend → backend:** Agree. At 10× traffic, polling creates thundering herd — support SSE or socket channel.

**pm → both:** MVP: cache flags 60s server-side; revisit WS when customers > N. Decision #1 logged.

**security → backend:** Ensure flag endpoint can't leak other tenants' experiments — tenant scope in guard.
```

---

## Example 7: Blockchain optional

**User:** `my-team plan: USDC subscription payments`

**Required:** pm, blockchain, backend, frontend, security, finance-law, copy.  
**Consulted:** design, seo, devops.

blockchain leads chain + contract flow; finance-law flags US/EU MSB and stablecoin rules; security reviews wallet + webhook verification.

---

## Example 8: Query improvement (dbsm lead)

**User:** `my-team analyze: sessions overview endpoint is slow at 500k pageviews`

**Expected flow:** dbsm reads `sessions.service.ts` + `05-sessions.md` → proposes `EXPLAIN ANALYZE` on overview SQL → identifies missing `(app_id, occurred_at)` index or N+1 in `sessionDetailInclude` → **dbsm → backend:** raw SQL vs Prisma tradeoff → **devops → dbsm:** pg_stat_statements + connection pool → **security → dbsm:** confirm `appId` filter on all aggregates → decision log with index migration + revisit at partition threshold → optional IMPLEMENT: Prisma `@@index` + optimized query.
