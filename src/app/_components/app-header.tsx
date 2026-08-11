"use client";

import { signOut } from "next-auth/react";

/**
 * Top-right app bar: small account email + logout. Shown on authenticated
 * pages (dashboard, run forms) so the account state lives in a consistent spot
 * instead of the centered content flow.
 */
export function AppHeader({ email }: { email?: string | null }) {
  return (
    <header className="flex w-full items-center justify-end gap-4 px-6 py-4 text-sm">
      {email ? <span className="text-white/50">{email}</span> : null}
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="rounded-full border border-white/20 px-4 py-1.5 font-semibold text-white/80 transition hover:border-accent hover:text-accent"
      >
        Logout
      </button>
    </header>
  );
}
