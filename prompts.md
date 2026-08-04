# Prompt Library

Reusable prompts for the Running Track AI (`analyst_project`) workflow.
Ground rules that apply to every prompt below:
- Always read `context.md` and `prisma/schema.prisma` before touching code.
- Prefer the T3 stack conventions: tRPC (`publicProcedure`/`protectedProcedure`), Prisma, NextAuth Credentials, pure logic in `src/lib/`.
- Never commit secrets; never store plaintext passwords.

---

## Prompt 1 — Schema Design (Week 1)

Use before creating or changing any Prisma model.

```
You are designing the data layer for the Running Track AI app (Next.js 15 + Prisma + Postgres + NextAuth).

First, read context.md and prisma/schema.prisma. Do NOT edit schema.prisma yet.

I want to add/modify: {{ describe the feature or entity, e.g. "a Run split / lap model linked to Activity" }}.

Produce a planning doc ONLY (like plans/runtrackAI.md) with these exact sections:
1. Goal — one sentence.
2. Entities — each new model with its fields and types.
3. Relations — in "Parent 1→many Child" form.
4. Data Rules — constraints, indexes, cascades.
5. Out of scope (this pass).
6. Open questions.
7. Done looks like — checklist.

Constraints:
- Reuse the existing User model; do NOT create duplicate auth models (Account/Session already exist via NextAuth PrismaAdapter).
- Every domain model gets createdAt + updatedAt and explicit foreign keys with onDelete: Cascade.
- Email stays @unique; add @@index on hot query paths (userId, dates).
- Raise open questions instead of guessing.

After I approve the doc, generate the Prisma model block + a migration, and update context.md "Data Models" + "API Surface".
```

---

## Prompt 2 — Tests First (Week 2)

Use for any pure logic (pacing, streaks, aggregates, normalization).

```
You are implementing pure domain logic for Running Track AI.

Task: {{ describe the function, e.g. "averagePace(distanceKm, durationMin) → min/km" }}.

Follow this order — do not skip:
1. Put the function in src/lib/{{ name }}.ts as a pure function (no DB, no React, no Next imports). Make side-effect-free and deterministic; inject "today" / clock as a parameter defaulting to new Date() (see src/lib/streak.ts).
2. FIRST write src/lib/{{ name }}.test.ts (Vitest) with cases covering:
   - the happy path,
   - edge cases (empty input, zero, single item, out-of-range),
   - boundary dates / timezone-naive handling.
3. Run `npm run test` and confirm the tests RED (fail) before any implementation.
4. Implement until tests go GREEN. Keep the function pure.
5. Do not add a tRPC route or DB call in this pass.

Constraints:
- No business logic in route handlers or components.
- Return only plain data; format strings only at the UI edge.
- If behavior is ambiguous, stop and ask — do not invent rules.
```

---

## Prompt 3 — Senior-Engineer Review (Week 3)

Use after a feature branch is ready, before merge.

```
Review the following diff/PR as a senior engineer who is strict about this project's conventions.
Read context.md first, then review:

{{ paste diff, or list files: e.g. src/app/api/activity/route.ts, src/server/api/routers/auth.ts }}

Check against this checklist and report ONLY real findings (no nitpicks):
- Auth: user-scoped mutations use protectedProcedure; no unauthenticated writes; bcrypt cost 12; email normalized to lowercase/trim.
- Security: no secrets/logged PII; input validated with zod; no SQL/raw query injection.
- Conventions: pure logic lives in src/lib/ with co-located tests; new routers registered in src/server/api/root.ts; env vars added to src/env.js + .env.example.
- Data: migrations are safe (additive or reversible); cascade deletes intentional; indexes on hot paths.
- Types & errors: no `any`; errors handled; HTTP/tRPC status codes correct (400/401/409/etc.).
- Tests: cover happy path + edge cases; tests are independent and fast.

Output format:
- Severity: BLOCKER / MAJOR / MINOR
- File:line — what's wrong — concrete fix.
If clean, say "LGTM" and list 1–3 optional improvements.
```

---

## What Didn't Work

Lessons captured so we don't repeat them.

- **"Build the whole feature end-to-end" in one prompt.** Produces drifting, untestable code. Now: split into plan → tests → impl → review passes (the prompts above).
- **Letting business logic land in route handlers / React components.** Made pacing/streak logic impossible to unit-test. Fix: pure logic in `src/lib/`, enforced by Prompt 2 and the review checklist.
- **Designing schema without checking the NextAuth PrismaAdapter models.** Risk of duplicating User/Account/Session. The context.md "Do not duplicate auth models" rule and Prompt 1's constraints now block this.
- **Generating schema/migration before the plan doc.** Led to rework when relations were wrong. Fix: Prompt 1 outputs the plan first, code only after approval.
- **Skipping the red→green test step.** When implementation and tests were written together, edge cases were silently skipped. Fix: Prompt 2 forces tests-first and a confirmed RED run.
- **Unscoped review prompts ("review my code").** Returned generic nitpicks. Fix: Prompt 3 ties the review to the project's exact conventions and a fixed severity format.
- **Vague success criteria.** "Make it work" made it hard to know when done. Fix: every pass ends with a "Done looks like" checklist (see plans/ + context.md MVP).
- **Fresh chat without context fabricates real-looking models/endpoints.** Asked to build a "CRUD Habits admin panel" with no context, the AI invented a `Habit` Prisma model and REST `/api/admin/habits` endpoints, presented as working code. Some guesses (Prisma, App Router) were right by luck — but with the same confidence as the wrong ones, so you can't tell fact from guess. Fix: always attach `context.md` (or invoke the prompts here). With context the AI instead acknowledged there is no `Habit` model, respected the no-schema-change rule, used mock data + `TODO`, and picked the project's real pattern (Server Actions/tRPC) instead of generic REST.
