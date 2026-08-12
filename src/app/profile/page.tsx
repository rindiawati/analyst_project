import { AppHeader } from "~/app/_components/app-header";
import { BottomNav } from "~/app/_components/bottom-nav";
import { GoalProgress } from "~/app/dashboard/_components/goal-progress";
import { StravaConnect } from "~/app/dashboard/_components/strava-connect";
import { auth } from "~/server/auth";
import { api } from "~/trpc/server";

export default async function ProfilePage() {
  const [session, goal, strava] = await Promise.all([
    auth(),
    api.goals.get(),
    api.strava.status(),
  ]);

  return (
    <main className="flex min-h-screen flex-col bg-base text-white">
      <AppHeader email={session?.user?.email} backHref="/dashboard" />
      <div className="flex flex-1 flex-col gap-6 px-4 pb-24">
        <h1 className="text-3xl font-extrabold">Profile</h1>

        <section className="flex flex-col gap-2 rounded-xl bg-surface p-4">
          <h2 className="text-xs uppercase tracking-wide text-accent">
            Weekly distance goal
          </h2>
          <GoalProgress target={goal?.targetDistance ?? null} editable />
        </section>

        <section className="rounded-xl bg-surface p-4">
          <h2 className="mb-2 text-xs uppercase tracking-wide text-accent">
            Strava
          </h2>
          <StravaConnect
            connected={strava.connected}
            athleteId={strava.athleteId}
          />
        </section>

        <section className="rounded-xl bg-surface p-4 text-sm text-white/60">
          Signed in as <span className="text-white">{session?.user?.email}</span>
        </section>
      </div>
      <BottomNav />
    </main>
  );
}
