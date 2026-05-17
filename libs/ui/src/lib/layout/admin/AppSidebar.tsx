import { Icon } from './icons.js';
import { SidebarSection } from './sidebar/SidebarSection.js';
import type {
  ProfileMenuAction,
  SidebarLinkNode,
  SidebarSection as SectionData,
  StoreContext,
  UserProfile,
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
  user?: UserProfile;
  profileActions?: ProfileMenuAction[];
  onProfileAction?: (id: string) => void;
  language?: string;
  onLanguageChange?: (lang: string) => void;
}

export function AppSidebar({
  sections,
  collapsed,
  onToggle,
  isActive,
  brand,
  onNavigate,
  hideCollapseToggle,
  user,
  profileActions = [],
  onProfileAction,
  language = 'tr',
  onLanguageChange,
}: AppSidebarProps) {
  const nonDestructive = profileActions.filter((a) => !a.destructive);
  const destructive = profileActions.filter((a) => a.destructive);

  return (
    <aside
      aria-label="Primary navigation"
      className={
        'flex h-full flex-col border-r border-slate-200 bg-white transition-[width] duration-200 ' +
        (collapsed ? 'w-[72px]' : 'w-[272px]')
      }
    >
      {/* Brand header */}
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
            className="inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl"
          >
            <img src="/favicon.png" alt="Minimal Block" className="h-9 w-9 object-cover" />
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

      {/* Navigation */}
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

      {/* Footer */}
      {user && (
        <div className="shrink-0 border-t border-slate-200">
          {collapsed ? (
            /* Collapsed: icon-only buttons */
            <div className="flex flex-col items-center gap-1 px-2 py-3">
              {/* Language toggle compact */}
              <button
                type="button"
                onClick={() => onLanguageChange?.(language === 'tr' ? 'en' : 'tr')}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-[11px] font-semibold text-slate-500 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                title={language.toUpperCase()}
              >
                {language.toUpperCase()}
              </button>
              {nonDestructive.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  title={action.label}
                  onClick={() => onProfileAction?.(action.id)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                >
                  {action.icon && <Icon name={action.icon} className="h-4 w-4" />}
                </button>
              ))}
              {destructive.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  title={action.label}
                  onClick={() => onProfileAction?.(action.id)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-red-500 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                >
                  {action.icon && <Icon name={action.icon} className="h-4 w-4" />}
                </button>
              ))}
            </div>
          ) : (
            /* Expanded: full footer */
            <div className="px-3 py-3 space-y-0.5">
              {/* Email */}
              <div className="px-2 pb-2">
                <p className="truncate text-[12px] text-slate-400">{user.email}</p>
              </div>

              {/* Language toggle */}
              <div className="px-2 pb-2">
                <div className="flex gap-1.5">
                  {(['tr', 'en'] as const).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => onLanguageChange?.(lang)}
                      className={
                        'flex-1 rounded-lg py-1.5 text-[12px] font-semibold uppercase tracking-wide transition-colors ' +
                        (language === lang
                          ? 'bg-indigo-600 text-white'
                          : 'border border-slate-200 text-slate-600 hover:bg-slate-50')
                      }
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              {/* Non-destructive actions */}
              {nonDestructive.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => onProfileAction?.(action.id)}
                  className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left text-[13px] text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                >
                  {action.icon && (
                    <Icon name={action.icon} className="h-4 w-4 shrink-0 text-slate-400" />
                  )}
                  {action.label}
                </button>
              ))}

              {/* Destructive actions */}
              {destructive.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => onProfileAction?.(action.id)}
                  className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left text-[13px] text-red-600 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                >
                  {action.icon && (
                    <Icon name={action.icon} className="h-4 w-4 shrink-0 text-red-500" />
                  )}
                  {action.label}
                </button>
              ))}
            </div>
          )}
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
