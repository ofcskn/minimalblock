import { NotificationMenu } from './header/NotificationMenu.js';
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
  const { pageTitle, notifications, onNotificationClick } = props;

  return (
    <header
      role="banner"
      className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur"
    >
      <div className="flex min-h-14 items-center gap-2 px-3 sm:px-4 lg:min-h-16 lg:px-6">
        <div className="min-w-0 flex-1">
          {pageTitle && (
            <h1 className="truncate text-[15px] font-semibold text-slate-900">
              {pageTitle}
            </h1>
          )}
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <NotificationMenu
            notifications={notifications}
            onNotificationClick={onNotificationClick}
          />
        </div>
      </div>
    </header>
  );
}
