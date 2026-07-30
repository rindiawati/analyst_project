import NextAuth from "next-auth";

import { authConfig } from "~/server/auth/config";

export const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  matcher: ["/dashboard/:path*"],
};
