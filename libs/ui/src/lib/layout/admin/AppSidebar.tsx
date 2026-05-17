import { Icon } from './icons.js';
import { SidebarSection } from './sidebar/SidebarSection.js';
import type {
  SidebarLinkNode,
  SidebarSection as SectionData,
  StoreContext,
} from './admin.types.js';

interface AppSidebarProps {
  sections: SectionData[];
  collapsed: boolean;
  onToggle: () => void;
  isActive: (href: string) => boolean;
  brand: { name: string; tagline?: string };
  store?: StoreContext;
  onNavigate?: (link: SidebarLinkNode) => void;
  /** Hide the desktop collapse toggle (used inside the mobile drawer). */
  hideCollapseToggle?: boolean;
}

const STATUS_DOT: Record<StoreContext['status'], string> = {
  online: 'bg-emerald-500',
  syncing: 'bg-amber-500',
  offline: 'bg-slate-400',
};

const STATUS_LABEL: Record<StoreContext['status'], string> = {
  online: 'Online',
  syncing: 'Syncing',
  offline: 'Offline',
};

export function AppSidebar({
  sections,
  collapsed,
  onToggle,
  isActive,
  brand,
  store,
  onNavigate,
  hideCollapseToggle,
}: AppSidebarProps) {
  return (
    <aside
      aria-label="Primary navigation"
      className={
        'flex h-full flex-col border-r border-slate-200 bg-white transition-[width] duration-200 ' +
        (collapsed ? 'w-[72px]' : 'w-[272px]')
      }
    >
      <div
        className={
          'flex min-h-16 shrink-0 items-center border-b border-slate-200 bg-slate-50/70 ' +
          (collapsed ? 'justify-center px-3' : 'justify-between px-4')
        }
      >
        <a
          href="/"
          className="flex min-w-0 items-center gap-3 rounded-xl p-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
        >
          <span
            aria-hidden="true"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white"
          >
            <Icon name="store" className="h-4 w-4" />
          </span>
          {!collapsed && (
            <span className="flex min-w-0 flex-col leading-tight">
              <span className="truncate text-sm font-semibold text-slate-900">
                {brand.name}
              </span>
              {brand.tagline && (
                <span className="truncate text-xs text-slate-500">
                  {brand.tagline}
                </span>
              )}
            </span>
          )}
        </a>
        {!hideCollapseToggle && !collapsed && (
          <button
            type="button"
            aria-label="Collapse sidebar"
            onClick={onToggle}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-white hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          >
            <Icon name="chevron-right" className="h-3.5 w-3.5 rotate-180" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-3">
          {sections.map((section) => (
            <SidebarSection
              key={section.id}
              section={section}
              collapsed={collapsed}
              isActive={isActive}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </nav>

      {/* Footer card / collapse-expand button */}
      {!collapsed && store && (
        <div className="shrink-0 border-t border-slate-200 p-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Store status
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className={
                      'h-2 w-2 rounded-full ' + STATUS_DOT[store.status]
                    }
                  />
                  <span className="truncate text-sm font-medium text-slate-900">
                    {store.name}
                  </span>
                </div>
              </div>
              <span
                className={
                  'rounded-full px-2 py-1 text-[11px] font-medium ' +
                  (store.status === 'online'
                    ? 'bg-emerald-50 text-emerald-700'
                    : store.status === 'syncing'
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-slate-200 text-slate-600')
                }
              >
                {STATUS_LABEL[store.status]}
              </span>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              {store.productCount} products synced
              {store.planName ? ` · ${store.planName}` : ''}
            </p>
            {store.localeLabel && (
              <p className="mt-1 text-xs text-slate-400">{store.localeLabel}</p>
            )}
          </div>
        </div>
      )}

      {!hideCollapseToggle && collapsed && (
        <div className="shrink-0 border-t border-slate-200 p-3">
          <button
            type="button"
            aria-label="Expand sidebar"
            onClick={onToggle}
            className="inline-flex h-11 w-full items-center justify-center rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          >
            <Icon name="chevron-right" className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </aside>
  );
}
