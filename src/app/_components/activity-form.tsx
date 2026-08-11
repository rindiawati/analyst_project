"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { RouterOutputs } from "~/trpc/react";
import { api } from "~/trpc/react";

type Activity = RouterOutputs["activities"]["get"];

/**
 * Shared create/edit form. Omit `id`/`defaultValues` for a new run; pass both
 * to edit an existing one. The same component backs `/activities/new` and
 * `/activities/[id]/edit` so validation, labels, and styling stay in sync.
 */
export function ActivityForm({
  id,
  defaultValues,
}: {
  id?: string;
  defaultValues?: Activity;
}) {
  const router = useRouter();
  const utils = api.useUtils();
  const isEdit = id !== undefined;

  const [distance, setDistance] = useState(
    defaultValues ? String(defaultValues.distance) : "",
  );
  const [duration, setDuration] = useState(
    defaultValues ? String(defaultValues.duration) : "",
  );
  const [runDate, setRunDate] = useState(
    defaultValues
      ? defaultValues.runDate.toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10),
  );
  const [error, setError] = useState("");

  const redirectToDashboard = async () => {
    await utils.activities.list.invalidate();
    router.push("/dashboard");
    router.refresh();
  };

  const create = api.activities.create.useMutation({
    onSuccess: redirectToDashboard,
    onError: (err) => setError(err.message),
  });
  const update = api.activities.update.useMutation({
    onSuccess: redirectToDashboard,
    onError: (err) => setError(err.message),
  });
  const mutation = isEdit ? update : create;

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const distanceNum = Number(distance);
    const durationNum = Number(duration);

    if (!(distanceNum > 0) || !(durationNum > 0)) {
      setError("Enter a valid distance (km) and duration (min).");
      return;
    }

    const payload = {
      distance: distanceNum,
      duration: durationNum,
      runDate: new Date(runDate),
    };

    if (isEdit && id) {
      update.mutate({ id, ...payload });
    } else {
      create.mutate(payload);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {error ? (
        <p className="rounded-lg bg-red-500/20 px-4 py-2 text-center text-sm text-red-200">
          {error}
        </p>
      ) : null}
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
        disabled={mutation.isPending}
        className="mt-2 rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20 disabled:opacity-50"
      >
        {mutation.isPending
          ? "Saving..."
          : isEdit
            ? "Save changes"
            : "Log run"}
      </button>
      <button
        type="button"
        onClick={() => router.push("/dashboard")}
        className="text-center text-sm text-white/70 underline hover:text-white"
      >
        Cancel
      </button>
    </form>
  );
}
