export type DateRange = '7d' | '30d' | '90d' | 'ytd';

interface DateRangeSelectorProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

const OPTIONS: Array<{ value: DateRange; label: string }> = [
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
  { value: 'ytd', label: 'YTD' },
];

export function DateRangeSelector({ value, onChange }: DateRangeSelectorProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Date range"
      className="inline-flex h-9 items-center rounded-md border border-slate-200 bg-white p-0.5"
    >
      {OPTIONS.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={
              'inline-flex h-8 items-center rounded px-2.5 text-[12px] font-medium transition-colors ' +
              (active
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900')
            }
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
