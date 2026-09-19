---
name: security-audit
description: >-
  Performs a multi-perspective security audit of the user-tracker monorepo
  (backend, admin, dashboard, landing) against all docs/, producing a prioritized
  security todo list. Use when the user asks for a security audit, security
  todo list, security review, hardening backlog, IDOR check, XSS audit, SQL
  injection review, rate limiting assessment, auth flow analysis, token storage
  review, form sanitization audit, CSRF/CORS review, or asks whether users can
  see others' data. Triggers on: security audit, security todo, throttles,
  throttle, rate limit, SQL injection, XSS, sanitize forms, login/logout,
  token storage, authorization, IDOR, OWASP, secrets in git, WebSocket auth.
---

# Security Audit — user-tracker monorepo

Systematic security review of `apps/backend/`, `apps/admin/`, `apps/dashboard/`, `apps/landing/`, infrastructure configs, and **all files under `docs/`**. Output is a prioritized security todo list with file:line evidence.

## Companion skills (load before auditing)

Read these project skills and apply their checklists where relevant:

| Skill | Path | Use in audit |
|-------|------|--------------|
| **ci-cd** | `.cursor/skills/ci-cd/SKILL.md` | DevSecOps: secrets in git, container hardening, SAST/SCA gaps, pipeline security |
| **monitoring-observability** | `.cursor/skills/monitoring-observability/SKILL.md` | Security observability: failed logins, 401/403 rates, alerting gaps |
| **vercel-react-best-practices** | `.cursor/skills/vercel-react-best-practices/SKILL.md` | Client-side XSS, bundle exposure, event listener leaks |
| **web-design-guidelines** | `.cursor/skills/web-design-guidelines/SKILL.md` | Fetch Vercel guidelines; check security headers, CSP, auth form UX |
| **analytics-tracking** | `.cursor/skills/analytics-tracking/SKILL.md` | SDK secret exposure, PII in events, consent/masking |
| **mongodb-schema-design** | `.cursor/skills/mongodb-schema-design/SKILL.md` | Data isolation patterns (docs still reference Mongo models) |
| **ui-ux-pro-max** | `.cursor/skills/ui-ux-pro-max/SKILL.md` | Form UX affecting security: error messages, password fields, OTP flows |

---

## Audit workflow

### Phase 1 — Read documentation

Read **every file** under `docs/`. Start with these (security-critical order):

1. `docs/security/posture-review.md` — existing security posture review and known gaps
2. `docs/devops/deployment.md` — TLS, secrets, port exposure
3. `docs/backend/README.md` — dual auth model overview
4. `docs/backend/00-core.md` — bootstrap, ValidationPipe, Swagger, env defaults
5. `docs/backend/01-auth.md` — JWT, OTP, password hashing
6. `docs/backend/02-admin.md` — AdminGuard, admin CRUD
7. `docs/backend/03-apps.md` — SdkAppGuard, CORS, secret keys
8. `docs/backend/07-live.md` — WebSocket trust boundary
9. `docs/backend/10-screenshot-capture.md` — Puppeteer SSRF flags
10. `docs/backend/20-storage.md` — MinIO public-read policy
11. `docs/backend/21-sitemap-url-health.md` — same-origin crawl policy
12. `docs/backend/27-replays.md` — replay masking, signed URLs
13. `docs/sdk/README.md`, `docs/sdk/07-react.md` — SDK auth, `NEXT_PUBLIC_TRACKER_SECRET`
14. PRDs: `docs/prd/prd-analytics-export-and-api.md`, `docs/prd/prd-sitemap-url-health-crawler.md`
15. Remaining backend module docs (`04`–`28`, `99`–`103`, `DATABASE.md`)

Extract from docs:
- Documented security **requirements** (what must be true)
- Documented **gaps** (what docs admit is missing)
- **Inconsistencies** (e.g. Mongo vs Postgres, Traefik vs nginx)

### Phase 2 — Code audit (parallel exploration)

Explore each app independently, then cross-cut backend modules.

**Scope paths:**

| Area | Path | Focus |
|------|------|-------|
| Backend API | `apps/backend/src/` | Auth, guards, Prisma, raw SQL, CORS, WebSocket, storage, admin |
| Admin SPA | `apps/admin/src/` | Token storage, route guards, API client, uploads |
| Dashboard SPA | `apps/dashboard/src/` | Auth context, forms, Socket.IO, replay player |
| Landing | `apps/landing/src/` | Public forms, JSON-LD, tracker secret env, bundled API clients |
| Infrastructure | `docker-compose*.yml`, `deploy/`, root `.env*.example`, `apps/backend/.env.example` | Ports, defaults, secrets |
| Static serving | `apps/admin/nginx.conf`, `apps/dashboard/nginx.conf`, `apps/landing/next.config.mjs` | Security headers |

**Rules:**
- Do NOT assume — cite `path/to/file.ts:line` for every finding
- Grep first, then read matched files in context
- Check git tracking for committed secrets: `.env.production`, `.env.dev-server`

### Phase 3 — Cross-reference docs vs code

For each documented requirement or gap, mark:
- **Confirmed** — code matches doc
- **Contradicted** — doc says X, code does Y
- **Undocumented** — code issue not mentioned in docs

### Phase 4 — Produce deliverable

Write the prioritized security todo list using the output format below. Include a **Verified OK** section for controls that work correctly.

---

## Ten audit perspectives

Answer each perspective explicitly. Use the checklists and grep patterns in the appendix.

### 1. Authentication flow (login / logout / register / OTP)

**Key files:**
- `apps/backend/src/auth/auth.controller.ts`
- `apps/backend/src/auth/auth.service.ts`
- `apps/backend/src/auth/auth-otp.service.ts`
- `apps/backend/src/auth/jwt.strategy.ts`
- `apps/backend/src/auth/dto/auth.dto.ts`
- `apps/backend/src/auth/auth-validation.ts`
- `apps/backend/src/common/demo-user-read-only.interceptor.ts`

**Checklist:**
- [ ] Trace register → OTP → login → `/me` → profile update flows end-to-end
- [ ] Is there a logout endpoint? Token revocation/blacklist?
- [ ] Refresh token rotation or only long-lived access tokens?
- [ ] OTP entropy (digit count), TTL, max verify attempts, resend cooldown
- [ ] Password hashing algorithm and cost (bcrypt/Argon2 vs SHA-256)
- [ ] Password strength enforced on register AND login DTO?
- [ ] Demo user (`isDemo`) mutation blocking
- [ ] Admin vs dashboard login separation (`isAdmin` check)
- [ ] Deleted user handling on JWT validation (DB reload)

### 2. Token storage & session lifecycle

**Key files:**
- `apps/dashboard/src/contexts/auth.tsx` — `ut_token` in localStorage
- `apps/admin/src/contexts/AuthContext.tsx` — `admin_token` in localStorage
- `apps/admin/src/pages/LoginPage.tsx`
- `apps/dashboard/src/lib/api.ts`, `apps/admin/src/lib/api.ts`
- `apps/dashboard/src/hooks/useLive.ts`, `useLiveLogs.ts` — Socket.IO auth
- `apps/backend/src/auth/auth.module.ts` — JWT expiry, secret fallback

**Checklist:**
- [ ] Where tokens live: localStorage, sessionStorage, cookies, memory
- [ ] httpOnly cookie vs Bearer header tradeoff
- [ ] 401 handling: does client clear token and redirect?
- [ ] Admin: token validated on app load via `/auth/me`?
- [ ] Stale/invalid token UX in admin vs dashboard
- [ ] JWT claims vs DB reload for `isAdmin`, `isDemo`
- [ ] `JWT_EXPIRES_IN` env wired or hardcoded?
- [ ] `JWT_SECRET` fallback if env missing — fail fast in prod?
- [ ] SDK `secretKey` returned in dashboard API responses?
- [ ] `NEXT_PUBLIC_TRACKER_SECRET` exposed in landing bundle?
- [ ] Token key mismatches (e.g. `ut_token` vs `admin_token` in export code)

### 3. Authorization & IDOR — "Can users see others' information?"

**Key files:**
- `apps/backend/src/apps/app-scope.service.ts`
- `apps/backend/src/apps/apps.service.ts` — `findOne(appId, userId)`
- `apps/backend/src/admin/admin.guard.ts`
- `apps/backend/src/apps/sdk-app.guard.ts`
- `apps/backend/src/live/live.gateway.ts`
- Every `*.controller.ts` in backend modules

**Checklist — verify server-side scoping for EVERY resource:**

| Resource | Controller / service | Scoped by owner? |
|----------|---------------------|------------------|
| Apps | `apps.controller.ts` | |
| Sessions / events | `sessions.controller.ts`, `events.controller.ts` | |
| Logs | `logs.controller.ts` | |
| Replays | `replays.controller.ts` | |
| Funnels | `funnels.controller.ts` | |
| A/B tests | `ab-tests.controller.ts` | |
| Audience segments | `audience.controller.ts` | |
| Feature flags | `feature-flags.controller.ts` | |
| Heatmap pages | `heatmap-pages.controller.ts` | |
| Tickets | `tickets.controller.ts` | |
| Payments / subscriptions | `payments.controller.ts`, `subscriptions.controller.ts` | |
| Exports | `export.controller.ts` | |
| Growth / behavior analytics | `growth.controller.ts`, `behavior.controller.ts` | |

Additional checks:
- [ ] Admin impersonation: bounded to app owner? audited?
- [ ] SDK ingest: secret from App A cannot write to App B (`appId` match)?
- [ ] WebSocket `/live` `subscribe`: JWT + app ownership required?
- [ ] Public routes abuse: `GET /api/plans`, `/payments/callback`, contact form
- [ ] Horizontal privilege escalation: change `appId` in request body/query

### 4. SQL injection & unsafe queries

**Grep patterns:** see Appendix

**Key files:**
- `apps/backend/src/common/audience-segment-sql.ts`
- `apps/backend/src/common/analytics-sql.ts`
- `apps/backend/src/common/segment-fields.ts`
- Services using `$queryRaw`: `sessions.service.ts`, `audience.service.ts`, `behavior.service.ts`, `admin.service.ts`

**Checklist:**
- [ ] Every `$queryRaw` / `Prisma.raw` call site reviewed
- [ ] User values passed as bound parameters (`Prisma.sql` tagged template)?
- [ ] Column/table names only via allowlist before `Prisma.raw()`?
- [ ] User trait keys validated with regex before SQL interpolation?
- [ ] Search/filter/sort query params in list endpoints safe?
- [ ] No `queryRawUnsafe` with user input?

### 5. XSS & output encoding

**Grep patterns:** see Appendix

**Checklist:**
- [ ] `dangerouslySetInnerHTML`, `innerHTML`, `document.write`, `eval` usage
- [ ] User-generated content: tickets, messages, admin CMS — React text vs raw HTML
- [ ] rrweb replay DOM replay trust boundary
- [ ] CDN upload: SVG/JS MIME allowed → stored XSS on public bucket?
- [ ] CSP: global (nginx/Next) vs replay-export iframe only?
- [ ] DOMPurify or equivalent sanitizer used anywhere?
- [ ] Landing `JsonLd.tsx` — is payload app-controlled only?

### 6. Input validation & form sanitization

**Key files:**
- `apps/backend/src/main.ts` — global `ValidationPipe`
- All `dto/*.ts` files under backend modules
- `apps/dashboard/src/lib/auth-validation.ts`
- `apps/dashboard/src/pages/Register.tsx`, `Login.tsx`
- `apps/landing/src/components/ContactForm.tsx`
- `apps/backend/src/admin/admin.controller.ts` — `createUser`

**Checklist:**
- [ ] `ValidationPipe`: `whitelist`, `forbidNonWhitelisted`, `transform` enabled?
- [ ] Unguarded routes missing DTOs?
- [ ] Admin forms: client validation or server-only?
- [ ] Contact form: length limits, server validation
- [ ] Admin `createUser`: password policy enforced?
- [ ] File upload: size cap, MIME allowlist, magic-byte verification, path traversal

### 7. Rate limiting & abuse prevention

**Key files:**
- `apps/backend/src/auth/auth-otp.service.ts` — OTP cooldown
- `apps/backend/src/export/export-access.service.ts` — export limit
- `apps/backend/src/sitemap-health/sitemap-host-rate-limiter.service.ts`
- `apps/backend/src/billing/limits/limits.service.ts`
- `apps/backend/src/main.ts` — global throttler?

**Checklist:**
- [ ] Global HTTP throttling (`@nestjs/throttler` or equivalent)?
- [ ] `/auth/login` brute-force protection?
- [ ] `/auth/register`, OTP send/verify rate limits?
- [ ] SDK secret key brute-force on ingest endpoints?
- [ ] Public contact form throttling?
- [ ] Export rate limit: in-memory vs Redis (multi-instance)?
- [ ] Plan quotas (`LimitsService`) vs application-layer DoS

### 8. CSRF, CORS, security headers

**Key files:**
- `apps/backend/src/main.ts`
- `apps/backend/src/apps/cors.service.ts`
- `apps/backend/src/apps/sdk-app.guard.ts`
- `apps/admin/nginx.conf`, `apps/dashboard/nginx.conf`
- `apps/landing/next.config.mjs`

**Checklist:**
- [ ] Bearer-only API — CSRF risk assessment if cookies added later
- [ ] CORS: dynamic origins from DB + static allowlist
- [ ] Requests with missing `Origin` header allowed?
- [ ] `credentials: true` implications
- [ ] `SDK_AUTH_ALLOW_MISSING_ORIGIN` bypass in non-production
- [ ] Helmet or equivalent on NestJS?
- [ ] HSTS, `X-Content-Type-Options`, `X-Frame-Options`, CSP on SPAs
- [ ] Swagger `/api/docs` disabled in production?

### 9. SSRF & server-side fetch

**Key files:**
- `apps/backend/src/screenshot-capture/screenshot-capture.service.ts`
- `apps/backend/src/sitemap-health/` — crawler URL policy
- `apps/backend/src/payments/` — callback handling

**Checklist:**
- [ ] Puppeteer/Chromium: `--disable-web-security`, `--no-sandbox` flags
- [ ] Screenshot URL allowlist (`SCREENSHOT_ALLOWED_HOSTS`) enforced?
- [ ] Sitemap crawler: same-origin policy, internal IP blocked?
- [ ] Payment callback: authentication and idempotency

### 10. Secrets, deployment & supply chain

**Key files:**
- `docker-compose.yml`, `docker-compose.dev.yml`
- `deploy/`, `.env.dev.example`, `apps/backend/.env.example`
- `apps/backend/.env.production`, `apps/backend/.env.dev-server` (git tracking?)
- `apps/backend/src/load-env.ts`
- `apps/backend/src/storage/storage.service.ts`
- Backend `Dockerfile`

**Checklist:**
- [ ] Secrets committed to git? `.gitignore` gaps?
- [ ] Default credentials: MinIO, Postgres, JWT fallback
- [ ] Swagger/OpenAPI exposed in production
- [ ] Container runs as root?
- [ ] Host ports published: Postgres, Redis, MinIO (5433, 6379, 9000/9001)
- [ ] MinIO public-read bucket policy (`s3:GetObject` for `Principal: *`)
- [ ] Dependency vulnerability scanning in CI?

---

## Output format

Each finding:

```markdown
### [SEVERITY] Title

- **Category:** Auth | AuthZ | Injection | XSS | RateLimit | Secrets | Infra | SDK | WebSocket | Storage
- **Perspective:** e.g. "Can User A read User B's sessions?"
- **Location:** `path/to/file.ts:line` (or doc reference)
- **Current state:** What exists today
- **Risk:** What an attacker could do
- **Recommendation:** Concrete fix
- **Effort:** S | M | L
- **Doc alignment:** Matches gap in docs/security/posture-review.md? Y/N
```

**Severity:** Critical | High | Medium | Low | Info

**Group final output:**

1. **Critical / High** — fix before prod exposure
2. **Medium** — next sprint
3. **Low / hardening backlog**
4. **Verified OK** — controls correctly implemented (with evidence)

**End with:**
- Summary table (count by severity and category)
- Top 5 fixes to do this week
- Suggested follow-up: CI security scanning (see ci-cd skill DevSecOps section)

---

## Appendix — grep & search patterns

Run these from repo root. Read every match in context.

### Auth & guards

```bash
rg -l "JwtAuthGuard|AdminGuard|SdkAppGuard" apps/backend/src/
rg "localStorage\.(get|set)Item" apps/admin apps/dashboard apps/landing
rg "JWT_SECRET|change-me-in-production" apps/backend/
rg "createHash|bcrypt|argon|scrypt" apps/backend/src/auth/
```

### IDOR & scoping

```bash
rg -l "@Controller" apps/backend/src/ | xargs rg -L "JwtAuthGuard|SdkAppGuard|Public"
rg "AppScopeService|scopeForUser|findOne\(.*userId" apps/backend/src/
rg "req\.user\.id|ownerId" apps/backend/src/
```

### SQL injection

```bash
rg "\$queryRaw|\$executeRaw|Prisma\.raw|queryRawUnsafe" apps/backend/src/
rg "Prisma\.sql" apps/backend/src/
```

### XSS & dangerous DOM

```bash
rg "dangerouslySetInnerHTML|innerHTML|document\.write|\.eval\(" apps/
rg "DOMPurify|sanitize|xss" apps/ --ignore-case
```

### Rate limiting

```bash
rg -i "throttl|rate.?limit|rateLimit|cooldown" apps/backend/src/
rg "@nestjs/throttler" apps/backend/
```

### CORS, headers, SSRF

```bash
rg -i "helmet|cors|X-Frame|Content-Security-Policy|Strict-Transport" apps/
rg "disable-web-security|no-sandbox|puppeteer|chromium" apps/backend/
rg "SCREENSHOT_ALLOWED|isPublicUrl|allowlist" apps/backend/
```

### Secrets & infra

```bash
git ls-files | rg "\.env\.(production|dev-server|local)"
rg "minioadmin|change-me|alphana" docker-compose.yml apps/backend/
rg "swagger|SwaggerModule|api/docs" apps/backend/src/
```

### WebSocket

```bash
rg "subscribe|@WebSocketGateway|live\.gateway" apps/backend/src/
rg "auth.*token|socket.*auth" apps/dashboard/src/
```

---

## Known baseline (verify — do not assume)

These are **hypotheses** from prior review. Confirm or refute with file:line evidence:

| Area | Hypothesis |
|------|------------|
| Tokens | JWT in `localStorage` (`ut_token`, `admin_token`) — XSS = token theft |
| Logout | No server-side logout/revocation; 7-day HS256 tokens |
| Passwords | SHA-256 + salt, not Argon2/bcrypt |
| Admin auth | Client-side `isAdmin` check; may lack `/auth/me` on load |
| App tenancy | `AppScopeService` + `AppsService.findOne` — verify on every route |
| WebSocket | `/live` subscribe may lack JWT + ownership check |
| Rate limits | OTP cooldown only; no global HTTP throttler |
| Secrets | `.env.production` / `.env.dev-server` may be git-tracked |
| Infra | Postgres/MinIO/Redis ports published; Swagger always on |
| Headers | No Helmet; minimal nginx security headers |
| XSS | React escaping; no global CSP or DOMPurify |

---

## Ready-to-run prompt

Copy the block below into a new **Agent** chat to execute a full audit:

````
Perform a full security audit of the user-tracker monorepo and produce a prioritized security todo list.

## Skills to load first
Read and apply methodology from these skills before auditing:
- .cursor/skills/security-audit/SKILL.md (this audit)
- .cursor/skills/ci-cd/SKILL.md (DevSecOps, secrets, containers)
- .cursor/skills/monitoring-observability/SKILL.md (security metrics/alerting gaps)
- .cursor/skills/vercel-react-best-practices/SKILL.md (client performance + XSS patterns)
- .cursor/skills/web-design-guidelines/SKILL.md (fetch guidelines; check headers/CSP/forms)
- .cursor/skills/analytics-tracking/SKILL.md (SDK secrets, PII, masking)
- .cursor/skills/mongodb-schema-design/SKILL.md (data isolation patterns)

## Scope — read ALL of these
### Documentation (read every file)
- docs/ (all files): start with docs/security/posture-review.md, docs/backend/README.md, docs/devops/deployment.md, docs/backend/00-core.md through 28-*, docs/sdk/*, docs/prd/*

### Code
- apps/backend/ — NestJS API: auth, guards, Prisma/raw SQL, CORS, WebSocket, storage, admin, billing limits
- apps/admin/ — React admin SPA: token storage, route guards, API client, uploads
- apps/dashboard/ — React dashboard: auth context, forms, Socket.IO, replay player
- apps/landing/ — Next.js: public forms, JSON-LD, tracker secret env, API services in bundle

### Infrastructure
- docker-compose.yml, docker-compose.dev.yml, deploy/, root .env*.example, apps/backend/.env.example
- nginx configs in apps/admin/, apps/dashboard/
- Check git for committed secrets (.env.production, .env.dev-server)

## Audit perspectives (answer each explicitly)

### 1. Authentication flow (login / logout / register / OTP)
- Trace full flows in auth.controller.ts, auth.service.ts, auth-otp.service.ts
- Is there logout? Token revocation? Refresh tokens?
- OTP entropy, attempt limits, resend cooldown
- Password hashing algorithm and cost
- Demo user restrictions (isDemo interceptor)
- Admin vs dashboard login separation

### 2. Token storage & session lifecycle
- Where tokens live: localStorage keys (ut_token, admin_token), cookies, Socket.IO auth
- What happens on 401? Stale token handling in admin vs dashboard
- JWT claims vs DB reload (isAdmin, isDemo)
- JWT expiry: env vs hardcoded; secret fallback behavior
- SDK secretKey: returned in API? exposed in NEXT_PUBLIC_*?

### 3. Authorization & IDOR — "Can users see others' information?"
For EVERY resource type, verify server-side scoping:
- Apps, sessions, events, logs, replays, funnels, A/B tests, audience segments, tickets, payments, exports
- Pattern: does every controller call AppScopeService or equivalent ownerId check?
- Admin impersonation: is it bounded and audited?
- SDK ingest: can secret key from App A write to App B?
- WebSocket /live subscribe: can anyone join app:<appId> without ownership proof?
- Public routes: /api/plans, /payments/callback, contact form — abuse potential

### 4. SQL injection & unsafe queries
- Grep: $queryRaw, Prisma.raw, executeRaw, queryRawUnsafe
- For each: are user inputs bound as parameters or interpolated into SQL?
- audience-segment-sql.ts allowlist — complete?
- Search/filter/sort params in list endpoints

### 5. XSS & output encoding
- Grep: dangerouslySetInnerHTML, innerHTML, document.write, eval
- User-generated content: tickets, replay DOM, admin CMS fields
- CDN upload MIME allowlist — SVG/JS stored XSS?
- CSP anywhere (nginx, Next config, replay export guards only?)

### 6. Input validation & form sanitization
- Global ValidationPipe config in main.ts
- DTO coverage: are unguarded routes missing DTOs?
- Frontend: client validation vs server-only (admin forms especially)
- Contact form, register, profile update, admin createUser password policy
- File upload: size, MIME, magic bytes, path traversal

### 7. Rate limiting & abuse prevention
- Global HTTP throttling (@nestjs/throttler)?
- Per-endpoint: login, register, OTP, SDK secret brute force, contact, export
- Plan quotas (LimitsService) vs DoS
- In-memory rate limits vs Redis (multi-instance)

### 8. CSRF, CORS, headers
- Bearer-only API — CSRF needed?
- CORS: dynamic origins, missing Origin allowed, credentials: true
- SdkAppGuard Origin/Referer bypass (SDK_AUTH_ALLOW_MISSING_ORIGIN)
- Helmet, HSTS, X-Frame-Options, X-Content-Type-Options, CSP on all SPAs

### 9. SSRF & server-side fetch
- Screenshot capture (Puppeteer): URL allowlist, --disable-web-security
- Sitemap crawler: same-origin policy
- Payment callback URL validation

### 10. Secrets, deployment & supply chain
- Secrets in git? .gitignore gaps?
- Default credentials (MinIO, Postgres, JWT fallback)
- Swagger/OpenAPI in production
- Container runs as root? Chromium sandbox flags
- Exposed ports (5433, 6379, 9000/9001)
- MinIO public-read bucket policy

## Method
1. Read all docs; extract documented security requirements AND known gaps
2. Parallel code exploration per app + backend module
3. Cross-reference: doc says X — code confirms or contradicts
4. Do NOT assume — cite file:line for every finding
5. Include "Verified OK" items where controls work correctly

## Deliverable
A prioritized security todo list using this format for each item:
- Severity (Critical/High/Medium/Low)
- Category, Perspective, Location, Current state, Risk, Recommendation, Effort (S/M/L), Doc alignment

End with:
- Summary table (count by severity)
- Top 5 fixes to do this week
- Suggested follow-up: CI security scanning (reference ci-cd skill DevSecOps section)
````
