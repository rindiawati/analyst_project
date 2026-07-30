import { z } from "zod";
import bcrypt from "bcrypt";

import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";

import { db } from "~/server/db";


export const authRouter = createTRPCRouter({

  register: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(8),
      })
    )

    .mutation(async ({ input }) => {

      const existingUser =
        await db.user.findUnique({
          where:{
            email: input.email
          }
        });


      if(existingUser){
        throw new Error(
          "Email already exists"
        );
      }


      const passwordHash =
        await bcrypt.hash(
          input.password,
          12
        );


      const user =
        await db.user.create({
          data:{
            email: input.email,
            passwordHash
          }
        });


      return {
        id:user.id,
        email:user.email
      };
    }),

});