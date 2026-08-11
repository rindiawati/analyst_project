import { type DefaultSession, type NextAuthConfig } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  // Auth.js v5 only trusts the host automatically on Vercel. Without this, any
  // non-Vercel host (localhost in `next start`, self-hosted, Docker, other
  // platforms) throws `UntrustedHost` and auth breaks. Required for local prod
  // testing and any non-Vercel deployment.
  trustHost: true,
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      if (request.nextUrl.pathname.startsWith("/dashboard")) {
        return isLoggedIn;
      }
      return true;
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
