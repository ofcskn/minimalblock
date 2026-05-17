import { useRef } from 'react';
import type {
  HeaderAction,
  HeaderSelector,
  ProfileMenuAction,
} from '../admin.types.js';
import { Icon } from '../icons.js';
import { useDismissable } from '../useDismissable.js';
import { HeaderSelectors } from './HeaderSelectors.js';

interface MobileHeaderMenuProps {
  open: boolean;
  storeSelector?: HeaderSelector;
  currencySelector: HeaderSelector;
  languageSelector: HeaderSelector;
  actions?: HeaderAction[];
  profileActions?: ProfileMenuAction[];
  onQuickAction?: (actionId: string) => void;
  onProfileAction?: (actionId: string) => void;
  onStoreChange?: (id: string) => void;
  onCurrencyChange?: (id: string) => void;
  onLanguageChange?: (id: string) => void;
  onClose: () => void;
}

export function MobileHeaderMenu({
  open,
  storeSelector,
  currencySelector,
  languageSelector,
  actions = [],
  profileActions = [],
  onQuickAction,
  onProfileAction,
  onStoreChange,
  onCurrencyChange,
  onLanguageChange,
  onClose,
}: MobileHeaderMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useDismissable({
    open,
    onDismiss: onClose,
    ref: panelRef,
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/40 p-4 md:hidden">
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Header menu"
        className="ml-auto flex min-h-[320px] w-full max-w-sm flex-col rounded-2xl border border-slate-200 bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Workspace controls
            </h2>
            <p className="text-xs text-slate-500">
              Search, switch context, and manage quick actions.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          >
            <Icon name="more" className="h-5 w-5 rotate-90" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-4 py-4">
          <section className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              Preferences
            </p>
            <HeaderSelectors
              store={storeSelector}
              currency={currencySelector}
              language={languageSelector}
              stacked
              visibleCount={3}
              onStoreChange={onStoreChange}
              onCurrencyChange={onCurrencyChange}
              onLanguageChange={onLanguageChange}
            />
          </section>

          {actions.length > 0 && (
            <section className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                Quick actions
              </p>
              <div className="space-y-1">
                {actions.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    disabled={action.disabled}
                    onClick={() => {
                      onQuickAction?.(action.id);
                      onClose();
                    }}
                    className="flex min-h-11 w-full items-center justify-between rounded-xl border border-slate-200 px-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span>{action.label}</span>
                    {action.icon && (
                      <Icon
                        name={action.icon}
                        className="h-4 w-4 text-slate-400"
                      />
                    )}
                  </button>
                ))}
              </div>
            </section>
          )}

          {profileActions.length > 0 && (
            <section className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                Account
              </p>
              <div className="space-y-1">
                {profileActions.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => {
                      onProfileAction?.(action.id);
                      onClose();
                    }}
                    className="flex min-h-11 w-full items-center justify-between rounded-xl px-3 text-left text-sm text-slate-600 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                  >
                    <span>{action.label}</span>
                    {action.icon && (
                      <Icon
                        name={action.icon}
                        className="h-4 w-4 text-slate-400"
                      />
                    )}
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
