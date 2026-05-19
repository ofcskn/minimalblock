import React, { useDeferredValue, useEffect, useId, useMemo, useRef, useState } from 'react';
import { cn } from '../utils/cn.js';
import type {
  HeaderActionItem,
  HeaderBrandConfig,
  HeaderBreadcrumb,
  HeaderNotification,
  HeaderProfileMenu,
  HeaderProps,
  HeaderSearchConfig,
  HeaderSearchResult,
  HeaderSelectorConfig,
  HeaderTheme,
} from './header.types.js';
import { useHeaderState } from './useHeaderState.js';

function HeaderMenuIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17H9.143m9.286 0H5.571c1.002-1.19 1.75-2.811 1.75-4.5V10a4.679 4.679 0 0 1 9.357 0v2.5c0 1.689.748 3.31 1.75 4.5ZM13.5 19a1.5 1.5 0 0 1-3 0" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

function useDismissableLayer<TElement extends HTMLElement>(
  open: boolean,
  onClose: () => void,
) {
  const ref = useRef<TElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose, open]);

  return ref;
}

function getThemeClasses(theme: HeaderTheme) {
  if (theme === 'dark') {
    return {
      badge: 'bg-slate-800 text-slate-200',
      border: 'border-slate-800/90',
      button: 'border-slate-800 bg-slate-900 text-slate-200 hover:border-slate-700 hover:bg-slate-800',
      divider: 'border-slate-800',
      input: 'border-slate-800 bg-slate-900 text-slate-100 placeholder:text-slate-500',
      menu: 'border-slate-800 bg-slate-950/95 text-slate-100 shadow-[0_16px_50px_rgba(2,6,23,0.55)]',
      muted: 'text-slate-400',
      overlay: 'bg-slate-950/70',
      root: 'border-slate-800/80 bg-slate-950/90 text-slate-100 shadow-[0_18px_40px_rgba(2,6,23,0.4)]',
      secondarySurface: 'bg-slate-900/80',
      strong: 'text-white',
      subtle: 'bg-slate-900/80',
    };
  }

  return {
    badge: 'bg-slate-100 text-slate-600',
    border: 'border-slate-200/90',
    button: 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900',
    divider: 'border-slate-200',
    input: 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400',
    menu: 'border-slate-200 bg-white/95 text-slate-900 shadow-[0_16px_50px_rgba(15,23,42,0.12)]',
    muted: 'text-slate-500',
    overlay: 'bg-slate-950/25',
    root: 'border-slate-200/90 bg-white/95 text-slate-900 shadow-[0_18px_36px_rgba(15,23,42,0.08)]',
    secondarySurface: 'bg-slate-50',
    strong: 'text-slate-950',
    subtle: 'bg-white/80',
  };
}

function getNotificationToneClass(notification: HeaderNotification) {
  switch (notification.tone) {
    case 'danger':
      return 'bg-rose-50 text-rose-700 ring-rose-100';
    case 'warning':
      return 'bg-amber-50 text-amber-700 ring-amber-100';
    case 'success':
    case 'order':
      return 'bg-emerald-50 text-emerald-700 ring-emerald-100';
    default:
      return 'bg-sky-50 text-sky-700 ring-sky-100';
  }
}

function shouldRenderForViewport(item: HeaderActionItem, viewport: 'desktop' | 'tablet' | 'mobile') {
  if (!item.visibility || item.visibility === 'all') {
    return true;
  }

  if (viewport === 'desktop') {
    return item.visibility === 'desktop';
  }

  if (viewport === 'tablet') {
    return item.visibility === 'tablet' || item.visibility === 'desktop';
  }

  return item.visibility === 'mobile';
}

function HeaderIconButton({
  ariaLabel,
  badge,
  children,
  className,
  disabled,
  onClick,
}: {
  ariaLabel: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      className={cn(
        'relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      onClick={onClick}
    >
      {children}
      {badge ? (
        <span className="absolute right-2 top-2 inline-flex min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-semibold text-white">
          {badge}
        </span>
      ) : null}
    </button>
  );
}

function HeaderActionButton({
  item,
  onSelect,
  themeClasses,
}: {
  item: HeaderActionItem;
  onSelect?: (actionId: string) => void;
  themeClasses: ReturnType<typeof getThemeClasses>;
}) {
  return (
    <button
      type="button"
      title={item.tooltip}
      disabled={item.isDisabled}
      className={cn(
        'inline-flex min-h-11 items-center gap-2 rounded-2xl border px-4 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        themeClasses.button,
        item.isActive && 'border-indigo-200 bg-indigo-50 text-indigo-700',
      )}
      onClick={() => onSelect?.(item.id)}
    >
      {item.icon ?? <PlusIcon />}
      <span>{item.label}</span>
      {item.badge ? (
        <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-semibold', themeClasses.badge)}>
          {item.badge}
        </span>
      ) : null}
    </button>
  );
}

export function HeaderRoot({
  children,
  className,
  fixed,
  sticky = true,
  theme = 'light',
}: {
  children: React.ReactNode;
  className?: string;
  fixed?: boolean;
  sticky?: boolean;
  theme?: HeaderTheme;
}) {
  const themeClasses = useMemo(() => getThemeClasses(theme), [theme]);

  return (
    <header
      className={cn(
        'z-40 border-b backdrop-blur-xl',
        sticky && !fixed && 'sticky top-0',
        fixed && 'fixed inset-x-0 top-0',
        themeClasses.root,
        className,
      )}
    >
      {children}
    </header>
  );
}

export function HeaderBrand({
  brand,
  disabled,
  onSidebarToggle,
  theme = 'light',
}: {
  brand: HeaderBrandConfig;
  disabled?: boolean;
  onSidebarToggle?: () => void;
  theme?: HeaderTheme;
}) {
  const themeClasses = getThemeClasses(theme);

  return (
    <div className="flex min-w-0 items-center gap-3">
      {onSidebarToggle ? (
        <HeaderIconButton
          ariaLabel="Toggle sidebar"
          className={cn(themeClasses.button, 'lg:hidden')}
          disabled={disabled}
          onClick={onSidebarToggle}
        >
          <HeaderMenuIcon />
        </HeaderIconButton>
      ) : null}

      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-sky-500 to-cyan-400 text-white shadow-lg shadow-indigo-500/20">
        {brand.logo ?? <span className="text-sm font-bold">MB</span>}
      </div>

      <div className="min-w-0">
        <p className={cn('truncate text-sm font-semibold', themeClasses.strong)}>{brand.title}</p>
        {brand.subtitle ? (
          <p className={cn('truncate text-xs', themeClasses.muted)}>{brand.subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}

export function HeaderBreadcrumbs({
  breadcrumbs,
  theme = 'light',
}: {
  breadcrumbs: HeaderBreadcrumb[];
  theme?: HeaderTheme;
}) {
  const themeClasses = getThemeClasses(theme);

  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="hidden md:block">
      <ol className={cn('flex items-center gap-2 text-xs', themeClasses.muted)}>
        {breadcrumbs.map((breadcrumb, index) => (
          <li key={breadcrumb.id} className="flex items-center gap-2">
            {index > 0 ? <span aria-hidden="true">/</span> : null}
            <span className={index === breadcrumbs.length - 1 ? themeClasses.strong : undefined}>
              {breadcrumb.label}
            </span>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function HeaderSearch({
  disabled,
  mobile = false,
  onSearch,
  onSearchSelect,
  query,
  results,
  scope,
  scopes,
  setQuery,
  setScope,
  theme = 'light',
  placeholder,
}: {
  disabled?: boolean;
  mobile?: boolean;
  onSearch?: (query: string, scope: string) => void;
  onSearchSelect?: (result: HeaderSearchResult) => void;
  placeholder: string;
  query: string;
  results: HeaderSearchResult[];
  scope: string;
  scopes: HeaderSearchConfig['scopes'];
  setQuery: (value: string) => void;
  setScope: (value: string) => void;
  theme?: HeaderTheme;
}) {
  const themeClasses = getThemeClasses(theme);
  const inputId = useId();

  return (
    <div className="relative min-w-0 flex-1">
      <form
        className={cn(
          'flex min-h-12 items-stretch overflow-hidden rounded-2xl border shadow-sm',
          themeClasses.input,
        )}
        onSubmit={event => {
          event.preventDefault();
          onSearch?.(query, scope);
        }}
      >
        <label htmlFor={inputId} className="sr-only">
          Search
        </label>
        <div className={cn('flex items-center gap-2 px-4', themeClasses.muted)}>
          <SearchIcon />
        </div>

        <input
          id={inputId}
          type="search"
          value={query}
          disabled={disabled}
          placeholder={placeholder}
          className="min-w-0 flex-1 border-0 bg-transparent px-0 text-sm outline-none"
          onChange={event => setQuery(event.target.value)}
        />

        {scopes && scopes.length > 0 ? (
          <label className={cn('flex items-center border-l px-3 text-sm', themeClasses.border)}>
            <span className="sr-only">Search scope</span>
            <select
              value={scope}
              disabled={disabled}
              className="min-h-12 border-0 bg-transparent pr-6 outline-none"
              onChange={event => setScope(event.target.value)}
            >
              {scopes.map(searchScope => (
                <option key={searchScope.id} value={searchScope.id}>
                  {searchScope.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </form>

      {results.length > 0 && query.trim() ? (
        <div
          className={cn(
            'absolute inset-x-0 top-[calc(100%+0.6rem)] z-20 overflow-hidden rounded-3xl border p-2',
            themeClasses.menu,
          )}
        >
          <ul className="space-y-1">
            {results.map(result => (
              <li key={result.id}>
                <button
                  type="button"
                  className={cn(
                    'flex min-h-11 w-full items-start justify-between rounded-2xl px-3 py-2 text-left transition',
                    theme === 'dark' ? 'hover:bg-slate-900' : 'hover:bg-slate-50',
                  )}
                  onClick={() => onSearchSelect?.(result)}
                >
                  <span>
                    <span className="block text-sm font-medium">{result.label}</span>
                    {result.description ? (
                      <span className={cn('block text-xs', themeClasses.muted)}>
                        {result.description}
                      </span>
                    ) : null}
                  </span>
                  {result.scopeId ? (
                    <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-semibold', themeClasses.badge)}>
                      {result.scopeId}
                    </span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {mobile ? (
        <button
          type="submit"
          form={undefined}
          className="sr-only"
        >
          Search
        </button>
      ) : null}
    </div>
  );
}

export function HeaderStoreSelector({
  disabled,
  selector,
  theme = 'light',
  value,
  onChange,
}: {
  disabled?: boolean;
  selector: HeaderSelectorConfig;
  theme?: HeaderTheme;
  value: string;
  onChange: (value: string) => void;
}) {
  const themeClasses = getThemeClasses(theme);

  return (
    <label
      className={cn(
        'flex min-h-11 items-center gap-2 rounded-2xl border px-3 text-sm shadow-sm',
        themeClasses.input,
      )}
    >
      <span className="sr-only">{selector.label}</span>
      <span className={cn('hidden text-xs font-medium uppercase tracking-[0.18em] xl:inline', themeClasses.muted)}>
        {selector.label}
      </span>
      <select
        value={value}
        disabled={disabled || selector.isDisabled}
        className="min-h-11 border-0 bg-transparent pr-6 outline-none"
        onChange={event => onChange(event.target.value)}
      >
        {selector.options.map(option => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function HeaderNotifications({
  disabled,
  notifications,
  onNotificationClick,
  onNotificationMarkRead,
  theme = 'light',
}: {
  disabled?: boolean;
  notifications: HeaderNotification[];
  onNotificationClick?: (notification: HeaderNotification) => void;
  onNotificationMarkRead?: (notificationId: string) => void;
  theme?: HeaderTheme;
}) {
  const [open, setOpen] = useState(false);
  const themeClasses = getThemeClasses(theme);
  const menuRef = useDismissableLayer<HTMLDivElement>(open, () => setOpen(false));
  const unreadCount = notifications.filter(notification => !notification.isRead).length;

  return (
    <div ref={menuRef} className="relative">
      <HeaderIconButton
        ariaLabel="Open notifications"
        badge={unreadCount > 0 ? unreadCount : undefined}
        className={themeClasses.button}
        disabled={disabled}
        onClick={() => setOpen(currentOpen => !currentOpen)}
      >
        <BellIcon />
      </HeaderIconButton>

      {open ? (
        <div className={cn('absolute right-0 top-[calc(100%+0.75rem)] z-30 w-[min(24rem,90vw)] rounded-3xl border p-2', themeClasses.menu)}>
          <div className="flex items-center justify-between px-3 py-2">
            <div>
              <p className="text-sm font-semibold">Notifications</p>
              <p className={cn('text-xs', themeClasses.muted)}>
                Orders, stock, refunds, and system activity
              </p>
            </div>
            {unreadCount > 0 ? (
              <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-semibold', themeClasses.badge)}>
                {unreadCount} new
              </span>
            ) : null}
          </div>
          <ul className="space-y-1">
            {notifications.map(notification => (
              <li key={notification.id}>
                <div className={cn('rounded-2xl p-3 transition', theme === 'dark' ? 'hover:bg-slate-900' : 'hover:bg-slate-50')}>
                  <button
                    type="button"
                    className="flex w-full items-start gap-3 text-left"
                    onClick={() => {
                      onNotificationClick?.(notification);
                      setOpen(false);
                    }}
                  >
                    <span className={cn('mt-0.5 inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ring-1', getNotificationToneClass(notification))}>
                      {notification.tone ?? 'info'}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium">{notification.title}</span>
                      {notification.description ? (
                        <span className={cn('block text-xs', themeClasses.muted)}>
                          {notification.description}
                        </span>
                      ) : null}
                      {notification.timeLabel ? (
                        <span className={cn('mt-1 block text-[11px]', themeClasses.muted)}>
                          {notification.timeLabel}
                        </span>
                      ) : null}
                    </span>
                  </button>
                  {!notification.isRead ? (
                    <button
                      type="button"
                      className={cn('mt-2 text-xs font-medium text-indigo-600 hover:text-indigo-700')}
                      onClick={() => onNotificationMarkRead?.(notification.id)}
                    >
                      Mark as read
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export function HeaderProfileMenu({
  disabled,
  onProfileAction,
  profile,
  theme = 'light',
}: {
  disabled?: boolean;
  onProfileAction?: (actionId: string) => void;
  profile: HeaderProfileMenu;
  theme?: HeaderTheme;
}) {
  const [open, setOpen] = useState(false);
  const themeClasses = getThemeClasses(theme);
  const menuRef = useDismissableLayer<HTMLDivElement>(open, () => setOpen(false));

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        className={cn(
          'inline-flex min-h-11 items-center gap-3 rounded-2xl border px-3 py-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          themeClasses.button,
        )}
        onClick={() => setOpen(currentOpen => !currentOpen)}
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-900 via-slate-700 to-slate-500 text-sm font-semibold text-white">
          {profile.avatar ?? profile.name.slice(0, 2).toUpperCase()}
        </span>
        <span className="hidden min-w-0 md:block">
          <span className="block truncate text-sm font-semibold">{profile.name}</span>
          {profile.email ? (
            <span className={cn('block truncate text-xs', themeClasses.muted)}>
              {profile.email}
            </span>
          ) : null}
        </span>
        <ChevronDownIcon />
      </button>

      {open ? (
        <div className={cn('absolute right-0 top-[calc(100%+0.75rem)] z-30 w-72 rounded-3xl border p-2', themeClasses.menu)}>
          <div className={cn('rounded-2xl border p-3', themeClasses.divider, themeClasses.secondarySurface)}>
            <p className="text-sm font-semibold">{profile.name}</p>
            {profile.email ? (
              <p className={cn('text-xs', themeClasses.muted)}>{profile.email}</p>
            ) : null}
          </div>
          <ul className="mt-2 space-y-1">
            {profile.actions.map(action => (
              <li key={action.id}>
                <button
                  type="button"
                  disabled={action.isDisabled}
                  className={cn(
                    'flex min-h-11 w-full items-center justify-between rounded-2xl px-3 py-2 text-left text-sm transition disabled:cursor-not-allowed disabled:opacity-50',
                    theme === 'dark' ? 'hover:bg-slate-900' : 'hover:bg-slate-50',
                  )}
                  onClick={() => {
                    onProfileAction?.(action.id);
                    setOpen(false);
                  }}
                >
                  <span>{action.label}</span>
                  {action.badge ? (
                    <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-semibold', themeClasses.badge)}>
                      {action.badge}
                    </span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export function HeaderActions({
  actions,
  disabled,
  onQuickAction,
  theme = 'light',
}: {
  actions: HeaderActionItem[];
  disabled?: boolean;
  onQuickAction?: (actionId: string) => void;
  theme?: HeaderTheme;
}) {
  const themeClasses = getThemeClasses(theme);
  const [open, setOpen] = useState(false);
  const overflowRef = useDismissableLayer<HTMLDivElement>(open, () => setOpen(false));
  const desktopActions = actions.filter(action => shouldRenderForViewport(action, 'desktop')).slice(0, 2);
  const overflowActions = actions.filter(action => shouldRenderForViewport(action, 'tablet')).slice(2);

  return (
    <div className="flex items-center gap-2">
      <div className="hidden xl:flex items-center gap-2">
        {desktopActions.map(action => (
          <HeaderActionButton
            key={action.id}
            item={{ ...action, isDisabled: disabled || action.isDisabled }}
            onSelect={onQuickAction}
            themeClasses={themeClasses}
          />
        ))}
      </div>

      {actions.length > desktopActions.length ? (
        <div ref={overflowRef} className="relative">
          <HeaderIconButton
            ariaLabel="Open quick actions"
            className={themeClasses.button}
            disabled={disabled}
            onClick={() => setOpen(currentOpen => !currentOpen)}
          >
            <PlusIcon />
          </HeaderIconButton>

          {open ? (
            <div className={cn('absolute right-0 top-[calc(100%+0.75rem)] z-30 w-72 rounded-3xl border p-2', themeClasses.menu)}>
              <div className="px-3 py-2">
                <p className="text-sm font-semibold">Quick actions</p>
                <p className={cn('text-xs', themeClasses.muted)}>
                  Shortcuts for product, order, and campaign work
                </p>
              </div>
              <ul className="space-y-1">
                {[...desktopActions, ...overflowActions].map(action => (
                  <li key={action.id}>
                    <button
                      type="button"
                      disabled={disabled || action.isDisabled}
                      className={cn(
                        'flex min-h-11 w-full items-center justify-between rounded-2xl px-3 py-2 text-left text-sm transition disabled:cursor-not-allowed disabled:opacity-50',
                        theme === 'dark' ? 'hover:bg-slate-900' : 'hover:bg-slate-50',
                      )}
                      onClick={() => {
                        onQuickAction?.(action.id);
                        setOpen(false);
                      }}
                    >
                      <span className="flex items-center gap-2">
                        {action.icon ?? <PlusIcon />}
                        {action.label}
                      </span>
                      {action.badge ? (
                        <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-semibold', themeClasses.badge)}>
                          {action.badge}
                        </span>
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function HeaderMobileMenu({
  actions,
  brand,
  breadcrumbs,
  disabled,
  notifications,
  onQuickAction,
  onSelectorChange,
  profile,
  selectors,
  theme = 'light',
  title,
}: {
  actions: HeaderActionItem[];
  brand: HeaderBrandConfig;
  breadcrumbs: HeaderBreadcrumb[];
  disabled?: boolean;
  notifications: HeaderNotification[];
  onQuickAction?: (actionId: string) => void;
  onSelectorChange: (selectorId: string, value: string) => void;
  profile?: HeaderProfileMenu;
  selectors: Array<{ selector: HeaderSelectorConfig; value: string }>;
  theme?: HeaderTheme;
  title: string;
}) {
  const themeClasses = getThemeClasses(theme);

  return (
    <div className={cn('border-t px-4 py-4 md:hidden', themeClasses.border)}>
      <div className={cn('rounded-3xl border p-4', themeClasses.menu)}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
              {brand.title}
            </p>
            <h2 className="mt-2 text-lg font-semibold">{title}</h2>
          </div>
          <span className={cn('rounded-full px-3 py-1 text-xs font-semibold', themeClasses.badge)}>
            {notifications.filter(notification => !notification.isRead).length} alerts
          </span>
        </div>

        {breadcrumbs.length > 0 ? (
          <ol className={cn('mt-4 flex flex-wrap items-center gap-2 text-xs', themeClasses.muted)}>
            {breadcrumbs.map((breadcrumb, index) => (
              <li key={breadcrumb.id} className="flex items-center gap-2">
                {index > 0 ? <span>/</span> : null}
                <span>{breadcrumb.label}</span>
              </li>
            ))}
          </ol>
        ) : null}

        {selectors.length > 0 ? (
          <div className="mt-4 grid gap-3">
            {selectors.map(({ selector, value }) => (
              <HeaderStoreSelector
                key={selector.id}
                disabled={disabled}
                selector={selector}
                theme={theme}
                value={value}
                onChange={nextValue => onSelectorChange(selector.id, nextValue)}
              />
            ))}
          </div>
        ) : null}

        <div className="mt-4 grid gap-2">
          {actions.map(action => (
            <HeaderActionButton
              key={action.id}
              item={{ ...action, isDisabled: disabled || action.isDisabled }}
              onSelect={onQuickAction}
              themeClasses={themeClasses}
            />
          ))}
        </div>

        {profile ? (
          <div className={cn('mt-4 rounded-2xl border p-3', themeClasses.divider)}>
            <p className="text-sm font-semibold">{profile.name}</p>
            {profile.email ? (
              <p className={cn('text-xs', themeClasses.muted)}>{profile.email}</p>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function Header({
  breadcrumbs = [],
  brand,
  className,
  defaultMobileMenuOpen,
  disabled,
  fixed,
  loading,
  mobileMenuOpen,
  notifications = [],
  onCurrencyChange,
  onLanguageChange,
  onMobileMenuOpenChange,
  onNotificationClick,
  onNotificationMarkRead,
  onProfileAction,
  onQuickAction,
  onSearch,
  onSearchSelect,
  onSelectorChange,
  onSidebarToggle,
  onStoreChange,
  profile,
  quickActions = [],
  search,
  selectors = [],
  sticky = true,
  theme = 'light',
  title,
}: HeaderProps) {
  const themeClasses = getThemeClasses(theme);
  const {
    isMobileMenuOpen,
    isMobileSearchOpen,
    query,
    resolvedSelectorValues,
    scope,
    setIsMobileMenuOpen,
    setIsMobileSearchOpen,
    setQuery,
    setScope,
    setSelectorValue,
  } = useHeaderState({
    defaultMobileMenuOpen,
    mobileMenuOpen,
    onMobileMenuOpenChange,
    search,
    selectors,
  });
  const deferredQuery = useDeferredValue(query);
  const visibleSearchResults = (search?.results ?? []).filter(result => {
    if (!deferredQuery.trim()) {
      return false;
    }

    const inScope = !scope || scope === 'all' || !result.scopeId || result.scopeId === scope;
    const haystack = `${result.label} ${result.description ?? ''}`.toLowerCase();

    return inScope && haystack.includes(deferredQuery.trim().toLowerCase());
  });

  const handleSelectorChange = (selectorId: string, value: string) => {
    setSelectorValue(selectorId, value);
    onSelectorChange?.(selectorId, value);

    if (selectorId === 'store') {
      onStoreChange?.(value);
    }

    if (selectorId === 'currency') {
      onCurrencyChange?.(value);
    }

    if (selectorId === 'language') {
      onLanguageChange?.(value);
    }
  };

  return (
    <HeaderRoot
      className={className}
      fixed={fixed}
      sticky={sticky}
      theme={theme}
    >
      <div className="mx-auto flex w-full max-w-[1600px] flex-col">
        <div className="flex min-h-[4.75rem] flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-4">
              <HeaderBrand
                brand={brand}
                disabled={disabled}
                onSidebarToggle={onSidebarToggle}
                theme={theme}
              />
              <div className="min-w-0">
                <HeaderBreadcrumbs breadcrumbs={breadcrumbs} theme={theme} />
                <div className="min-w-0">
                  <h1
                    className={cn(
                      'truncate text-lg font-semibold sm:text-xl',
                      themeClasses.strong,
                      loading && 'animate-pulse opacity-70',
                    )}
                  >
                    {title}
                  </h1>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden min-w-[18rem] flex-1 lg:flex xl:max-w-xl">
            <HeaderSearch
              disabled={disabled || search?.isDisabled || loading}
              onSearch={onSearch}
              onSearchSelect={result => {
                onSearchSelect?.(result);
                setIsMobileSearchOpen(false);
              }}
              placeholder={search?.placeholder ?? 'Search products, orders, customers...'}
              query={query}
              results={visibleSearchResults}
              scope={scope}
              scopes={search?.scopes}
              setQuery={setQuery}
              setScope={setScope}
              theme={theme}
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div className="hidden lg:flex items-center gap-2">
              {selectors.slice(0, 3).map(selector => (
                <HeaderStoreSelector
                  key={selector.id}
                  disabled={disabled || loading}
                  selector={selector}
                  theme={theme}
                  value={resolvedSelectorValues[selector.id] ?? ''}
                  onChange={value => handleSelectorChange(selector.id, value)}
                />
              ))}
            </div>

            <HeaderActions
              actions={quickActions}
              disabled={disabled || loading}
              onQuickAction={onQuickAction}
              theme={theme}
            />

            <div className="lg:hidden">
              <HeaderIconButton
                ariaLabel={isMobileSearchOpen ? 'Close search' : 'Open search'}
                className={themeClasses.button}
                disabled={disabled || search?.isDisabled || loading}
                onClick={() => setIsMobileSearchOpen(currentOpen => !currentOpen)}
              >
                {isMobileSearchOpen ? <CloseIcon /> : <SearchIcon />}
              </HeaderIconButton>
            </div>

            <HeaderNotifications
              disabled={disabled || loading}
              notifications={notifications}
              onNotificationClick={onNotificationClick}
              onNotificationMarkRead={onNotificationMarkRead}
              theme={theme}
            />

            {profile ? (
              <HeaderProfileMenu
                disabled={disabled || loading}
                onProfileAction={onProfileAction}
                profile={profile}
                theme={theme}
              />
            ) : null}

            <div className="md:hidden">
              <HeaderIconButton
                ariaLabel={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                className={themeClasses.button}
                disabled={disabled || loading}
                onClick={() => setIsMobileMenuOpen(currentOpen => !currentOpen)}
              >
                {isMobileMenuOpen ? <CloseIcon /> : <HeaderMenuIcon />}
              </HeaderIconButton>
            </div>
          </div>
        </div>

        {isMobileSearchOpen ? (
          <div className={cn('border-t px-4 py-3 lg:hidden', themeClasses.border)}>
            <HeaderSearch
              disabled={disabled || search?.isDisabled || loading}
              mobile
              onSearch={onSearch}
              onSearchSelect={result => {
                onSearchSelect?.(result);
                setIsMobileSearchOpen(false);
              }}
              placeholder={search?.placeholder ?? 'Search products, orders, customers...'}
              query={query}
              results={visibleSearchResults}
              scope={scope}
              scopes={search?.scopes}
              setQuery={setQuery}
              setScope={setScope}
              theme={theme}
            />
          </div>
        ) : null}

        {isMobileMenuOpen ? (
          <HeaderMobileMenu
            actions={quickActions.filter(action => shouldRenderForViewport(action, 'tablet'))}
            brand={brand}
            breadcrumbs={breadcrumbs}
            disabled={disabled || loading}
            notifications={notifications}
            onQuickAction={actionId => {
              onQuickAction?.(actionId);
              setIsMobileMenuOpen(false);
            }}
            onSelectorChange={handleSelectorChange}
            profile={profile}
            selectors={selectors.map(selector => ({
              selector,
              value: resolvedSelectorValues[selector.id] ?? '',
            }))}
            theme={theme}
            title={title}
          />
        ) : null}
      </div>
    </HeaderRoot>
  );
}
