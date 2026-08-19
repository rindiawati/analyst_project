# Running Track AI

Running Track AI is a web app for runners to record, track, and analyze their
running. You sign up with an email and password, log each run (distance,
duration, date), and see your history on a dashboard. The codebase is built to
grow into weekly goals, Strava-style integrations, and an AI coach, but the
shipped MVP is the self-contained record-and-review loop.

## Stack

Chosen for a single-deploy Next.js app with end-to-end type safety and as little
per-tool ceremony as possible.

- **Next.js 16 (App Router, RSC) + React 19** — full-stack framework; this is
  also the deploy target (Vercel). RSC keeps data fetching on the server.
- **TypeScript 5.8** — type safety across the whole app.
- **tRPC 11** — fully typesafe API with no code generation step; the router
  lives in the same process as the server, so the client gets inferred types.
- **Prisma 6 + PostgreSQL** — type-safe ORM over a relational model of users,
  activities, and goals.
- **NextAuth v5 (Auth.js), Credentials provider + bcryptjs** — email/password
  auth for an MVP without taking on an OAuth dependency. Sessions are JWT.
- **Tailwind CSS v4** — utility-first styling for fast iteration.
- **Vitest** for unit tests of pure domain logic (`src/lib`), **Playwright** for
  an end-to-end test of the critical user flow.

> Note: Auth.js v5 only auto-trusts the request host on Vercel. The config sets
> `trustHost: true` so auth also works on localhost (production mode), self-host,
> Docker, or any other platform. Without it, login throws `UntrustedHost`.

## Run it locally

Prerequisites: **Node 22** and a running **PostgreSQL** instance.

```bash
# 1. Configure environment
cp .env.example .env
#   fill in DATABASE_URL and AUTH_SECRET
#   (AUTH_DISCORD_ID / AUTH_DISCORD_SECRET can be any dummy value — see below)

# 2. Install dependencies (also runs `prisma generate` via postinstall)
npm install

# 3. Create the database schema
npx prisma migrate dev

# 4. Start the dev server
npm run dev
```

Then open http://localhost:3000 — you'll be redirected to `/login`. Register an
account, sign in, and log a run from the dashboard.

## Useful scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the dev server (port 3000). |
| `npm run build` | Production build. |
| `npm run start` | Serve the production build. |
| `npm run preview` | `next build && next start` (used by E2E). |
| `npm run check` | `eslint .` + `tsc --noEmit`. |
| `npm run lint` | `eslint .` |
| `npm run typecheck` | `tsc --noEmit`. |
| `npm run test` | Vitest in watch mode (unit tests). |
| `npm run e2e` | Playwright E2E (boots a prod build on :3001). |
| `npm run e2e:install` | Install the Chromium browser for Playwright. |
| `npm run db:studio` | Open Prisma Studio against your DB. |

## Testing

- **Unit (Vitest)** — `npm run test` locally (watch mode), or `npx vitest run`
  for one-shot. Pure domain logic lives in `src/lib` with co-located
  `*.test.ts` files (e.g. `streak.ts`, `activities.ts`, `rateLimit.ts`).
- **E2E (Playwright)** — `npm run e2e`. Run `npm run e2e:install` once first to
  download Chromium. The spec in `e2e/core.spec.ts` exercises the critical path:
  register → login (no auto-login after register) → dashboard empty state →
  log a run → the run appears on the dashboard. Playwright runs against a
  **production build on port 3001** (more reliable than `next dev`, whose
  per-route cold-compilation made the auth callback flaky on first hit).
- **CI** — `.github/workflows/ci.yml` has three jobs: `gate`
  (lint/typecheck/unit/audit/build), `secrets` (gitleaks), and `e2e` (Postgres
  service container + migrate + Playwright).

## Environment variables

Validated by `src/env.js` (t3-env + zod). Copy `.env.example` → `.env`.

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | yes | PostgreSQL connection URL. |
| `AUTH_SECRET` | yes in production, optional in dev | Used by NextAuth to sign JWTs. Generate with `npx auth secret`. |
| `AUTH_DISCORD_ID` | **required by the schema, but unused** | Reserved for a Discord OAuth provider that isn't wired up. Set to any non-empty dummy value so env validation passes. |
| `AUTH_DISCORD_SECRET` | **required by the schema, but unused** | Same as above. |
| `NODE_ENV` | optional | `development` \| `test` \| `production` (defaults to `development`). |

> The Discord pair is a common setup gotcha: the schema marks them required, but
> the app uses Credentials-only auth, so they're never read. Empty strings are
> treated as undefined (env validation fails) — use a dummy value.

## Data model

All schema lives in [`prisma/schema.prisma`](./prisma/schema.prisma). Migrations
are in `prisma/migrations/`.

- **User** — `id` (cuid), unique `email`, `passwordHash` (bcrypt), `name`.
  Owns Activities and Goals. `Account`/`Session` are the NextAuth
  PrismaAdapter tables.
- **Activity** — a run: `distance` (km), `duration` (min), `averagePace`
  (min/km, derived server-side as `duration / distance`), `runDate`. Indexed on
  `userId`, `runDate`, `createdAt`. Cascade-deleted with its User.
- **Goal** — a weekly target (`targetDistance`, `targetRunsPerWeek`). Model
  exists and migrates, but no router/UI is built yet.

Deleting a User cascades to their Activities, Goals, Accounts, and Sessions.

## Known limitations & what's next

- **Goals & editing** — the `Goal` model exists but has no API or UI. Activities
  support `create` / `list` / `delete`; an `update` procedure is planned.
- **Integrations / analytics** — no Strava, Garmin, or Apple Health import, no
  charts, and no AI coach yet.
- **Rate limiting is in-memory** — the limiter in `src/lib/rateLimit.ts` uses a
  per-process store, so on Vercel (many serverless instances) the effective
  limit is multiplied by the number of warm instances. Move to
  `@upstash/ratelimit` + `@upstash/redis` for production.
- **E2E test data** — `e2e/core.spec.ts` registers a fresh
  `e2e+<timestamp>@example.com` user each run against the target DB; rows
  accumulate (acceptable for the MVP, add teardown if the suite grows).
- **Generated Prisma client** — `generated/` is currently committed; since
  `postinstall` runs `prisma generate`, it should be gitignored to avoid
  committing platform-specific engine binaries.
- **Branch protection** — CI defines `gate`, `secrets`, and `e2e`, but they only
  gate merges once you enable them as required status checks under
  Settings → Branches.
