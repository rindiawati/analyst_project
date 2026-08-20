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
import { GoalProgress } from "./_components/goal-progress";
import { StatsSummary } from "./_components/stats-summary";

export default async function Dashboard() {
  const [session, activities, goal] = await Promise.all([
    auth(),
    api.activities.list(),
    api.goals.get(),
  ]);

  const today = new Date();
  const hasRuns = activities.length > 0;
  const thisWeek = distanceThisWeek(activities, today);

  return (
    <main className="flex min-h-screen flex-col bg-base text-white">
      <AppHeader email={session?.user?.email} />

      <div className="flex flex-1 flex-col items-center gap-8 px-4 pb-24">
        <div className="flex w-full max-w-xl items-end justify-between gap-4">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">
            My Runs{" "}
            <span aria-hidden="true" className="align-middle">
              🏃
            </span>
          </h1>
          <Link
            href="/activities/new"
            className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-accent-contrast transition hover:bg-accent/90"
          >
            Add Run
          </Link>
        </div>

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
          <h2 className="mb-2 text-xs uppercase tracking-wide text-accent">
            Weekly goal
          </h2>
          <GoalProgress current={thisWeek} target={goal?.targetDistance ?? null} />
        </section>

        {hasRuns ? <ChartsSection /> : null}
      </div>

      <BottomNav />
    </main>
  );
}
