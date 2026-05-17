import { useRef, useState } from 'react';
import { Icon } from '../icons.js';
import { useDismissable } from '../useDismissable.js';
import type { HeaderAction } from '../admin.types.js';

interface HeaderActionsProps {
  primary?: HeaderAction;
  overflow?: HeaderAction[];
  onQuickAction?: (actionId: string) => void;
  /** Render the primary action as icon only (tablet/mobile). */
  primaryCompact?: boolean;
}

export function HeaderActions({
  primary,
  overflow = [],
  onQuickAction,
  primaryCompact = false,
}: HeaderActionsProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useDismissable({
    open: menuOpen,
    onDismiss: () => setMenuOpen(false),
    ref: menuRef,
  });

  return (
    <div className="flex items-center gap-1.5">
      {primary && (
        <button
          type="button"
          onClick={() => onQuickAction?.(primary.id)}
          disabled={primary.disabled}
          aria-label={primary.label}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 text-[13px] font-medium text-white transition-colors hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {primary.icon && <Icon name={primary.icon} className="h-4 w-4" />}
          <span className={primaryCompact ? 'sr-only md:not-sr-only' : ''}>
            {primary.label}
          </span>
        </button>
      )}

      {overflow.length > 0 && (
        <div ref={menuRef} className="relative">
          <button
            type="button"
            aria-label="More actions"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-xl border border-transparent text-slate-500 hover:border-slate-200 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          >
            <Icon name="more" className="h-[18px] w-[18px]" />
          </button>
          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
            >
              {overflow.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  role="menuitem"
                  disabled={action.disabled}
                  onClick={() => {
                    onQuickAction?.(action.id);
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {action.icon && (
                    <Icon
                      name={action.icon}
                      className="h-4 w-4 text-slate-400"
                    />
                  )}
                  <span className="flex-1">{action.label}</span>
                  {action.shortcut && (
                    <kbd className="text-[11px] text-slate-400">
                      {action.shortcut}
                    </kbd>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
