import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";

import { db } from "~/server/db";


declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

export const authConfig = {
  adapter: PrismaAdapter(db),

  providers: [
    CredentialsProvider({
      name: "credentials",

      credentials: {
        email: {
          type: "email",
        },
        password: {
          type: "password",
        },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await db.user.findUnique({
          where: {
            email: credentials.email as string,
          },
        });

        if (!user?.passwordHash) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash,
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
        };
      },
    }),
  ],

  callbacks: {
  session({ session, token }) {
    if (session.user) {
      session.user.id = token.sub!;
    }

    return session;
  },
},

} satisfies NextAuthConfig;