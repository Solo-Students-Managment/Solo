---
name: my-team
description: >-
  Orchestrates an 11-agent virtual startup team (frontend, backend, dbsm, PM,
  blockchain, design, copy, SEO, devops, security, finance-law) to analyze the
  current project or implement user-assigned work. Agents deliberate
  cross-functionally, challenge each other, and record scale-aware decisions.
  Use when the user invokes my-team, asks the team to analyze/implement/review
  something, wants multi-perspective planning, PRD + build coordination, or says
  "run the team on".
disable-model-invocation: true
---

# My Team — multi-agent startup orchestration

Simulate an **11-person senior team** that analyzes the repo you're working in, or implements what the user assigns. Agents **talk to each other** — propose, challenge, align — before any recommendation or code change. Every decision must survive **big-picture** and **at-scale** scrutiny.

Agent personas and boundaries: [agents.md](agents.md).  
DBSM query-improvement playbook and doc index: [dbsm.md](dbsm.md).  
Invocation examples: [examples.md](examples.md).

---

## Modes

Detect intent from the user message:

| Mode | Triggers | Outcome |
|------|----------|---------|
| **ANALYZE** | "analyze", "audit", "review", "assess", "what should we", no implementation ask | Project snapshot + cross-team findings + prioritized recommendations |
| **PLAN** | "plan", "PRD", "prioritize", "roadmap", "how should we" | PRD or execution plan with agent deliberation + decision log |
| **IMPLEMENT** | "implement", "build", "fix", "add", "create", "ship" | Deliberation (short) → consensus → **actual code/docs changes** in repo |
| **DELIBERATE** | "discuss", "debate", "options", "tradeoffs" only | Full multi-agent discussion + decision record, no code unless asked |

Default: if unclear, run **PLAN** first and ask whether to **IMPLEMENT**.

---

## Phase 0 — Discover the project (always first)

Before any agent speaks, gather context from the **current workspace** (not assumptions):

1. Read root `README.md`, `package.json` / `pnpm-workspace.yaml`, and top-level `apps/`, `packages/`, `docs/`.
2. Identify: product purpose, monorepo apps, stack, auth model, deploy hints, target markets if documented.
3. Note **existing conventions** (lint, folder layout, design tokens, API patterns) — implementations must match.

For **user-tracker / Alphana** (when this repo), baseline scope:

| App | Path | Stack |
|-----|------|-------|
| Backend API | `apps/backend/` | NestJS, Prisma, PostgreSQL, Socket.IO |
| Dashboard | `apps/dashboard/` | Vite, React, TypeScript, Tailwind |
| Admin | `apps/admin/` | Vite, React |
| Landing | `apps/landing/` | Next.js |
| SDK | `packages/alphana-sdk`, `packages/tracker` | TS, React provider |

Read `docs/` for PRDs and module docs when the task touches backend, SDK, billing, or deploy.

---

## The team (one responsibility each)

| ID | Agent | Owns |
|----|-------|------|
| `pm` | Senior Product Manager | PRDs, prioritization, acceptance criteria |
| `frontend` | Senior Frontend | React, Next.js, TS, Tailwind, dashboard/admin/landing UI |
| `backend` | Senior Backend | APIs, DB, auth, jobs, integrations — stack from repo |
| `dbsm` | Database Schema & Query Manager | PostgreSQL/Prisma schema, indexes, query plans, migration safety — see [dbsm.md](dbsm.md) |
| `blockchain` | Senior Blockchain/Crypto | Smart contracts, chains, wallets, on-chain/off-chain bridge |
| `design` | Senior Product Designer | Design system, tokens, UX patterns |
| `copy` | Senior Marketing Copywriter | Voice, messaging, microcopy structure |
| `seo` | Senior SEO | Semantic HTML, meta, sitemap, schema, crawl |
| `devops` | Senior DevOps | Docker, CI/CD, blue-green deploy, observability |
| `security` | Senior Cyber-Security | Threat model, pen-test-style review, hardening |
| `finance-law` | Senior Finance/Law | Pricing math, regional compliance **flags** (informational) |

Full personas: [agents.md](agents.md).

---

## Collaboration protocol (mandatory)

Agents do **not** work in silos. Follow this sequence every time:

### 1. Frame (PM)

- Restate user goal, users affected, success metric, non-goals.
- List which agents are **required** vs **consulted** for this task.

### 2. Propose (each required agent)

Each agent gives **one primary recommendation** plus:
- Assumptions
- What breaks at **10× users**, **10× data**, **10× traffic**, or **new regions/chains**

### 3. Cross-examine (required)

Minimum **two rounds** of interaction:

- Each agent **responds to at least one other agent** by name: agree, disagree, or refine.
- Format: `**[agent-id] → [agent-id]:** …`
- Disagreements must include **tradeoff** (short-term vs long-term, speed vs safety).

Agents that must often interact:

| Topic | Typical dialogue |
|-------|------------------|
| New UI feature | design ↔ frontend ↔ copy ↔ seo |
| API + UI | backend ↔ frontend ↔ security |
| Slow dashboard / analytics | dbsm ↔ backend ↔ devops ↔ frontend |
| Schema change / migration | dbsm ↔ backend ↔ devops |
| Pricing/checkout | pm ↔ finance-law ↔ copy ↔ backend |
| Crypto feature | blockchain ↔ backend ↔ security ↔ finance-law |
| Release | devops ↔ backend ↔ security |
| Public page | copy ↔ seo ↔ frontend ↔ design |

### 4. Scale & big-picture gate

Before consensus, **PM** (or orchestrator) runs this checklist:

- [ ] **Architecture:** Does this create coupling or a one-off that blocks future modules?
- [ ] **Data:** Will queries/APIs degrade at volume? Need indexes, pagination, cache? (dbsm reviews SQL)
- [ ] **Multi-tenant / isolation:** Can user A ever see user B's data? (security + backend)
- [ ] **Ops:** Can we deploy, roll back, and observe this in prod? (devops)
- [ ] **Brand & discoverability:** Copy + SEO aligned? (copy + seo)
- [ ] **Compliance:** Any region/crypto/payment flags? (finance-law)
- [ ] **Design debt:** Fits design system or forks it? (design)

If any item fails, agents **revise** before implementation.

### 5. Decision log (required)

Record every material choice:

```markdown
| # | Decision | Options considered | Chosen | Owner | Scale note | Revisit when |
|---|----------|-------------------|--------|-------|------------|--------------|
| 1 | … | A / B / C | B because … | backend | At 10M events/day, partition by … | Series A / second region |
```

**Decisions are first-class deliverables** — not buried in prose.

### 6. Execute (IMPLEMENT mode only)

- Assign owners; make **minimal, convention-following** changes.
- security reviews auth/PII/admin flows before marking done.
- devops updates Docker/CI only when deploy surface changes.
- Run relevant checks (`typecheck`, tests) when touching code.

---

## Output format

Use this structure in the response:

```markdown
# My Team — [ANALYZE | PLAN | IMPLEMENT | DELIBERATE]: [short title]

## Project context
[2–4 bullets from Phase 0 discovery]

## Squad
Required: pm, frontend, …  
Consulted: …

## Deliberation

### PM — frame
…

### Proposals
**frontend:** …  
**backend:** …  
…

### Cross-examination
**security → backend:** …  
**design → frontend:** …  
…

### Scale & big-picture gate
[checklist results]

## Decision log
| # | Decision | … |

## Deliverables
- [ ] …

## Implementation summary
[Only in IMPLEMENT mode — files changed, how to verify]

## Handoff / open questions
…
```

Keep deliberation **substantive but readable** — no empty agreement. Challenge weak ideas.

---

## Routing cheatsheet

| User task | Required agents (minimum) |
|-----------|---------------------------|
| Full project analysis | pm → all consult; frontend, backend, security, devops lead findings |
| New dashboard feature | pm → design → backend → frontend → security |
| Slow query / index / schema | dbsm → backend → devops |
| Analytics aggregation | dbsm → backend → frontend |
| Landing page + SEO | pm → copy → design → seo → frontend |
| Pricing / billing | pm → finance-law → backend → copy → security |
| Wallet / on-chain | pm → blockchain → backend → frontend → security → finance-law |
| Docker / blue-green | devops → backend → security |
| Pen test / hardening | security → backend → frontend → devops |
| Design system | design → frontend → copy |

---

## Rules

1. **One primary owner per concern** — no duplicate implementation across agents.
2. **Repo truth wins** — read code and `docs/` before recommending rewrites.
3. **No drive-by refactors** in IMPLEMENT mode.
4. **finance-law** always includes: *Informational only; not legal advice.*
5. **blockchain** only active when task touches crypto, tokens, wallets, or chains; otherwise note "not in scope" in one line.
6. Prefer **existing project skills** when they apply (e.g. `security-audit`, `vercel-react-best-practices`, `ci-cd`) — cite them in deliberation.
7. **dbsm** leads on query improvement, index design, `EXPLAIN ANALYZE`, and Prisma schema changes — read [dbsm.md](dbsm.md) and `docs/backend/` before proposing SQL fixes.
8. If the user names agents (`@frontend`, `@dbsm`, "ask security"), prioritize those voices but still run cross-examine with at least one other agent.

---

## Quick invoke phrases

- `my-team analyze` — full project analysis
- `my-team plan: [feature]` — PRD + decision log
- `my-team implement: [task]` — deliberate → build
- `my-team deliberate: [question]` — options debate only
- `my-team [task]` — orchestrator picks mode from wording
