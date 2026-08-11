import { Skeleton } from "~/app/_components/skeleton";

export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
      <Skeleton className="h-10 w-48" />
    </main>
  );
}
