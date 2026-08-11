import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "~/server/auth";
import { buildAuthorizeUrl, isStravaConfigured } from "~/server/strava";

// Starts the Strava OAuth flow. Requires a logged-in user; redirects to
// Strava's authorize page with a random `state` stored in a short-lived cookie
// (verified in the callback to prevent CSRF).
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (!isStravaConfigured()) {
    return new NextResponse(
      "Strava is not configured on this server. Set STRAVA_CLIENT_ID and STRAVA_CLIENT_SECRET.",
      { status: 503 },
    );
  }

  const origin = new URL(request.url).origin;
  const redirectUri = `${origin}/api/strava/callback`;
  const state = crypto.randomUUID();

  (await cookies()).set("strava_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  return NextResponse.redirect(buildAuthorizeUrl(redirectUri, state));
}
