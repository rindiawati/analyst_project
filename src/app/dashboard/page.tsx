import Link from "next/link";

import { AppHeader } from "~/app/_components/app-header";
import { auth } from "~/server/auth";
import { api } from "~/trpc/server";
import {
  averagePace,
  currentStreak,
  distanceThisWeek,
  longestRun,
  totalDistance,
} from "~/lib/stats";
import { ActivitiesList } from "./_components/activities-list";
import { StatsSummary } from "./_components/stats-summary";

export default async function Dashboard() {
  const [session, activities] = await Promise.all([
    auth(),
    api.activities.list(),
  ]);

  const today = new Date();
  const hasRuns = activities.length > 0;

  return (
    <main className="flex min-h-screen flex-col bg-base text-white">
      <AppHeader email={session?.user?.email} />

      <div className="flex flex-1 flex-col items-center gap-8 px-4 pb-16">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">
          Dashboard
        </h1>

        {hasRuns ? (
          <StatsSummary
            totalDistance={totalDistance(activities)}
            longestRun={longestRun(activities)}
            distanceThisWeek={distanceThisWeek(activities, today)}
            averagePace={averagePace(activities)}
            streak={currentStreak(activities, today)}
          />
        ) : null}

        <section className="w-full max-w-xl">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent runs</h2>
            <Link
              href="/activities/new"
              className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-accent-contrast transition hover:bg-accent/90"
            >
              Log a run
            </Link>
          </div>
          <ActivitiesList activities={activities} />
        </section>
      </div>
    </main>
  );
}
