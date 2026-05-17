interface AnalyticsCardProps {
  title: string;
  subtitle?: string;
  /** 7 daily revenue values, most-recent last. Drives the inline sparkline. */
  series?: number[];
  total?: string;
}

const VIEW_W = 600;
const VIEW_H = 160;
const PAD = 8;

function buildPath(series: number[]): { line: string; area: string } {
  if (series.length < 2) return { line: '', area: '' };
  const min = Math.min(...series);
  const max = Math.max(...series);
  const range = max - min || 1;
  const stepX = (VIEW_W - PAD * 2) / (series.length - 1);

  const points = series.map((v, i) => {
    const x = PAD + i * stepX;
    const y = PAD + (1 - (v - min) / range) * (VIEW_H - PAD * 2);
    return [x, y] as const;
  });

  const line = points
    .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(' ');
  const area = `${line} L${points[points.length - 1][0].toFixed(1)},${VIEW_H - PAD} L${PAD},${VIEW_H - PAD} Z`;
  return { line, area };
}

export function AnalyticsCard({
  title,
  subtitle,
  series = [],
  total,
}: AnalyticsCardProps) {
  const { line, area } = buildPath(series);

  return (
    <section
      aria-label={title}
      className="rounded-lg border border-slate-200 bg-white p-5"
    >
      <header className="flex items-baseline justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          {subtitle && <p className="text-[12px] text-slate-500">{subtitle}</p>}
        </div>
        {total && (
          <span className="text-lg font-semibold tabular-nums text-slate-900">
            {total}
          </span>
        )}
      </header>

      <div className="mt-4">
        {series.length >= 2 ? (
          <svg
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            preserveAspectRatio="none"
            className="h-40 w-full"
            role="img"
            aria-label={`${title} trend line`}
          >
            <defs>
              <linearGradient id="analytics-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgb(15 23 42 / 0.10)" />
                <stop offset="100%" stopColor="rgb(15 23 42 / 0)" />
              </linearGradient>
            </defs>
            <path d={area} fill="url(#analytics-fill)" />
            <path
              d={line}
              fill="none"
              stroke="rgb(15 23 42)"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <div className="flex h-40 items-center justify-center rounded-md bg-slate-50 text-[12px] text-slate-400">
            No data yet
          </div>
        )}
      </div>
    </section>
  );
}
