import Link from "next/link";

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
import { LogoutButton } from "./_components/logout-button";
import { StatsSummary } from "./_components/stats-summary";

export default async function Dashboard() {
  const [session, activities] = await Promise.all([
    auth(),
    api.activities.list(),
  ]);

  const today = new Date();
  const hasRuns = activities.length > 0;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-8 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          Dashboard
        </h1>
        <p className="text-2xl text-white">Login as: {session?.user?.email}</p>

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
              className="rounded-full bg-white/10 px-5 py-2 text-sm font-semibold transition hover:bg-white/20"
            >
              Log a run
            </Link>
          </div>
          <ActivitiesList activities={activities} />
        </section>
        <LogoutButton />
      </div>
    </main>
  );
}
