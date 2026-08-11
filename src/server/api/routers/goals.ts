import { z } from "zod";

import { db } from "~/server/db";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const goalsRouter = createTRPCRouter({
  // The user's current goal (most recent). Null until they set one.
  get: protectedProcedure.query(async ({ ctx }) => {
    return db.goal.findFirst({
      where: { userId: ctx.session.user.id },
      orderBy: { createdAt: "desc" },
    });
  }),

  // Set or update the weekly distance goal. The Goal schema is 1→many, so we
  // keep a single effective goal by updating the latest (or creating the first).
  setTarget: protectedProcedure
    .input(z.object({ targetDistance: z.number().positive() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await db.goal.findFirst({
        where: { userId: ctx.session.user.id },
        orderBy: { createdAt: "desc" },
      });

      if (existing) {
        return db.goal.update({
          where: { id: existing.id },
          data: { targetDistance: input.targetDistance },
        });
      }

      return db.goal.create({
        data: {
          userId: ctx.session.user.id,
          targetDistance: input.targetDistance,
          targetRunsPerWeek: 0,
        },
      });
    }),
});
