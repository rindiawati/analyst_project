import { Skeleton } from "~/app/_components/skeleton";

export default function Loading() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-8 px-4 py-16">
        <Skeleton className="h-16 w-72" />
        <Skeleton className="h-8 w-80" />
        <section className="w-full max-w-xl">
          <Skeleton className="mb-3 h-6 w-32" />
          <div className="flex flex-col gap-3">
            <Skeleton className="h-[72px] w-full" />
            <Skeleton className="h-[72px] w-full" />
            <Skeleton className="h-[72px] w-full" />
          </div>
        </section>
        <Skeleton className="h-12 w-32 rounded-full" />
      </div>
    </main>
  );
}
