import { notFound } from "next/navigation";

import { ActivityForm } from "~/app/_components/activity-form";
import { AppHeader } from "~/app/_components/app-header";
import { BottomNav } from "~/app/_components/bottom-nav";
import { auth } from "~/server/auth";
import { api } from "~/trpc/server";
import type { RouterOutputs } from "~/trpc/react";

type Activity = RouterOutputs["activities"]["get"];

export default async function EditActivityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // `get` enforces ownership and throws NOT_FOUND/FORBIDDEN for other users'
  // runs — both surface as a 404 here so existence isn't leaked. `notFound()`
  // returns `never`, so `activity` is guaranteed assigned afterwards.
  let activity: Activity;
  try {
    activity = await api.activities.get({ id });
  } catch {
    notFound();
  }

  const session = await auth();

  return (
    <main className="flex min-h-screen flex-col bg-base text-white">
      <AppHeader email={session?.user?.email} backHref="/dashboard" />
      <div className="flex flex-1 items-center justify-center px-4 pb-24">
        <div className="flex w-full max-w-sm flex-col gap-4 rounded-xl bg-surface p-8">
          <h1 className="text-center text-3xl font-extrabold">Edit run</h1>
          <ActivityForm id={activity.id} defaultValues={activity} />
        </div>
      </div>
      <BottomNav />
    </main>
  );
}
