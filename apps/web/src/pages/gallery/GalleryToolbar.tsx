import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

  return (
    <section className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="flex min-w-0 flex-col gap-1 text-xs font-medium text-slate-500">
            {t('gallery.toolbar.status')}
            <select
              value={status}
              onChange={(event) => onStatusChange(event.target.value)}
              className={controlClass}
            >
              <option value="all">{t('gallery.toolbar.allModels')}</option>
              <option value="ready">{t('gallery.toolbar.ready')}</option>
              <option value="processing">{t('gallery.toolbar.processing')}</option>
              <option value="failed">{t('gallery.toolbar.needsReview')}</option>
            </select>
          </label>

          <label className="flex min-w-0 flex-col gap-1 text-xs font-medium text-slate-500">
            {t('gallery.toolbar.sort')}
            <select
              value={sort}
              onChange={(event) => onSortChange(event.target.value)}
              className={controlClass}
            >
              <option value="newest">{t('gallery.toolbar.newestFirst')}</option>
              <option value="oldest">{t('gallery.toolbar.oldestFirst')}</option>
              <option value="name">{t('gallery.toolbar.productName')}</option>
              <option value="status">{t('gallery.toolbar.status')}</option>
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
                {option === 'grid' ? t('gallery.toolbar.grid') : t('gallery.toolbar.list')}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
