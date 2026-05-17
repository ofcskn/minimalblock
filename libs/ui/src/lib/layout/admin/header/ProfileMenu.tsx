import { useRef, useState } from 'react';
import { Icon } from '../icons.js';
import { useDismissable } from '../useDismissable.js';
import type { ProfileMenuAction, UserProfile } from '../admin.types.js';

interface ProfileMenuProps {
  user: UserProfile;
  actions: ProfileMenuAction[];
  onProfileAction?: (id: string) => void;
}

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
}: ProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useDismissable({ open, onDismiss: () => setOpen(false), ref });

  const initials = initialsOf(user);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${user.name}`}
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-10 items-center gap-2 rounded-xl pl-1.5 pr-2.5 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
      >
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt=""
            className="h-7 w-7 rounded-full object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-[11px] font-semibold text-slate-700"
          >
            {initials}
          </span>
        )}
        <Icon name="chevron-down" className="h-3.5 w-3.5 text-slate-400" />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
        >
          <div className="border-b border-slate-100 px-3 py-2.5">
            <p className="truncate text-[13px] font-medium text-slate-900">
              {user.name}
            </p>
            <p className="truncate text-[12px] text-slate-500">{user.email}</p>
            <p className="mt-0.5 text-[11px] text-slate-400">{user.role}</p>
          </div>
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
