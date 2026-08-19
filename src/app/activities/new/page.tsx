import { AppHeader } from "~/app/_components/app-header";
import { ActivityForm } from "~/app/_components/activity-form";
import { BottomNav } from "~/app/_components/bottom-nav";
import { auth } from "~/server/auth";

export default async function NewActivityPage() {
  const session = await auth();

  return (
    <main className="flex min-h-screen flex-col bg-base text-white">
      <AppHeader email={session?.user?.email} backHref="/dashboard" />
      <div className="flex flex-1 items-center justify-center px-4 pb-24">
        <div className="flex w-full max-w-sm flex-col gap-4 rounded-xl bg-surface p-8">
          <h1 className="text-center text-3xl font-extrabold">Log a run</h1>
          <ActivityForm />
        </div>
      </div>
      <BottomNav />
    </main>
  );
}
