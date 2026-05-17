import type { Metric } from '@minimalblock/ui';

interface MetricCardProps {
  metric: Metric;
}

const ARROW: Record<NonNullable<Metric['deltaDirection']>, string> = {
  up: 'M5 15l7-7 7 7',
  down: 'M5 9l7 7 7-7',
  flat: 'M5 12h14',
};

const DELTA_TEXT: Record<NonNullable<Metric['deltaDirection']>, string> = {
  up: 'text-emerald-600',
  down: 'text-red-600',
  flat: 'text-slate-500',
};

export function MetricCard({ metric }: MetricCardProps) {
  const dir = metric.deltaDirection ?? 'flat';
  const showDelta = metric.delta !== undefined;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 transition-colors hover:border-slate-300">
      <p className="text-[12px] font-medium uppercase tracking-[0.04em] text-slate-500">
        {metric.label}
      </p>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-semibold tabular-nums text-slate-900">
          {metric.value}
        </span>
        {showDelta && (
          <span className={'inline-flex items-center gap-0.5 text-xs font-medium ' + DELTA_TEXT[dir]}>
            <svg
              className="h-3 w-3"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d={ARROW[dir]} />
            </svg>
            {dir === 'up' ? '+' : dir === 'down' ? '−' : ''}
            {Math.abs(metric.delta as number)}%
          </span>
        )}
      </div>
      {metric.helpText && (
        <p className="mt-1 text-[12px] text-slate-400">{metric.helpText}</p>
      )}
    </div>
  );
}
