import { AppHeader } from "~/app/_components/app-header";
import { BottomNav } from "~/app/_components/bottom-nav";
import { ChartsSection } from "~/app/_components/charts-section";
import { auth } from "~/server/auth";

export default async function StatsPage() {
  const session = await auth();

  return (
    <main className="flex min-h-screen flex-col bg-base text-white">
      <AppHeader email={session?.user?.email} backHref="/dashboard" />
      <div className="flex flex-1 flex-col gap-6 px-4 pb-24">
        <h1 className="text-3xl font-extrabold">Stats</h1>
        <ChartsSection />
      </div>
      <BottomNav />
    </main>
  );
}
