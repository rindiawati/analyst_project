import Link from "next/link";

import { AppHeader } from "~/app/_components/app-header";
import { BottomNav } from "~/app/_components/bottom-nav";
import { ChartsSection } from "~/app/_components/charts-section";
import { auth } from "~/server/auth";
import {
  averagePace,
  currentStreak,
  distanceThisWeek,
  longestRun,
  totalDistance,
} from "~/lib/stats";
import { api } from "~/trpc/server";
import { ActivitiesList } from "./_components/activities-list";
import { GoalProgress } from "./_components/goal-progress";
import { StatsSummary } from "./_components/stats-summary";
import { StravaConnect } from "./_components/strava-connect";

export default async function Dashboard() {
  const [session, activities, goal, strava] = await Promise.all([
    auth(),
    api.activities.list(),
    api.goals.get(),
    api.strava.status(),
  ]);

  const today = new Date();
  const hasRuns = activities.length > 0;
  const thisWeek = distanceThisWeek(activities, today);

  return (
    <main className="flex min-h-screen flex-col bg-base text-white">
      <AppHeader email={session?.user?.email} />

      <div className="flex flex-1 flex-col items-center gap-8 px-4 pb-24">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">
          Dashboard
        </h1>

        {hasRuns ? (
          <StatsSummary
            totalDistance={totalDistance(activities)}
            longestRun={longestRun(activities)}
            distanceThisWeek={thisWeek}
            averagePace={averagePace(activities)}
            streak={currentStreak(activities, today)}
          />
        ) : null}

        <section className="w-full max-w-xl rounded-xl bg-surface p-4">
          <GoalProgress
            current={thisWeek}
            target={goal?.targetDistance ?? null}
          />
        </section>

        {hasRuns ? <ChartsSection /> : null}

        <section className="w-full max-w-xl">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Recent runs</h2>
            <div className="flex items-center gap-3">
              <StravaConnect
                connected={strava.connected}
                athleteId={strava.athleteId}
              />
              <Link
                href="/activities/new"
                className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-accent-contrast transition hover:bg-accent/90"
              >
                Log a run
              </Link>
            </div>
          </div>
          <ActivitiesList activities={activities} />
        </section>
      </div>

      <BottomNav />
    </main>
  );
}
