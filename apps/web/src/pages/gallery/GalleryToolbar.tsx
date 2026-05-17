interface GalleryToolbarProps {
  status: string;
  sort: string;
  view: 'grid' | 'list';
  onStatusChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onViewChange: (value: 'grid' | 'list') => void;
}

const controlClass =
  'min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 transition-colors hover:border-slate-300 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/15';

export function GalleryToolbar({
  status,
  sort,
  view,
  onStatusChange,
  onSortChange,
  onViewChange,
}: GalleryToolbarProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="flex min-w-0 flex-col gap-1 text-xs font-medium text-slate-500">
            Status
            <select
              value={status}
              onChange={(event) => onStatusChange(event.target.value)}
              className={controlClass}
            >
              <option value="all">All models</option>
              <option value="ready">Ready</option>
              <option value="processing">Processing</option>
              <option value="failed">Needs review</option>
            </select>
          </label>

          <label className="flex min-w-0 flex-col gap-1 text-xs font-medium text-slate-500">
            Sort
            <select
              value={sort}
              onChange={(event) => onSortChange(event.target.value)}
              className={controlClass}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="name">Product name</option>
              <option value="status">Status</option>
            </select>
          </label>
        </div>

        <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
          {(['grid', 'list'] as const).map((option) => {
            const active = view === option;
            return (
              <button
                key={option}
                type="button"
                aria-pressed={active}
                onClick={() => onViewChange(option)}
                className={
                  'min-h-9 rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 ' +
                  (active
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700')
                }
              >
                {option === 'grid' ? 'Grid' : 'List'}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
