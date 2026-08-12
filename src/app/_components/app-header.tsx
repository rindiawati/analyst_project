"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

/**
 * Top-right app bar: account email + logout, with an optional "← Back" link on
 * the left for sub-pages (Profile, Stats, run forms, week detail). The
 * dashboard is "home", so it passes no backHref.
 */
export function AppHeader({
  email,
  backHref,
}: {
  email?: string | null;
  backHref?: string;
}) {
  return (
    <header className="flex w-full items-center justify-between gap-4 px-6 py-4 text-sm">
      <div className="min-w-[60px]">
        {backHref ? (
          <Link
            href={backHref}
            className="text-white/60 transition hover:text-accent"
          >
            ← Back
          </Link>
        ) : null}
      </div>
      <div className="flex items-center gap-4">
        {email ? <span className="text-white/50">{email}</span> : null}
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="rounded-full border border-white/20 px-4 py-1.5 font-semibold text-white/80 transition hover:border-accent hover:text-accent"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
