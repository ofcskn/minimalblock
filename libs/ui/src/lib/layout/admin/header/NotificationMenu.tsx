import { useMemo, useRef, useState } from 'react';
import { Icon } from '../icons.js';
import { useDismissable } from '../useDismissable.js';
import type { NotificationItem } from '../admin.types.js';

interface NotificationMenuProps {
  notifications: NotificationItem[];
  onNotificationClick?: (id: string) => void;
}

export function NotificationMenu({
  notifications,
  onNotificationClick,
}: NotificationMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useDismissable({ open, onDismiss: () => setOpen(false), ref });

  const unread = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={
          unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'
        }
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="relative inline-flex min-h-10 min-w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
      >
        <Icon name="bell" className="h-[18px] w-[18px]" />
        {unread > 0 && (
          <span
            aria-hidden="true"
            className="absolute right-1.5 top-1.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-semibold text-white ring-2 ring-white"
          >
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-[320px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
            <span className="text-[13px] font-medium text-slate-900">
              Notifications
            </span>
            <span className="text-[11px] text-slate-500">{unread} unread</span>
          </div>
          <ul className="max-h-80 overflow-y-auto py-1">
            {notifications.length === 0 && (
              <li className="px-4 py-6 text-center text-[13px] text-slate-500">
                You're all caught up.
              </li>
            )}
            {notifications.map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    onNotificationClick?.(n.id);
                    setOpen(false);
                  }}
                  className="flex w-full gap-3 px-4 py-2.5 text-left transition-colors hover:bg-slate-50"
                >
                  <span
                    aria-hidden="true"
                    className={
                      'mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ' +
                      (n.read ? 'bg-transparent' : 'bg-indigo-500')
                    }
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-slate-900">
                      {n.title}
                    </p>
                    {n.body && (
                      <p className="mt-0.5 line-clamp-2 text-[12px] text-slate-500">
                        {n.body}
                      </p>
                    )}
                    <p className="mt-1 text-[11px] text-slate-400">{n.ts}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
