# Project Context

## Purpose
A web application for users to track and analyze their running activities.

## Target Users
Internal analysts and users who need to analyze and visualize data

## Stack
- Frontend: Next.js (App Router) + TypeScript
- Backend: tRPC / Next API routes
- DB: Postgres + Prisma
- Auth: NextAuth
- Deploy: Vercel

## Data Models 
## User

Represents an application user.

Fields:
- id: String (primary key, cuid)
- email: String (unique)
- passwordHash: String
- name: String
- createdAt: DateTime
- updatedAt: DateTime

Relations:
- One User has many Activities.
- One User has many Goals.

---

## Activity

Represents a running activity recorded by a user.

Fields:
- id: String (primary key, cuid)
- userId: String (foreign key)
- distance: Float
- duration: Int
- averagePace: Float
- runDate: DateTime
- createdAt: DateTime
- updatedAt: DateTime

Relations:
- Belongs to one User.

---

## Goal

Represents a weekly running target.

Fields:
- id: String (primary key, cuid)
- userId: String (foreign key)
- targetDistance: Float
- targetRunsPerWeek: Int
- createdAt: DateTime
- updatedAt: DateTime

Relations:
- Belongs to one User.

---

## Data Rules

- Use Prisma ORM with PostgreSQL.
- Use explicit foreign keys.
- Use cascade delete for dependent child records.
- All models must have createdAt and updatedAt.
- Email must always be unique.
- Do not create duplicate authentication models when using NextAuth.

---

## Success Criteria
The MVP can run locally and on Vercel, allowing users to access the application successfully.

## Testing

### Test Runner
This project uses Vitest for unit testing.

### How to Run Tests

Run all tests:

```bash
npm run test