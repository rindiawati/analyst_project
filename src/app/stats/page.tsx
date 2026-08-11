import { AppHeader } from "~/app/_components/app-header";
import { BottomNav } from "~/app/_components/bottom-nav";
import { PaceTrendChart } from "~/app/_components/pace-trend-chart";
import { WeeklyMileageChart } from "~/app/_components/weekly-mileage-chart";
import { auth } from "~/server/auth";
import { weeklyMileage, weeklyPace } from "~/lib/charts";
import { api } from "~/trpc/server";

export default async function StatsPage() {
  const [session, activities] = await Promise.all([
    auth(),
    api.activities.list(),
  ]);
  const today = new Date();

  return (
    <main className="flex min-h-screen flex-col bg-base text-white">
      <AppHeader email={session?.user?.email} />
      <div className="flex flex-1 flex-col gap-6 px-4 pb-24">
        <h1 className="text-3xl font-extrabold">Stats</h1>

        <section className="rounded-xl bg-surface p-4">
          <h2 className="mb-2 text-xs uppercase tracking-wide text-accent">
            Weekly mileage (km)
          </h2>
          <WeeklyMileageChart data={weeklyMileage(activities, today)} />
        </section>

        <section className="rounded-xl bg-surface p-4">
          <h2 className="mb-2 text-xs uppercase tracking-wide text-accent">
            Pace trend (min/km)
          </h2>
          <PaceTrendChart data={weeklyPace(activities, today)} />
        </section>
      </div>
      <BottomNav />
    </main>
  );
}
