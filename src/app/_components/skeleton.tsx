/**
 * Skeleton primitive used by loading.tsx files. Pairs with Suspense rather than
 * spinners so users see structure (not just motion) while async data resolves.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-white/10 ${className ?? ""}`}
    />
  );
}
