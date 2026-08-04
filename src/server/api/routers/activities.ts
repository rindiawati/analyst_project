import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { checkActivityOwnership } from "~/lib/activities";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const activitiesRouter = createTRPCRouter({
  delete: protectedProcedure
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
