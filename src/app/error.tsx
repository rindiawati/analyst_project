"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to the server for diagnostics; never surface the stack trace to users.
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-base px-4 text-center text-white">
      <h1 className="text-3xl font-bold">Something went wrong</h1>
      <p className="text-white/70">
        An unexpected error occurred. Please try again.
      </p>
      <button
        onClick={reset}
        className="mt-2 rounded-full bg-accent px-6 py-2 font-semibold text-accent-contrast transition hover:bg-accent/90"
      >
        Try again
      </button>
    </main>
  );
}
