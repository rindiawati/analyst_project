import { Skeleton } from "~/app/_components/skeleton";

export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-base">
      <Skeleton className="h-10 w-48" />
    </main>
  );
}
