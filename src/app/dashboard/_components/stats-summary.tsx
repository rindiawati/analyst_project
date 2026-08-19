import { formatPace } from "~/lib/pace";

type StatCardProps = {
  label: string;
  value: string;
  unit: string;
};

function StatCard({ label, value, unit }: StatCardProps) {
  return (
    <div className="flex flex-col gap-1 rounded-xl bg-surface px-4 py-3">
      <span className="text-xs uppercase tracking-wide text-accent">{label}</span>
      <span className="text-2xl font-bold text-white">
        {value}
        <span className="ml-1 text-sm font-normal text-white/50">{unit}</span>
      </span>
    </div>
  );
}

export function StatsSummary({
  totalDistance,
  longestRun,
  distanceThisWeek,
  averagePace,
  streak,
}: {
  totalDistance: number;
  longestRun: number;
  distanceThisWeek: number;
  averagePace: number;
  streak: number;
}) {
  return (
    <section className="grid w-full max-w-xl grid-cols-2 gap-3 sm:grid-cols-3">
      <StatCard label="Total" value={totalDistance.toFixed(1)} unit="km" />
      <StatCard label="Longest" value={longestRun.toFixed(1)} unit="km" />
      <StatCard label="This week" value={distanceThisWeek.toFixed(1)} unit="km" />
      <StatCard label="Avg pace" value={formatPace(averagePace)} unit="min/km" />
      <StatCard label="Streak" value={String(streak)} unit="days" />
    </section>
  );
}
