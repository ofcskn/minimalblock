import type { CSSProperties } from 'react';
import { AppHeader } from './AppHeader.js';
import { AppSidebar } from './AppSidebar.js';
import { MainContent } from './MainContent.js';
import { ADMIN_TOKENS } from './admin.tokens.js';
import { useSidebarState } from './useSidebarState.js';
import type { DashboardShellProps, SidebarLinkNode } from './admin.types.js';

const NOOP_ACTIVE = () => false;

export function DashboardShell(props: DashboardShellProps) {
  const {
    navigation,
    isActive = NOOP_ACTIVE,
    brand,
    store,
    currency,
    language,
    breadcrumbs,
    pageTitle,
    primaryAction,
    overflowActions,
    notifications,
    user,
    profileActions,
    collapsed,
    defaultCollapsed,
    children,
    onNavigate,
    onSearch,
    onQuickAction,
    onNotificationClick,
    onProfileAction,
    onStoreChange,
    onCurrencyChange,
    onLanguageChange,
    onSidebarCollapseChange,
  } = props;

  const {
    isCollapsed,
    toggleCollapsed,
    isMobileOpen,
    openMobile,
    closeMobile,
  } = useSidebarState({
    collapsed,
    defaultCollapsed,
    onCollapsedChange: onSidebarCollapseChange,
  });

  const storeSelector =
    props.stores && props.stores.length > 0
      ? {
          id: 'store' as const,
          ariaLabel: 'Active store',
          value: store.id,
          options: props.stores,
          priority: 3,
        }
      : undefined;

  const handleNavigate = (link: SidebarLinkNode) => {
    onNavigate?.(link);
    closeMobile();
  };

  return (
    <div
      className="flex h-screen min-h-0 bg-slate-50 text-slate-900 antialiased"
      style={
        {
          '--admin-app-bg': ADMIN_TOKENS.color.appBg,
          '--admin-surface': ADMIN_TOKENS.color.surface,
          '--admin-border': ADMIN_TOKENS.color.border,
          '--admin-header-height': ADMIN_TOKENS.size.headerDesktop,
          '--admin-sidebar-expanded': ADMIN_TOKENS.size.sidebarExpanded,
          '--admin-sidebar-collapsed': ADMIN_TOKENS.size.sidebarCollapsed,
        } as CSSProperties
      }
    >
      {/* Skip link for keyboard users */}
      <a
        href="#admin-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded focus:bg-slate-900 focus:px-3 focus:py-1.5 focus:text-sm focus:text-white"
      >
        Skip to main content
      </a>

      {/* Desktop sidebar */}
      <div className="hidden h-full shrink-0 border-r border-transparent md:block">
        <AppSidebar
          sections={navigation}
          collapsed={isCollapsed}
          onToggle={toggleCollapsed}
          isActive={isActive}
          brand={brand}
          store={store}
          onNavigate={handleNavigate}
          user={user}
          profileActions={profileActions}
          onProfileAction={onProfileAction}
          language={language.value}
          onLanguageChange={onLanguageChange}
        />
      </div>

      {/* Mobile drawer */}
      {isMobileOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
          className="fixed inset-0 z-50 flex md:hidden"
        >
          <div
            className="absolute inset-0 bg-slate-900/40"
            onClick={closeMobile}
            aria-hidden="true"
          />
          <div className="relative z-10 h-full w-[280px] max-w-[85vw] bg-white shadow-xl">
            <AppSidebar
              sections={navigation}
              collapsed={false}
              onToggle={closeMobile}
              isActive={isActive}
              brand={brand}
              store={store}
              onNavigate={handleNavigate}
              hideCollapseToggle
              user={user}
              profileActions={profileActions}
              onProfileAction={onProfileAction}
              language={language.value}
              onLanguageChange={onLanguageChange}
            />
          </div>
        </div>
      )}

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader
          brand={brand}
          store={store}
          pageTitle={pageTitle}
          onToggleMobile={openMobile}
          onToggleSidebar={toggleCollapsed}
          isSidebarCollapsed={isCollapsed}
          breadcrumbs={breadcrumbs}
          storeSelector={storeSelector}
          currencySelector={currency}
          languageSelector={language}
          primaryAction={primaryAction}
          overflowActions={overflowActions}
          notifications={notifications}
          user={user}
          profileActions={profileActions}
          onSearch={onSearch}
          onQuickAction={onQuickAction}
          onNotificationClick={onNotificationClick}
          onProfileAction={onProfileAction}
          onStoreChange={onStoreChange}
          onCurrencyChange={onCurrencyChange}
          onLanguageChange={onLanguageChange}
        />

        <MainContent>{children}</MainContent>
      </div>
    </div>
  );
}
