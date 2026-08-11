import { TRPCError } from "@trpc/server";

import { isRunActivity, mapStravaActivity, type StravaActivity } from "~/lib/strava";
import { db } from "~/server/db";
import {
  fetchStravaActivities,
  getValidAccessToken,
  isStravaConfigured,
} from "~/server/strava";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

// Phase 1: one-shot pull of recent runs. Webhook-based auto-sync is Phase 2.
const SYNC_WINDOW_SECONDS = Math.floor((365 * 24 * 60 * 60 * 1000) / 1000); // 365 days

export const stravaRouter = createTRPCRouter({
  status: protectedProcedure.query(async ({ ctx }) => {
    const integration = await db.stravaIntegration.findUnique({
      where: { userId: ctx.session.user.id },
      select: { athleteId: true },
    });
    return {
      connected: Boolean(integration),
      athleteId: integration?.athleteId ?? null,
    };
  }),

  sync: protectedProcedure.mutation(async ({ ctx }) => {
    if (!isStravaConfigured()) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "Strava is not configured on this server.",
      });
    }

    const integration = await db.stravaIntegration.findUnique({
      where: { userId: ctx.session.user.id },
    });
    if (!integration) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Connect Strava first.",
      });
    }

    const accessToken = await getValidAccessToken(integration);
    const after = Math.floor(Date.now() / 1000) - SYNC_WINDOW_SECONDS;
    const raw = (await fetchStravaActivities(
      accessToken,
      after,
    )) as StravaActivity[];

    const runs = raw.filter(isRunActivity).map(mapStravaActivity);

    // Dedup against already-imported runs (by Strava id) for this user.
    const existing = await db.activity.findMany({
      where: {
        userId: ctx.session.user.id,
        stravaId: { in: runs.map((r) => r.stravaId) },
      },
      select: { stravaId: true },
    });
    const seen = new Set(existing.map((e) => e.stravaId));
    const fresh = runs.filter((r) => !seen.has(r.stravaId));

    if (fresh.length > 0) {
      await db.activity.createMany({
        data: fresh.map((r) => ({
          ...r,
          userId: ctx.session.user.id,
        })),
      });
    }

    return { imported: fresh.length, skipped: runs.length - fresh.length };
  }),
});
