"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { api } from "~/trpc/react";

export default function NewActivityPage() {
  const router = useRouter();
  const utils = api.useUtils();
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [runDate, setRunDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [error, setError] = useState("");

  const create = api.activities.create.useMutation({
    onSuccess: async () => {
      await utils.activities.list.invalidate();
      router.push("/dashboard");
    },
    onError: (err) => setError(err.message),
  });

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const distanceNum = Number(distance);
    const durationNum = Number(duration);

    if (!(distanceNum > 0) || !(durationNum > 0)) {
      setError("Enter a valid distance (km) and duration (min).");
      return;
    }

    create.mutate({
      distance: distanceNum,
      duration: durationNum,
      runDate: new Date(runDate),
    });
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="flex w-full max-w-sm flex-col gap-4 rounded-xl bg-white/10 p-8">
        <h1 className="text-center text-3xl font-extrabold">Log a run</h1>
        {error ? (
          <p className="rounded-lg bg-red-500/20 px-4 py-2 text-center text-sm text-red-200">
            {error}
          </p>
        ) : null}
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm text-white/70">
            Distance (km)
            <input
              type="number"
              step="0.01"
              min="0"
              name="distance"
              autoComplete="off"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              required
              className="rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/40"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-white/70">
            Duration (min)
            <input
              type="number"
              step="0.01"
              min="0"
              name="duration"
              autoComplete="off"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              required
              className="rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/40"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-white/70">
            Date
            <input
              type="date"
              name="runDate"
              value={runDate}
              onChange={(e) => setRunDate(e.target.value)}
              required
              className="rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/40"
            />
          </label>
          <button
            type="submit"
            disabled={create.isPending}
            className="mt-2 rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20 disabled:opacity-50"
          >
            {create.isPending ? "Saving..." : "Log run"}
          </button>
        </form>
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="text-center text-sm text-white/70 underline hover:text-white"
        >
          Cancel
        </button>
      </div>
    </main>
  );
}
