import "server-only";

import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import { authConfig } from "./config";
import { db } from "~/server/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = (credentials.email as string).trim().toLowerCase();
        const user = await db.user.findUnique({
          where: { email },
        });
        if (!user?.passwordHash) return null;
        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash,
        );
        if (!isValid) return null;
        return { id: user.id, email: user.email };
      },
    }),
  ],
});
