"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gradient-to-b from-[#2e026d] to-[#15162c] px-4 text-center text-white">
      <h1 className="text-3xl font-bold">Couldn&apos;t load your dashboard</h1>
      <p className="text-white/70">
        We had trouble loading your runs. Please try again.
      </p>
      <button
        onClick={reset}
        className="mt-2 rounded-full bg-white/10 px-6 py-2 font-semibold transition hover:bg-white/20"
      >
        Try again
      </button>
    </main>
  );
}
