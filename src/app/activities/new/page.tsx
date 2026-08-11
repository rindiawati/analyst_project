import { ActivityForm } from "~/app/_components/activity-form";

export default function NewActivityPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="flex w-full max-w-sm flex-col gap-4 rounded-xl bg-white/10 p-8">
        <h1 className="text-center text-3xl font-extrabold">Log a run</h1>
        <ActivityForm />
      </div>
    </main>
  );
}
