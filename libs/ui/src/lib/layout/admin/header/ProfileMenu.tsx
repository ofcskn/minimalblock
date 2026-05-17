import { useRef, useState } from 'react';
import { Icon } from '../icons.js';
import { useDismissable } from '../useDismissable.js';
import type { ProfileMenuAction, StoreContext, UserProfile } from '../admin.types.js';

interface ProfileMenuProps {
  user: UserProfile;
  actions: ProfileMenuAction[];
  onProfileAction?: (id: string) => void;
  language?: string;
  onLanguageChange?: (lang: string) => void;
  store?: StoreContext;
  /** Controls dropdown opening direction. Default: 'bottom-end' */
  placement?: 'bottom-end' | 'top-start';
  /** Show only the avatar (no name/chevron). Used in collapsed sidebar. */
  compact?: boolean;
}

const STATUS_DOT: Record<StoreContext['status'], string> = {
  online: 'bg-emerald-500',
  syncing: 'bg-amber-500',
  offline: 'bg-slate-400',
};

const STATUS_BADGE: Record<StoreContext['status'], string> = {
  online: 'bg-emerald-50 text-emerald-700',
  syncing: 'bg-amber-50 text-amber-700',
  offline: 'bg-slate-200 text-slate-600',
};

const STATUS_LABEL: Record<StoreContext['status'], string> = {
  online: 'Çevrimiçi',
  syncing: 'Senkronize ediliyor',
  offline: 'Çevrimdışı',
};

function initialsOf(user: UserProfile): string {
  if (user.initials) return user.initials;
  return user.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? '')
    .join('');
}

export function ProfileMenu({
  user,
  actions,
  onProfileAction,
  language = 'tr',
  onLanguageChange,
  store,
  placement = 'bottom-end',
  compact = false,
}: ProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useDismissable({ open, onDismiss: () => setOpen(false), ref });

  const initials = initialsOf(user);

  const avatar = user.avatarUrl ? (
    <img src={user.avatarUrl} alt="" className="h-7 w-7 shrink-0 rounded-full object-cover" />
  ) : (
    <span
      aria-hidden="true"
      className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[11px] font-semibold text-slate-700"
    >
      {initials}
    </span>
  );

  const dropdownClass =
    placement === 'top-start'
      ? 'absolute left-0 bottom-full z-50 mb-2 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg'
      : 'absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg';

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${user.name}`}
        onClick={() => setOpen((v) => !v)}
        className={
          compact
            ? 'flex min-h-10 w-full items-center justify-center rounded-xl hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500'
            : 'flex min-h-10 w-full items-center gap-2.5 rounded-xl px-2 py-1.5 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500'
        }
      >
        {avatar}
        {!compact && (
          <>
            <span className="min-w-0 flex-1 text-left">
              <span className="block truncate text-[13px] font-medium text-slate-700">
                {user.name}
              </span>
              <span className="block truncate text-[11px] text-slate-500">
                {user.role}
              </span>
            </span>
            <Icon name="chevron-down" className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          </>
        )}
      </button>

      {open && (
        <div role="menu" className={dropdownClass}>
          {/* User info */}
          <div className="border-b border-slate-100 px-3 py-2.5">
            <p className="truncate text-[13px] font-medium text-slate-900">
              {user.name}
            </p>
            <p className="truncate text-[12px] text-slate-500">{user.email}</p>
            <p className="mt-0.5 text-[11px] text-slate-400">{user.role}</p>
          </div>

          {/* Store status card */}
          {store && (
            <div className="border-b border-slate-100 px-3 py-2.5">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                {language === 'tr' ? 'Mağaza durumu' : 'Store status'}
              </p>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      aria-hidden="true"
                      className={'h-2 w-2 shrink-0 rounded-full ' + STATUS_DOT[store.status]}
                    />
                    <span className="truncate text-[13px] font-medium text-slate-900">
                      {store.name}
                    </span>
                  </div>
                  <span
                    className={
                      'shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ' +
                      STATUS_BADGE[store.status]
                    }
                  >
                    {STATUS_LABEL[store.status]}
                  </span>
                </div>
                <p className="mt-1.5 text-[11px] text-slate-500">
                  {store.productCount} ürün senkronize edildi
                  {store.planName ? ` · ${store.planName}` : ''}
                </p>
                {store.localeLabel && (
                  <p className="mt-0.5 text-[11px] text-slate-400">{store.localeLabel}</p>
                )}
              </div>
            </div>
          )}

          {/* Language */}
          <div className="border-b border-slate-100 px-3 py-2.5">
            <p className="mb-1.5 text-[11px] font-medium text-slate-400">
              {language === 'tr' ? 'Dil' : 'Language'}
            </p>
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

          {/* Actions */}
          {actions.map((action) => (
            <button
              key={action.id}
              type="button"
              role="menuitem"
              onClick={() => {
                onProfileAction?.(action.id);
                setOpen(false);
              }}
              className={
                'flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] hover:bg-slate-50 ' +
                (action.destructive ? 'text-red-600' : 'text-slate-700')
              }
            >
              {action.icon && (
                <Icon
                  name={action.icon}
                  className={
                    'h-4 w-4 ' +
                    (action.destructive ? 'text-red-500' : 'text-slate-400')
                  }
                />
              )}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
