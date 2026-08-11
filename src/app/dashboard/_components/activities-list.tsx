import Link from "next/link";

import type { RouterOutputs } from "~/trpc/react";
import { EmptyState } from "~/app/_components/empty-state";
import { DeleteActivityButton } from "./delete-activity-button";

type Activity = RouterOutputs["activities"]["list"][number];

const dateFmt = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

function ActivityRow({ activity }: { activity: Activity }) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-xl bg-white/5 px-5 py-4">
      <div className="flex flex-col">
        <span className="font-semibold text-white">
          {activity.distance.toFixed(2)} km
        </span>
        <span className="text-xs text-white/50">
          {dateFmt.format(activity.runDate)}
        </span>
      </div>
      <div className="flex items-center gap-4 text-sm text-white/70">
        <span className="hidden sm:inline">{activity.duration.toFixed(0)} min</span>
        <span className="hidden sm:inline">
          {activity.averagePace.toFixed(2)} /km
        </span>
        <Link
          href={`/activities/${activity.id}/edit`}
          className="text-white/60 transition hover:text-white"
        >
          Edit
        </Link>
        <DeleteActivityButton id={activity.id} />
      </div>
    </li>
  );
}

export function ActivitiesList({ activities }: { activities: Activity[] }) {
  if (activities.length === 0) {
    return (
      <EmptyState
        title="No runs yet"
        message="Runs you log will show up here with distance, duration, and pace."
      />
    );
  }

  return (
    <ul className="flex w-full flex-col gap-3">
      {activities.map((activity) => (
        <ActivityRow key={activity.id} activity={activity} />
      ))}
    </ul>
  );
}
