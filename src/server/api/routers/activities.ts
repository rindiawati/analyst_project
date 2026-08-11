import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { checkActivityOwnership } from "~/lib/activities";
import {
  createRateLimitMiddleware,
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

// 30 writes / minute per IP per endpoint — generous for normal data entry,
// still stops brute-force. Each endpoint gets its own bucket (see rateLimitKey).
const writeLimit = { windowMs: 60_000, max: 30 };
const createLimiter = createRateLimitMiddleware("create", writeLimit);
const deleteLimiter = createRateLimitMiddleware("delete", writeLimit);

export const activitiesRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.activity.findMany({
      where: { userId: ctx.session.user.id },
      orderBy: { runDate: "desc" },
      take: 20,
    });
  }),

  create: protectedProcedure
    .use(createLimiter)
    .input(
      z.object({
        distance: z.number().positive(),
        duration: z.number().positive(),
        runDate: z.date(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // min/km — derived server-side so it can't be spoofed by the client.
      const averagePace = input.duration / input.distance;

      return ctx.db.activity.create({
        data: {
          distance: input.distance,
          duration: input.duration,
          averagePace,
          runDate: input.runDate,
          userId: ctx.session.user.id,
        },
      });
    }),

  delete: protectedProcedure
    .use(deleteLimiter)
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const activity = await ctx.db.activity.findUnique({
        where: { id: input.id },
        select: { userId: true },
      });

      const check = checkActivityOwnership(activity, ctx.session.user.id);
      if (!check.ok) {
        throw new TRPCError({
          code: check.code === "NOT_FOUND" ? "NOT_FOUND" : "FORBIDDEN",
        });
      }

      await ctx.db.activity.delete({ where: { id: input.id } });

      return { id: input.id };
    }),
});
