import type { WeekBucket } from "~/lib/charts";

/** Weekly mileage as a dependency-free SVG bar chart (server-rendered). */
export function WeeklyMileageChart({ data }: { data: WeekBucket[] }) {
  const W = 320;
  const H = 110;
  const padX = 16;
  const padTop = 8;
  const padBottom = 22;
  const innerW = W - padX * 2;
  const innerH = H - padTop - padBottom;
  const max = Math.max(...data.map((d) => d.distance), 0.001);
  const slot = innerW / data.length;
  const barW = slot * 0.6;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      role="img"
      aria-label="Weekly mileage bar chart"
    >
      {data.map((d, i) => {
        const h = (d.distance / max) * innerH;
        const x = padX + i * slot + (slot - barW) / 2;
        const y = padTop + (innerH - h);
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={Math.max(h, 0)}
              rx={2}
              fill="var(--color-accent)"
              opacity={d.distance > 0 ? 1 : 0.2}
            />
            <text
              x={x + barW / 2}
              y={H - 8}
              textAnchor="middle"
              fontSize={8}
              fill="rgba(255,255,255,0.4)"
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
