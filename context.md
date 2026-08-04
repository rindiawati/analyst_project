# Project Context

## Purpose
A web app (Running Track AI) for users to record, track, and analyze their running activities.

## Target Users
Individuals who run for fitness, recreation, or training and want to track, analyze, and improve their running performance over time.

## Stack & Versions
- Next.js 16 (App Router, Turbopack default) + React 19 + TypeScript 5.8
- tRPC 11 + Prisma 6 + PostgreSQL
- NextAuth v5 beta (Auth.js) with the Credentials provider (bcryptjs)
- Tailwind CSS v4
- Vitest (unit tests). Playwright is planned but not yet installed.
- Deploy: Vercel

## Directory Structure
- `src/app/` — App Router: pages (`/`, `/login`, `/register`, `/dashboard`) + `api/` routes
- `src/app/api/` — route handlers: `register`, `activity`, `auth/[...nextauth]`, `trpc/[trpc]`
- `src/server/api/` — tRPC: `root.ts` (appRouter), `trpc.ts` (context + procedures), `routers/`
- `src/server/auth/` — NextAuth `config.ts` (edge) + `index.ts` (full)
- `src/server/db.ts` — Prisma client
- `src/lib/` — pure functions with co-located unit tests (e.g. `streak.ts` / `streak.test.ts`)
- `src/env.js` — validated env (t3-env + zod)
- `src/middleware.ts` — route protection
- `prisma/schema.prisma` + `prisma/migrations/`
- `plans/` — per-feature planning docs (e.g. `runtrackAI.md`)
- Tests are co-located as `*.test.ts` (no separate `tests/` dir yet)

## Data Models
(from `prisma/schema.prisma`)

### User
App user.
- id: String @id cuid
- email: String @unique
- passwordHash: String? (bcrypt, for Credentials)
- name: String?
- createdAt / updatedAt
- Relations: 1→many Activity, Goal, Account, Session

### Account
NextAuth PrismaAdapter account records.
- id, userId, type, provider, providerAccountId; @@unique([provider, providerAccountId])
- → User (onDelete: Cascade)

### Session
NextAuth PrismaAdapter sessions.
- id, sessionToken @unique, userId, expires
- → User (onDelete: Cascade)

### Activity
A recorded run.
- id: String @id uuid
- distance, duration, averagePace: Float; runDate: DateTime
- createdAt / updatedAt, userId
- → User (onDelete: Cascade)
- Indexes: userId, runDate, createdAt

### Goal
A weekly running target.
- id: String @id uuid
- targetDistance: Float; targetRunsPerWeek: Int
- createdAt / updatedAt, userId
- → User (onDelete: Cascade)
- Index: userId

### Data Rules
- Prisma ORM with PostgreSQL.
- Explicit foreign keys; cascade delete on dependent records.
- All domain models have createdAt and updatedAt.
- Email must be unique.
- Account/Session are the standard NextAuth PrismaAdapter tables — do not duplicate auth models.

## API Surface

### tRPC (mounted at `/api/trpc`)
- `auth.register` — **public** mutation. Input `{ email, password(min 8) }` → `{ id, email }`. Trims+lowercases email, hashes password (bcrypt cost 12), rejects duplicate email.
- `activities.delete` — **protected** mutation. Input `{ id }` → `{ id }`. Loads the activity, enforces ownership via `checkActivityOwnership()` in `src/lib/activities.ts` (FORBIDDEN if not owner, NOT_FOUND if missing), then `db.activity.delete`. Cascade: deleting a User removes their Activities (schema-level). Ownership helper is unit-tested (`src/lib/activities.test.ts`).
- (Goal router not yet implemented. The `/admin/activities` page and the create/list/edit procedures are planned, not yet built.)

Procedure helpers in `src/server/api/trpc.ts`: `publicProcedure` (session optional) and `protectedProcedure` (requires `ctx.session.user`, throws UNAUTHORIZED).

### REST / Route Handlers
| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/api/register` | public | `{ email, password(min 8) }` → `201 { id, email }`; 400 invalid input (zod-validated), 409 duplicate email. Input schema matches the tRPC `auth.register` procedure. |
| GET/POST | `/api/auth/*` | — | NextAuth handlers |
| GET/POST | `/api/trpc/*` | — | tRPC endpoint |

## Auth

### Provider
NextAuth (Auth.js v5 beta) with the **Credentials** provider (email + password). Passwords hashed with `bcryptjs` (`bcrypt.hash(pw, 12)` on register, `bcrypt.compare` on login). Plaintext is never stored. Session strategy: JWT.

### Where the config lives
- `src/server/auth/config.ts` — edge-safe base config: `session: { strategy: "jwt" }`, `pages.signIn = "/login"`, the `authorized` callback (protects `/dashboard`), and the `session` callback (exposes `user.id`). Imported by the middleware.
- `src/server/auth/index.ts` — full config: spreads `authConfig`, adds `PrismaAdapter(db)` and the Credentials `authorize`. Used by route handlers and server components.
- `src/middleware.ts` — builds `auth` from the edge-safe config; matcher `/dashboard/:path*`.
- `src/app/api/auth/[...nextauth]/route.ts` — exposes `GET`/`POST`.
- `src/lib/session.ts` — exports `getSession()`.

### How getSession() is used
`getSession()` wraps `auth()` and returns the current session (or `null`). Use it inside Server Components / Route Handlers:
```ts
import { getSession } from "~/lib/session";
const session = await getSession(); // session?.user.id, session?.user.email
```
Unauthenticated users are redirected by middleware automatically; pages only read the session.

### UI depends only on the session abstraction
Components rely solely on `session.user` — never on Auth.js internals. `getSession()` is the single entry point for auth state.

## Environment Variables
Validated in `src/env.js` (t3-env + zod). Copy `.env.example` → `.env`.
- `DATABASE_URL` — Postgres connection URL (required)
- `AUTH_SECRET` — NextAuth secret (required in production, optional in dev). Generate with `npx auth secret`.
- `AUTH_DISCORD_ID` — present in schema (reserved for Discord provider; unused by Credentials-only flow)
- `AUTH_DISCORD_SECRET` — same as above
- `NODE_ENV` — development | test | production

> Note: this project uses Auth.js v5 naming (`AUTH_*`), not the legacy `NEXTAUTH_*` names.

## Conventions
- Pure domain logic lives in `src/lib/` and is unit-tested (co-located `*.test.ts`, e.g. `streak.ts`).
- tRPC procedures use `publicProcedure` / `protectedProcedure` from `src/server/api/trpc.ts`; prefer `protectedProcedure` for anything user-scoped.
- One prompt = one single-responsibility component.
- Tests before implementation.
- Emails are normalized to lowercase/trimmed before storage.
- New routers must be registered manually in `src/server/api/root.ts`.
- Env vars must be added to `src/env.js` (server schema) and `.env.example` — never commit secrets.

## Success Criteria (MVP)
- App runs locally (`npm run dev`) and deploys to Vercel.
- Prisma models (User, Account, Session, Activity, Goal) exist; `prisma migrate dev` runs cleanly and Prisma Studio shows all tables; sample data can be inserted.
- A user can register (email + password) and log in via NextAuth Credentials; passwords are hashed, not plaintext.
- `/dashboard` is protected by middleware; unauthenticated users are redirected to `/login`.
- Pure helpers in `src/lib/` are covered by Vitest unit tests and pass (`npm run test`).

## Testing

### Test Runner
Vitest (unit tests). Coverage via `@vitest/coverage-v8`.

### How to Run Tests
```bash
npm run test      # watch mode (vitest)
npm run check     # eslint . + tsc --noEmit
npm run typecheck # tsc only
```
Tests are co-located next to source as `*.test.ts` (e.g. `src/lib/streak.test.ts`, `src/lib/activities.test.ts`). Playwright (e2e) is planned but not yet installed. Empty T3 boilerplate test stubs (`auth.test.ts`, `trpc.test.ts`) were removed — recreate with actual tests when needed.

## Security (Lab 5 — Build the Shield)

### Dependency audit
`npm audit` is currently **clean (0 vulnerabilities)**. Resolved on 2026-08-04 by upgrading from Next.js 15.2.3 → 16.3.0 (plus `react`/`react-dom` → 19.2.x and `eslint-config-next` → 16.3.0; `next-auth` auto-bumped to `5.0.0-beta.32`). This cleared 3 HIGH CVEs that were all rooted in Next 15.2.3's bundled dependency tree:

- `postcss` (nested under `next`) — XSS via unescaped `</style>` (GHSA-qx2v-qp2m-jg93) + path traversal / arbitrary `.map` file read via `sourceMappingURL` (GHSA-6g55-p6wh-862q, GHSA-r28c-9q8g-f849, GHSA-fxqj-rqcc-2cmp).
- `sharp` (pulled by `next`) — inherited libvips CVEs (GHSA-f88m-g3jw-g9cj).

These could not be fixed with non-breaking `npm audit fix` because the vulnerable copies live inside Next's own dependency graph; the only fix path was a SemVer-major Next bump. Decision rationale: project is pre-production (MVP, not deployed), already on React 19 (compatible with Next 16's React 19.2), and codebase is small — so the major bump was the cleanest, lab-compliant resolution. (Alternative considered: `overrides` field pinning `postcss`/`sharp` while staying on Next 15, rejected because Next isn't tested against those versions.)

### Breaking changes from the Next 16 upgrade that were handled
- `next lint` was **removed**. `package.json` scripts migrated: `check`/`lint`/`lint:fix` now call `eslint .` directly. `next build` no longer runs lint.
- ESLint config migrated to native flat config: `eslint.config.js` imports `eslint-config-next/core-web-vitals` directly (no more `FlatCompat`/legacy `next/core-web-vitals`, which broke with ESLint 9.39). Added `generated` (Prisma client output) to ESLint ignores — generated code must not be linted.
- `next.config.js` was already empty, so the Turbopack-default change was transparent. `dev` script simplified (`--turbo` is now the default).
- `next build` auto-updated `tsconfig.json`: `jsx: preserve → react-jsx` (React automatic runtime) and added `.next/dev/types/**/*.ts` to `include`.
- Async Request APIs: `src/trpc/server.ts` already awaited `headers()`, so no code change was needed.

### Known follow-ups (NOT security issues)
- `src/middleware.ts` → `proxy.ts` rename is **deprecated** (warning only); edge-runtime middleware still works. Optional future cleanup.
- 18 pre-existing type-safety lint errors remain in WIP REST handlers (`src/app/api/register/route.ts`, `src/app/api/register/page.tsx`, `src/app/api/activity/route.ts`) — untyped `await request.json()` returning `any`. These are unrelated to the upgrade (the type-checked rules were already configured). Note: the `/api/activity` REST stub is deprecated per the API Surface section and the register flow is moving to tRPC.

### Secrets
Scanned on 2026-08-04 — **no leaked secrets found.**

Verification performed:
- `git ls-files`: the only tracked env file is `.env.example` (placeholders only — `AUTH_SECRET=""`, `DATABASE_URL="postgresql://postgres:password@localhost..."`). `.env` is **not** tracked and has never been committed (`git log -- .env` is empty).
- Pattern scan across the full git history (`git log --all --full-history -p | grep` for `sk-|ghp_|AKIA|PRIVATE KEY|xox|AIza|postgres://user:pass@|secret|token|password|api_key`): 22 hits, **all false positives** — Prisma generated field-name constants in `generated/prisma/*.js` (e.g. `access_token: 'access_token'`, where value == key) and the placeholder DB URL in `.env.example`. No real credentials.

`.gitignore` excludes `.env` and `.env*.local`. Rotation + `git filter-repo` is the response if a real secret is ever committed.

> Tooling note: the npm package `trufflehog` (via `npx`) is **not** the official TruffleSecurity scanner — it triggered an unrelated interactive "subreddit" prompt and is likely an unrelated/typosquat package. The official scanner ships as a Go binary / Docker image (`trufflesecurity/trufflehog`), not npm. The manual git-based scan above was used instead. For automated CI, prefer `gitleaks` (GitHub Action) or the official `trufflehog` binary.

### Hygiene follow-up (not security-critical)
`generated/prisma/` (the Prisma client output) is currently committed to git. Since `postinstall` already runs `prisma generate`, this directory should be gitignored to avoid bloating the repo and committing platform-specific engine binaries (`.dll.node`, `.wasm`). This is why the mock token-label false positives appeared in history.

## CI/CD (Lab 5 — Build the Shield)

The pipeline in `.github/workflows/ci.yml` runs on every PR and push to `main`, and is intended to be a required status check that gates merges. It has two jobs:

1. **`gate`** (ubuntu-latest, Node 22) — runs sequentially: `npm ci` → `npm run lint` → `npm run typecheck` → `npx vitest run --coverage` → `npm audit --audit-level=high` → `npm run build`.
2. **`secrets`** — `gitleaks/gitleaks-action@v2` over the full git history (`fetch-depth: 0`).

`concurrency` cancels superseded runs on the same ref so only the latest commit gates a merge.

### CI-specific notes
- The `gate` job sets `SKIP_ENV_VALIDATION=1` because CI has no real `DATABASE_URL`/`AUTH_SECRET`. `next build` only type-checks and prerenders static pages (no DB connection at build time); the dynamic routes (`/dashboard`, `/api/*`) are server-rendered on demand. Env is re-validated at runtime once real variables are present (t3-env in `src/env.js`). This is the T3-recommended escape hatch.
- `npm run test` is watch mode locally; CI uses `npx vitest run --coverage` (one-shot). Coverage provider is `v8` via `vitest.config.ts`.
- Locally all six gates are verified green: lint 0 errors, typecheck clean, 10/10 tests (100% coverage on `src/lib`), `npm audit` 0 vulnerabilities, build succeeds.
- To make the pipeline actually gate merges, enable branch protection on `main` and require both `gate` and `secrets` as required status checks (Settings → Branches).
