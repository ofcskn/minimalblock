import type { Breadcrumb, StoreContext } from '../admin.types.js';

interface HeaderBrandProps {
  brand: {
    name: string;
    tagline?: string;
  };
  store?: StoreContext;
  pageTitle?: string;
  breadcrumbs?: Breadcrumb[];
}

export function HeaderBrand({
  brand,
  store,
  pageTitle,
  breadcrumbs = [],
}: HeaderBrandProps) {
  const currentLabel =
    pageTitle ?? breadcrumbs[breadcrumbs.length - 1]?.label ?? 'Dashboard';

  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="hidden min-w-0 md:block">
        <p className="truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          {brand.name}
        </p>
        <div className="flex min-w-0 items-center gap-2">
          <h1 className="truncate text-sm font-semibold text-slate-900">
            {currentLabel}
          </h1>
          {store && (
            <span className="hidden truncate text-xs text-slate-500 lg:inline">
              {store.name}
            </span>
          )}
        </div>
      </div>

      <div className="min-w-0 md:hidden">
        <p className="truncate text-sm font-semibold text-slate-900">
          {brand.name}
        </p>
        <p className="truncate text-[11px] text-slate-500">{currentLabel}</p>
      </div>
    </div>
  );
}
