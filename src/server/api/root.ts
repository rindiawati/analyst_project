import { activitiesRouter } from "~/server/api/routers/activities";
import { authRouter } from "~/server/api/routers/auth";
import { goalsRouter } from "~/server/api/routers/goals";
import { stravaRouter } from "~/server/api/routers/strava";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  activities: activitiesRouter,
  goals: goalsRouter,
  strava: stravaRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
