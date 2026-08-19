import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "~/server/auth";
import {
  exchangeCodeForToken,
  isStravaConfigured,
  saveIntegration,
} from "~/server/strava";

// Strava redirects here with ?code=&state= (or ?error= on denial). Verify the
// state against the cookie set in /connect, exchange the code for tokens, and
// store the integration for the logged-in user.
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const url = new URL(request.url);
  const origin = url.origin;
  const jar = await cookies();
  const storedState = jar.get("strava_oauth_state")?.value;
  jar.delete("strava_oauth_state");

  const state = url.searchParams.get("state");
  if (!state || state !== storedState) {
    return new NextResponse("Invalid OAuth state.", { status: 400 });
  }

  if (url.searchParams.get("error") || !url.searchParams.get("code")) {
    return NextResponse.redirect(new URL("/dashboard?strava=denied", origin));
  }

  if (!isStravaConfigured()) {
    return new NextResponse("Strava not configured.", { status: 503 });
  }

  const code = url.searchParams.get("code")!;
  const redirectUri = `${origin}/api/strava/callback`;

  try {
    const token = await exchangeCodeForToken(code, redirectUri);
    await saveIntegration(session.user.id, token);
  } catch (err) {
    console.error("Strava callback failed", err);
    return NextResponse.redirect(new URL("/dashboard?strava=error", origin));
  }

  return NextResponse.redirect(new URL("/dashboard?strava=connected", origin));
}
