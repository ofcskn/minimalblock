import type { HeaderSelector } from '../admin.types.js';

interface HeaderSelectorsProps {
  store?: HeaderSelector;
  currency: HeaderSelector;
  language: HeaderSelector;
  /** How many selectors to render before collapsing into overflow. */
  visibleCount?: number;
  stacked?: boolean;
  onStoreChange?: (storeId: string) => void;
  onCurrencyChange?: (currency: string) => void;
  onLanguageChange?: (language: string) => void;
}

interface NativeSelectProps {
  selector: HeaderSelector;
  onChange: (value: string) => void;
  hint?: string;
}

function NativeSelect({ selector, onChange, hint }: NativeSelectProps) {
  return (
    <label className="relative flex min-h-11 w-full items-center gap-1.5 rounded-xl border border-slate-200 bg-white pl-3 pr-2 text-[13px] font-medium text-slate-700 transition-colors hover:border-slate-300 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/15 xl:w-auto xl:min-w-[92px]">
      {hint && (
        <span className="text-slate-400" aria-hidden="true">
          {hint}
        </span>
      )}
      <select
        aria-label={selector.ariaLabel}
        value={selector.value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full cursor-pointer appearance-none bg-transparent pr-5 text-[13px] font-medium text-slate-700 focus:outline-none"
      >
        {selector.options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </label>
  );
}

export function HeaderSelectors({
  store,
  currency,
  language,
  visibleCount = 3,
  stacked = false,
  onStoreChange,
  onCurrencyChange,
  onLanguageChange,
}: HeaderSelectorsProps) {
  const all: Array<{
    selector: HeaderSelector;
    onChange: (v: string) => void;
    hint?: string;
  }> = [];
  if (store) all.push({ selector: store, onChange: (v) => onStoreChange?.(v) });
  all.push({
    selector: currency,
    onChange: (v) => onCurrencyChange?.(v),
    hint: '$',
  });
  all.push({ selector: language, onChange: (v) => onLanguageChange?.(v) });

  const visible = all.slice(0, visibleCount);

  return (
    <div className={stacked ? 'space-y-2' : 'flex items-center gap-2'}>
      {visible.map(({ selector, onChange, hint }) => (
        <NativeSelect
          key={selector.id}
          selector={selector}
          onChange={onChange}
          hint={hint}
        />
      ))}
    </div>
  );
}
