import { z } from "zod";
import bcrypt from "bcryptjs";
import { TRPCError } from "@trpc/server";

import {
  createRateLimitMiddleware,
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";

import { db } from "~/server/db";

// 10 registrations / minute per IP — the suggested basic limit for auth endpoints.
const registerLimiter = createRateLimitMiddleware("register", {
  windowMs: 60_000,
  max: 10,
});

export const authRouter = createTRPCRouter({
  register: publicProcedure
    .use(registerLimiter)
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(8),
      })
    )
    .mutation(async ({ input }) => {
      const email = input.email.trim().toLowerCase();

      const existingUser = await db.user.findUnique({
        where: {
          email,
        },
      });

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Email already exists",
        });
      }

      const passwordHash = await bcrypt.hash(input.password, 12);

      const user = await db.user.create({
        data: {
          email,
          passwordHash,
        },
      });

      return {
        id: user.id,
        email: user.email,
      };
    }),
});
