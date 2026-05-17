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
    <div className="flex min-w-0 items-center">
      <h1 className="truncate text-sm font-semibold text-slate-900">
        {currentLabel}
      </h1>
    </div>
  );
}
