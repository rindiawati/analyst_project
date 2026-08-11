import type { PaceBucket } from "~/lib/charts";

/**
 * Pace trend as a dependency-free SVG line chart. Lower pace (faster) plots
 * higher on the chart. Weeks with no runs are skipped (gaps). Needs >= 2
 * run-weeks to draw a line.
 */
export function PaceTrendChart({ data }: { data: PaceBucket[] }) {
  const points = data.filter(
    (d): d is { weekStart: Date; label: string; pace: number } => d.pace !== null,
  );

  if (points.length < 2) {
    return (
      <p className="text-sm text-white/40">
        Log a couple more weeks of runs to see a pace trend.
      </p>
    );
  }

  const W = 320;
  const H = 110;
  const padX = 16;
  const padTop = 8;
  const padBottom = 22;
  const innerW = W - padX * 2;
  const innerH = H - padTop - padBottom;

  const paces = points.map((p) => p.pace);
  const min = Math.min(...paces);
  const max = Math.max(...paces);
  const range = max - min || 1;
  const span = Math.max(data.length - 1, 1);

  const coords = points.map((p) => {
    const weekIndex = data.findIndex(
      (d) => d.weekStart.getTime() === p.weekStart.getTime(),
    );
    const x = padX + (weekIndex / span) * innerW;
    const y = padTop + ((p.pace - min) / range) * innerH;
    return { x, y };
  });

  const path = coords
    .map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)},${c.y.toFixed(1)}`)
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      role="img"
      aria-label="Pace trend line chart"
    >
      <path d={path} fill="none" stroke="var(--color-accent)" strokeWidth={2} />
      {coords.map((c, i) => (
        <circle key={i} cx={c.x} cy={c.y} r={3} fill="var(--color-accent)" />
      ))}
      {data.map((d, i) => (
        <text
          key={i}
          x={padX + (i / span) * innerW}
          y={H - 8}
          textAnchor="middle"
          fontSize={8}
          fill="rgba(255,255,255,0.4)"
        >
          {d.label}
        </text>
      ))}
    </svg>
  );
}
