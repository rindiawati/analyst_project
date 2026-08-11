"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { RouterOutputs } from "~/trpc/react";
import { api } from "~/trpc/react";
import { durationFromParts, durationToParts } from "~/lib/duration";

type Activity = RouterOutputs["activities"]["get"];

const inputClass =
  "rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent/50";

/**
 * Shared create/edit form. Omit `id`/`defaultValues` for a new run; pass both
 * to edit an existing one. Duration is entered as hours/minutes/seconds and
 * combined into minutes (how `Activity.duration` is stored).
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

  const initialParts = defaultValues
    ? durationToParts(defaultValues.duration)
    : null;

  const [distance, setDistance] = useState(
    defaultValues ? String(defaultValues.distance) : "",
  );
  const [hours, setHours] = useState(
    initialParts ? String(initialParts.hours) : "",
  );
  const [minutes, setMinutes] = useState(
    initialParts ? String(initialParts.minutes) : "",
  );
  const [seconds, setSeconds] = useState(
    initialParts ? String(initialParts.seconds) : "",
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
    if (!(distanceNum > 0)) {
      setError("Enter a valid distance (km).");
      return;
    }

    const h = Number(hours) || 0;
    const m = Number(minutes) || 0;
    const s = Number(seconds) || 0;

    if (m >= 60 || s >= 60) {
      setError("Minutes and seconds must be under 60.");
      return;
    }

    const duration = durationFromParts(h, m, s);
    if (!(duration > 0)) {
      setError("Enter how long the run took.");
      return;
    }

    const payload = {
      distance: distanceNum,
      duration,
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
          className={inputClass}
        />
      </label>

      <div className="flex flex-col gap-1 text-sm text-white/70">
        <span>Duration</span>
        <div className="grid grid-cols-3 gap-2">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-white/40">Hours</span>
            <input
              type="number"
              min="0"
              name="hours"
              autoComplete="off"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-white/40">Minutes</span>
            <input
              type="number"
              min="0"
              max="59"
              name="minutes"
              autoComplete="off"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-white/40">Seconds</span>
            <input
              type="number"
              min="0"
              max="59"
              name="seconds"
              autoComplete="off"
              value={seconds}
              onChange={(e) => setSeconds(e.target.value)}
              className={inputClass}
            />
          </label>
        </div>
      </div>

      <label className="flex flex-col gap-1 text-sm text-white/70">
        Date
        <input
          type="date"
          name="runDate"
          value={runDate}
          onChange={(e) => setRunDate(e.target.value)}
          required
          className={inputClass}
        />
      </label>

      <button
        type="submit"
        disabled={mutation.isPending}
        className="mt-2 rounded-full bg-accent px-10 py-3 font-semibold text-accent-contrast transition hover:bg-accent/90 disabled:opacity-50"
      >
        {mutation.isPending ? "Saving..." : isEdit ? "Save changes" : "Log run"}
      </button>
      <button
        type="button"
        onClick={() => router.push("/dashboard")}
        className="text-center text-sm text-white/70 underline hover:text-accent"
      >
        Cancel
      </button>
    </form>
  );
}
