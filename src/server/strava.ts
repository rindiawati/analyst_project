import "server-only";

import { env } from "~/env";
import { db } from "~/server/db";

const TOKEN_URL = "https://www.strava.com/oauth/token";
const API_BASE = "https://www.strava.com/api/v3";
const AUTHORIZE_URL = "https://www.strava.com/oauth/authorize";

export type StravaTokenSet = {
  access_token: string;
  refresh_token: string;
  expires_at: number; // epoch seconds
  athlete?: { id: number };
  scope?: string;
};

export function isStravaConfigured(): boolean {
  return Boolean(env.STRAVA_CLIENT_ID && env.STRAVA_CLIENT_SECRET);
}

export function buildAuthorizeUrl(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: env.STRAVA_CLIENT_ID ?? "",
    redirect_uri: redirectUri,
    response_type: "code",
    approval_prompt: "force",
    scope: "activity:read",
    state,
  });
  return `${AUTHORIZE_URL}?${params.toString()}`;
}

export async function exchangeCodeForToken(
  code: string,
  redirectUri: string,
): Promise<StravaTokenSet> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: env.STRAVA_CLIENT_ID,
      client_secret: env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
  });
  if (!res.ok) {
    throw new Error(`Strava token exchange failed: ${res.status}`);
  }
  return (await res.json()) as StravaTokenSet;
}

export async function refreshStravaToken(
  refreshToken: string,
): Promise<StravaTokenSet> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: env.STRAVA_CLIENT_ID,
      client_secret: env.STRAVA_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) {
    throw new Error(`Strava token refresh failed: ${res.status}`);
  }
  return (await res.json()) as StravaTokenSet;
}

export async function fetchStravaActivities(
  accessToken: string,
  afterEpochSeconds?: number,
): Promise<unknown[]> {
  const params = new URLSearchParams({ per_page: "200" });
  if (afterEpochSeconds) params.set("after", String(afterEpochSeconds));

  const res = await fetch(`${API_BASE}/athlete/activities?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new Error(`Strava activities fetch failed: ${res.status}`);
  }
  return (await res.json()) as unknown[];
}

export async function saveIntegration(
  userId: string,
  token: StravaTokenSet,
): Promise<void> {
  if (!token.athlete) {
    throw new Error("Strava token response missing athlete id");
  }
  await db.stravaIntegration.upsert({
    where: { userId },
    create: {
      userId,
      athleteId: token.athlete.id,
      accessToken: token.access_token,
      refreshToken: token.refresh_token,
      expiresAt: new Date(token.expires_at * 1000),
      scope: token.scope ?? null,
    },
    update: {
      athleteId: token.athlete.id,
      accessToken: token.access_token,
      refreshToken: token.refresh_token,
      expiresAt: new Date(token.expires_at * 1000),
      scope: token.scope ?? null,
    },
  });
}

/**
 * Returns a live access token, refreshing (and persisting the rotated tokens)
 * if the cached one is expired. Athlete id is never touched here — refresh
 * responses don't include it.
 */
export async function getValidAccessToken(integration: {
  userId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}): Promise<string> {
  const bufferMs = 60_000;
  const expired = integration.expiresAt.getTime() <= Date.now() + bufferMs;
  if (!expired) return integration.accessToken;

  const refreshed = await refreshStravaToken(integration.refreshToken);
  await db.stravaIntegration.update({
    where: { userId: integration.userId },
    data: {
      accessToken: refreshed.access_token,
      refreshToken: refreshed.refresh_token,
      expiresAt: new Date(refreshed.expires_at * 1000),
    },
  });
  return refreshed.access_token;
}
