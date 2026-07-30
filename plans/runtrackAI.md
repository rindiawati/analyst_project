---
type: Plan
title: Running Track AI, data layer
description: Define the core entities and their relationships before building any UI.
tags: [schema, mvp, week-1]
---

# Goal
Allow users to record and manage their running activities before adding Strava integration.

# Entities

- User
  Owns all running activities.

- Activity
  A running activity.
  Includes:
  - distance
  - duration
  - averagePace
  - runDate

- Goal
  A weekly running target.
  Includes:
  - targetDistance
  - targetRunsPerWeek

# Relations

User 1→many Activity

User 1→many Goal

# Out of scope (this pass)

- Strava integration
- Dashboard UI
- AI Coach
- Charts
- Authentication
- Garmin / Apple Health

# Open questions

- Should users have multiple goals?
- Will activities later come from Strava or manual input?

# Done looks like

- User model exists.
- Activity model exists.
- Goal model exists.
- Prisma migration runs successfully.
- Prisma Studio shows all tables.
- Sample data can be inserted manually.