import { Fragment } from 'react';
import { Icon } from './icons.js';
import { HeaderBrand } from './header/HeaderBrand.js';
import { HeaderSearch } from './header/HeaderSearch.js';
import { HeaderSelectors } from './header/HeaderSelectors.js';
import { HeaderActions } from './header/HeaderActions.js';
import { NotificationMenu } from './header/NotificationMenu.js';
import { ProfileMenu } from './header/ProfileMenu.js';
import { MobileHeaderMenu } from './header/MobileHeaderMenu.js';
import { useHeaderMenus } from './useHeaderMenus.js';
import type {
  Breadcrumb,
  HeaderAction,
  HeaderSelector,
  NotificationItem,
  ProfileMenuAction,
  SearchScope,
  StoreContext,
  UserProfile,
} from './admin.types.js';

interface AppHeaderProps {
  brand: {
    name: string;
    tagline?: string;
  };
  store?: StoreContext;
  pageTitle?: string;
  onToggleMobile: () => void;
  onToggleSidebar: () => void;
  isSidebarCollapsed: boolean;

  breadcrumbs?: Breadcrumb[];
  storeSelector?: HeaderSelector;
  currencySelector: HeaderSelector;
  languageSelector: HeaderSelector;
  primaryAction?: HeaderAction;
  overflowActions?: HeaderAction[];
  notifications: NotificationItem[];
  user: UserProfile;
  profileActions: ProfileMenuAction[];

  onSearch?: (query: string, scope: SearchScope) => void;
  onQuickAction?: (actionId: string) => void;
  onNotificationClick?: (id: string) => void;
  onProfileAction?: (id: string) => void;
  onStoreChange?: (id: string) => void;
  onCurrencyChange?: (id: string) => void;
  onLanguageChange?: (id: string) => void;
}

export function AppHeader(props: AppHeaderProps) {
  const {
    brand,
    store,
    pageTitle,
    onToggleMobile,
    onToggleSidebar,
    isSidebarCollapsed,
    breadcrumbs,
    storeSelector,
    currencySelector,
    languageSelector,
    primaryAction,
    overflowActions = [],
    notifications,
    user,
    profileActions,
    onSearch,
    onQuickAction,
    onNotificationClick,
    onProfileAction,
    onStoreChange,
    onCurrencyChange,
    onLanguageChange,
  } = props;
  const headerMenus = useHeaderMenus();

  const mobileActions = [
    ...(primaryAction ? [primaryAction] : []),
    ...overflowActions,
  ];

  return (
    <>
      <header
        role="banner"
        className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur"
      >
        <div className="flex min-h-14 items-center gap-2 px-3 sm:px-4 lg:min-h-16 lg:px-6">
          <button
            type="button"
            aria-label="Open navigation"
            onClick={onToggleMobile}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 md:hidden"
          >
            <Icon name="menu" className="h-[18px] w-[18px]" />
          </button>
          <button
            type="button"
            aria-label={
              isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'
            }
            aria-pressed={isSidebarCollapsed}
            onClick={onToggleSidebar}
            className="hidden min-h-11 min-w-11 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 md:inline-flex"
          >
            <Icon name="menu" className="h-[18px] w-[18px]" />
          </button>

          <div className="min-w-0 flex-1">
            <HeaderBrand
              brand={brand}
              store={store}
              pageTitle={pageTitle}
              breadcrumbs={breadcrumbs}
            />
          </div>

          <div className="hidden flex-1 justify-center xl:flex xl:max-w-xl">
            <HeaderSearch variant="inline" onSearch={onSearch} />
          </div>

          <div className="hidden items-center gap-2 xl:flex">
            <HeaderSelectors
              store={storeSelector}
              currency={currencySelector}
              language={languageSelector}
              onStoreChange={onStoreChange}
              onCurrencyChange={onCurrencyChange}
              onLanguageChange={onLanguageChange}
            />
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            <div className="hidden md:block xl:hidden">
              <HeaderSearch variant="mobile" onSearch={onSearch} />
            </div>
            <div className="md:hidden">
              <HeaderSearch
                variant="mobile"
                onSearch={onSearch}
                open={headerMenus.isSearchOpen}
                onOpenChange={(open) => {
                  if (open) headerMenus.openSearch();
                  else headerMenus.closeSearch();
                }}
              />
            </div>

            <div className="hidden sm:block">
              <HeaderActions
                primary={primaryAction}
                overflow={overflowActions}
                onQuickAction={onQuickAction}
                primaryCompact
              />
            </div>

            <NotificationMenu
              notifications={notifications}
              onNotificationClick={onNotificationClick}
            />

            <div
              className="hidden h-6 w-px bg-slate-200 sm:block"
              aria-hidden="true"
            />

            <div className="hidden md:block">
              <ProfileMenu
                user={user}
                actions={profileActions}
                onProfileAction={onProfileAction}
              />
            </div>

            <button
              type="button"
              aria-label="Open workspace menu"
              aria-expanded={headerMenus.isMobileMenuOpen}
              onClick={headerMenus.openMobileMenu}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 md:hidden"
            >
              <Icon name="more" className="h-5 w-5" />
            </button>
          </div>
        </div>

        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="hidden border-t border-slate-100 px-6 py-2 md:block">
            <nav aria-label="Breadcrumb" className="min-w-0">
              <ol className="flex min-w-0 items-center gap-1.5 text-[13px]">
                {breadcrumbs.map((crumb, i) => {
                  const isLast = i === breadcrumbs.length - 1;
                  return (
                    <Fragment key={crumb.id}>
                      <li className="truncate">
                        {crumb.href && !isLast ? (
                          <a
                            href={crumb.href}
                            className="text-slate-500 hover:text-slate-900"
                          >
                            {crumb.label}
                          </a>
                        ) : (
                          <span
                            className={
                              isLast
                                ? 'font-medium text-slate-900'
                                : 'text-slate-500'
                            }
                            aria-current={isLast ? 'page' : undefined}
                          >
                            {crumb.label}
                          </span>
                        )}
                      </li>
                      {!isLast && (
                        <li aria-hidden="true" className="text-slate-300">
                          <Icon name="chevron-right" className="h-3.5 w-3.5" />
                        </li>
                      )}
                    </Fragment>
                  );
                })}
              </ol>
            </nav>
          </div>
        )}
      </header>

      <MobileHeaderMenu
        open={headerMenus.isMobileMenuOpen}
        storeSelector={storeSelector}
        currencySelector={currencySelector}
        languageSelector={languageSelector}
        actions={mobileActions}
        profileActions={profileActions}
        onQuickAction={onQuickAction}
        onProfileAction={onProfileAction}
        onStoreChange={onStoreChange}
        onCurrencyChange={onCurrencyChange}
        onLanguageChange={onLanguageChange}
        onClose={headerMenus.closeMobileMenu}
      />
    </>
  );
}
